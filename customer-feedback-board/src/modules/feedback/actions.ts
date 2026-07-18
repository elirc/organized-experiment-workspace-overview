"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/modules/auth/session";
import { addComment, addInternalNote, addOfficialResponse, changePostStatus, createPost, flagPost, mergeDuplicate, toggleFollow, toggleVote } from "./service";
import { commentSchema, flagSchema, internalNoteSchema, mergeSchema, postSchema, statusSchema } from "./schemas";

export async function createPostAction(formData: FormData) {
  const user = await requireUser();
  const parsed = postSchema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    categoryId: formData.get("categoryId"),
    visibility: formData.get("visibility")
  });

  const slug = await createPost(user, parsed);
  revalidatePath("/");
  redirect(`/post/${slug}`);
}

export async function toggleVoteAction(formData: FormData) {
  const user = await requireUser();
  const postId = String(formData.get("postId") ?? "");
  await toggleVote(user, postId);
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function addCommentAction(formData: FormData) {
  const user = await requireUser();
  const parsed = commentSchema.parse({
    postId: formData.get("postId"),
    body: formData.get("body")
  });

  await addComment(user, parsed.postId, parsed.body);
  revalidatePath("/");
}

export async function toggleFollowAction(formData: FormData) {
  const user = await requireUser();
  const postId = String(formData.get("postId") ?? "");
  await toggleFollow(user, postId);
  revalidatePath("/");
  revalidatePath("/notifications");
}

export async function flagPostAction(formData: FormData) {
  const user = await requireUser();
  const parsed = flagSchema.parse({
    postId: formData.get("postId"),
    reason: formData.get("reason")
  });
  await flagPost(user, parsed.postId, parsed.reason);
  revalidatePath("/moderation");
  revalidatePath("/");
}

export async function addOfficialResponseAction(formData: FormData) {
  const user = await requireRole(["product_manager", "admin"]);
  const parsed = internalNoteSchema.parse({
    postId: formData.get("postId"),
    body: formData.get("body")
  });
  await addOfficialResponse(user, parsed.postId, parsed.body);
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function addInternalNoteAction(formData: FormData) {
  const user = await requireRole(["product_manager", "admin"]);
  const parsed = internalNoteSchema.parse({
    postId: formData.get("postId"),
    body: formData.get("body")
  });
  await addInternalNote(user, parsed.postId, parsed.body);
  revalidatePath("/");
}

export async function changeStatusAction(formData: FormData) {
  const user = await requireRole(["product_manager", "admin"]);
  const parsed = statusSchema.parse({
    postId: formData.get("postId"),
    status: formData.get("status")
  });
  await changePostStatus(user, parsed.postId, parsed.status);
  revalidatePath("/");
  revalidatePath("/roadmap");
  revalidatePath("/dashboard");
}

export async function mergeDuplicateAction(formData: FormData) {
  const user = await requireRole(["moderator", "product_manager", "admin"]);
  const parsed = mergeSchema.parse({
    sourcePostId: formData.get("sourcePostId"),
    targetPostId: formData.get("targetPostId")
  });
  await mergeDuplicate(user, parsed.sourcePostId, parsed.targetPostId);
  revalidatePath("/");
  revalidatePath("/moderation");
}
