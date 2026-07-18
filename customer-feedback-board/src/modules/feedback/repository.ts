import { readJsonFile, updateJsonFile } from "@/server/json-store";
import type {
  Comment,
  FeedbackDatabase,
  Follow,
  InternalNote,
  MergeHistory,
  ModerationAction,
  ModerationFlag,
  Notification,
  OfficialUpdate,
  Vote
} from "./types";

const DB_PATH = "data/feedback-db.json";

export async function getFeedbackDatabase() {
  return readJsonFile<FeedbackDatabase>(DB_PATH);
}

export async function updateFeedbackDatabase(
  updater: (current: FeedbackDatabase) => FeedbackDatabase | Promise<FeedbackDatabase>
) {
  await updateJsonFile<FeedbackDatabase>(DB_PATH, updater);
}

export async function appendVote(vote: Vote) {
  await updateFeedbackDatabase((db) => ({ ...db, votes: [vote, ...db.votes] }));
}

export async function removeVote(postId: string, userId: string) {
  await updateFeedbackDatabase((db) => ({
    ...db,
    votes: db.votes.filter((vote) => !(vote.postId === postId && vote.userId === userId))
  }));
}

export async function appendComment(comment: Comment) {
  await updateFeedbackDatabase((db) => ({ ...db, comments: [...db.comments, comment] }));
}

export async function appendFollow(follow: Follow) {
  await updateFeedbackDatabase((db) => ({ ...db, follows: [follow, ...db.follows] }));
}

export async function removeFollow(postId: string, userId: string) {
  await updateFeedbackDatabase((db) => ({
    ...db,
    follows: db.follows.filter((follow) => !(follow.postId === postId && follow.userId === userId))
  }));
}

export async function appendModerationFlag(flag: ModerationFlag) {
  await updateFeedbackDatabase((db) => ({ ...db, flags: [flag, ...db.flags] }));
}

export async function appendModerationAction(action: ModerationAction) {
  await updateFeedbackDatabase((db) => ({ ...db, moderationActions: [action, ...db.moderationActions] }));
}

export async function appendMergeHistory(entry: MergeHistory) {
  await updateFeedbackDatabase((db) => ({ ...db, mergeHistory: [entry, ...db.mergeHistory] }));
}

export async function appendOfficialUpdate(update: OfficialUpdate) {
  await updateFeedbackDatabase((db) => ({ ...db, officialUpdates: [update, ...db.officialUpdates] }));
}

export async function appendInternalNote(note: InternalNote) {
  await updateFeedbackDatabase((db) => ({ ...db, internalNotes: [note, ...db.internalNotes] }));
}

export async function appendNotification(notification: Notification) {
  await updateFeedbackDatabase((db) => ({ ...db, notifications: [notification, ...db.notifications] }));
}
