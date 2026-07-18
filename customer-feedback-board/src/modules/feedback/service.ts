import { randomUUID } from "crypto";
import type { DemoUser } from "@/modules/auth/demo-users";
import { canManageRoadmap, canManageSettings, canModerate } from "@/modules/auth/session";
import {
  appendComment,
  appendFollow,
  appendInternalNote,
  appendMergeHistory,
  appendModerationAction,
  appendModerationFlag,
  appendNotification,
  appendOfficialUpdate,
  appendVote,
  getFeedbackDatabase,
  removeFollow,
  removeVote,
  updateFeedbackDatabase
} from "./repository";
import type {
  FeedbackDatabase,
  FeedbackPost,
  FlagReason,
  InternalNote,
  ModerationAction,
  OfficialUpdate,
  PostStatus,
  PostVisibility
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getUserName(db: FeedbackDatabase, userId: string) {
  return db.users.find((user) => user.id === userId)?.name ?? "Unknown";
}

function postVisibleToUser(post: FeedbackPost, user: DemoUser | null) {
  if (post.hiddenAt) {
    return false;
  }

  if (post.visibility === "public") {
    return true;
  }

  return user ? canModerate(user) || canManageRoadmap(user) || canManageSettings(user) : false;
}

export async function getBoardHome(user: DemoUser | null, filters: { q?: string; status?: string; category?: string }) {
  const db = await getFeedbackDatabase();
  const q = filters.q?.trim().toLowerCase();

  const posts = db.posts
    .filter((post) => postVisibleToUser(post, user))
    .filter((post) => (post.duplicateOfPostId ? false : true))
    .filter((post) => (filters.status ? post.status === filters.status : true))
    .filter((post) => (filters.category ? post.categoryId === filters.category : true))
    .filter((post) =>
      q ? [post.title, post.body].join(" ").toLowerCase().includes(q) : true
    )
    .map((post) => ({
      ...post,
      categoryName: db.categories.find((category) => category.id === post.categoryId)?.name ?? "Unknown",
      authorName: getUserName(db, post.authorId),
      voteCount: db.votes.filter((vote) => vote.postId === post.id).length,
      commentCount: db.comments.filter((comment) => comment.postId === post.id && !comment.isHidden).length,
      tagNames: post.tagIds
        .map((tagId) => db.tags.find((tag) => tag.id === tagId)?.name)
        .filter((entry): entry is string => Boolean(entry))
    }))
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));

  return {
    posts,
    categories: db.categories.sort((a, b) => a.displayOrder - b.displayOrder),
    metrics: {
      totalPosts: posts.length,
      plannedOrBuilding: posts.filter((post) => ["Planned", "In Progress"].includes(post.status)).length,
      shipped: posts.filter((post) => post.status === "Shipped").length
    }
  };
}

export async function getPostDetail(user: DemoUser | null, slug: string) {
  const db = await getFeedbackDatabase();
  const post = db.posts.find((entry) => entry.slug === slug);

  if (!post || !postVisibleToUser(post, user)) {
    return null;
  }

  return {
    post,
    categoryName: db.categories.find((category) => category.id === post.categoryId)?.name ?? "Unknown",
    authorName: getUserName(db, post.authorId),
    voteCount: db.votes.filter((vote) => vote.postId === post.id).length,
    hasVoted: user ? db.votes.some((vote) => vote.postId === post.id && vote.userId === user.id) : false,
    isFollowing: user ? db.follows.some((follow) => follow.postId === post.id && follow.userId === user.id) : false,
    comments: db.comments
      .filter((comment) => comment.postId === post.id && (!comment.isHidden || canModerate(user)))
      .map((comment) => ({
        ...comment,
        authorName: getUserName(db, comment.authorId)
      })),
    officialUpdates: db.officialUpdates.filter((update) => update.postId === post.id).map((update) => ({
      ...update,
      authorName: getUserName(db, update.createdBy)
    })),
    internalNotes: canManageRoadmap(user) || canManageSettings(user)
      ? db.internalNotes.filter((note) => note.postId === post.id).map((note) => ({
          ...note,
          authorName: getUserName(db, note.createdBy)
        }))
      : [],
    moderationActions: db.moderationActions
      .filter((action) => action.postId === post.id)
      .map((action) => ({ ...action, actorName: getUserName(db, action.actorId) }))
  };
}

export async function createPost(user: DemoUser, input: {
  title: string;
  body: string;
  categoryId: string;
  visibility: PostVisibility;
}) {
  const db = await getFeedbackDatabase();
  const post: FeedbackPost = {
    id: `post-${randomUUID().slice(0, 8)}`,
    title: input.title,
    slug: slugify(input.title),
    body: input.body,
    categoryId: input.categoryId,
    tagIds: [],
    authorId: user.id,
    status: "Open",
    visibility: user.role === "customer" ? "public" : input.visibility,
    duplicateOfPostId: null,
    commentsLocked: false,
    hiddenAt: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    lastActivityAt: nowIso()
  };

  await updateFeedbackDatabase((current) => ({
    ...current,
    posts: [post, ...current.posts]
  }));

  return post.slug;
}

export async function toggleVote(user: DemoUser, postId: string) {
  const db = await getFeedbackDatabase();
  const post = db.posts.find((entry) => entry.id === postId);
  if (!post || post.duplicateOfPostId) {
    throw new Error("Post not available for voting.");
  }

  const existingVote = db.votes.find((vote) => vote.postId === postId && vote.userId === user.id);
  if (existingVote) {
    await removeVote(postId, user.id);
  } else {
    await appendVote({
      id: `vote-${randomUUID().slice(0, 8)}`,
      postId,
      userId: user.id,
      createdAt: nowIso()
    });
  }
}

export async function addComment(user: DemoUser, postId: string, body: string) {
  const db = await getFeedbackDatabase();
  const post = db.posts.find((entry) => entry.id === postId);
  if (!post || post.commentsLocked) {
    throw new Error("Comments are not available for this post.");
  }

  await appendComment({
    id: `comment-${randomUUID().slice(0, 8)}`,
    postId,
    authorId: user.id,
    body,
    parentCommentId: null,
    isHidden: false,
    createdAt: nowIso(),
    updatedAt: nowIso()
  });
}

export async function toggleFollow(user: DemoUser, postId: string) {
  const db = await getFeedbackDatabase();
  const existing = db.follows.find((follow) => follow.postId === postId && follow.userId === user.id);
  if (existing) {
    await removeFollow(postId, user.id);
  } else {
    await appendFollow({
      id: `follow-${randomUUID().slice(0, 8)}`,
      postId,
      userId: user.id,
      createdAt: nowIso()
    });
  }
}

export async function flagPost(user: DemoUser, postId: string, reason: FlagReason) {
  await appendModerationFlag({
    id: `flag-${randomUUID().slice(0, 8)}`,
    postId,
    createdBy: user.id,
    reason,
    createdAt: nowIso(),
    status: "open"
  });
}

export async function addOfficialResponse(user: DemoUser, postId: string, body: string) {
  if (!canManageRoadmap(user)) {
    throw new Error("Only PMs and admins may add official responses.");
  }

  const update: OfficialUpdate = {
    id: `update-${randomUUID().slice(0, 8)}`,
    postId,
    body,
    createdBy: user.id,
    createdAt: nowIso()
  };

  await appendOfficialUpdate(update);

  const db = await getFeedbackDatabase();
  const followers = db.follows.filter((follow) => follow.postId === postId);
  for (const follow of followers) {
    await appendNotification({
      id: `notif-${randomUUID().slice(0, 8)}`,
      userId: follow.userId,
      title: "Official update added",
      body,
      isRead: false,
      createdAt: nowIso()
    });
  }
}

export async function addInternalNote(user: DemoUser, postId: string, body: string) {
  if (!canManageRoadmap(user)) {
    throw new Error("Only PMs and admins may add internal notes.");
  }

  const note: InternalNote = {
    id: `internal-${randomUUID().slice(0, 8)}`,
    postId,
    body,
    createdBy: user.id,
    createdAt: nowIso()
  };

  await appendInternalNote(note);
}

export async function changePostStatus(user: DemoUser, postId: string, status: PostStatus) {
  if (!canManageRoadmap(user)) {
    throw new Error("Only PMs and admins may change status.");
  }

  await updateFeedbackDatabase((db) => ({
    ...db,
    posts: db.posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            status,
            updatedAt: nowIso(),
            lastActivityAt: nowIso()
          }
        : post
    )
  }));

  const db = await getFeedbackDatabase();
  const post = db.posts.find((entry) => entry.id === postId);
  if (!post) {
    return;
  }

  const action: ModerationAction = {
    id: `mod-${randomUUID().slice(0, 8)}`,
    postId,
    actionType: "status.changed",
    actorId: user.id,
    details: `Status changed to ${status}.`,
    createdAt: nowIso()
  };
  await appendModerationAction(action);

  const followers = db.follows.filter((follow) => follow.postId === postId);
  for (const follow of followers) {
    await appendNotification({
      id: `notif-${randomUUID().slice(0, 8)}`,
      userId: follow.userId,
      title: `${post.title} moved to ${status}`,
      body: "A product-team status update was posted.",
      isRead: false,
      createdAt: nowIso()
    });
  }
}

export async function mergeDuplicate(user: DemoUser, sourcePostId: string, targetPostId: string) {
  if (!canModerate(user)) {
    throw new Error("Only moderators, PMs, or admins may merge duplicates.");
  }

  if (sourcePostId === targetPostId) {
    throw new Error("Choose different source and target posts.");
  }

  await updateFeedbackDatabase((db) => ({
    ...db,
    posts: db.posts.map((post) =>
      post.id === sourcePostId
        ? { ...post, status: "Duplicate", duplicateOfPostId: targetPostId, updatedAt: nowIso(), lastActivityAt: nowIso() }
        : post
    )
  }));

  await appendMergeHistory({
    id: `merge-${randomUUID().slice(0, 8)}`,
    sourcePostId,
    targetPostId,
    actorId: user.id,
    createdAt: nowIso()
  });
}

export async function getDashboardData(user: DemoUser) {
  if (!canModerate(user)) {
    throw new Error("Dashboard is limited to moderators, PMs, and admins.");
  }

  const db = await getFeedbackDatabase();
  return {
    topPosts: db.posts
      .filter((post) => post.visibility === "public" && !post.hiddenAt)
      .map((post) => ({
        ...post,
        voteCount: db.votes.filter((vote) => vote.postId === post.id).length
      }))
      .sort((a, b) => b.voteCount - a.voteCount)
      .slice(0, 5),
    postsByStatus: db.settings.statuses.map((status) => ({
      status,
      count: db.posts.filter((post) => post.status === status).length
    })),
    openFlags: db.flags.filter((flag) => flag.status === "open").length,
    recentModeration: db.moderationActions.slice(0, 6).map((action) => ({
      ...action,
      actorName: getUserName(db, action.actorId)
    }))
  };
}

export async function getModerationCenter(user: DemoUser) {
  if (!canModerate(user)) {
    throw new Error("Moderation center is restricted.");
  }

  const db = await getFeedbackDatabase();
  return {
    posts: db.posts.filter((post) => !post.hiddenAt),
    flags: db.flags.filter((flag) => flag.status === "open").map((flag) => ({
      ...flag,
      postTitle: db.posts.find((post) => post.id === flag.postId)?.title ?? "Unknown post",
      createdByName: getUserName(db, flag.createdBy)
    }))
  };
}

export async function getNotifications(user: DemoUser) {
  const db = await getFeedbackDatabase();
  return db.notifications.filter((notification) => notification.userId === user.id);
}
