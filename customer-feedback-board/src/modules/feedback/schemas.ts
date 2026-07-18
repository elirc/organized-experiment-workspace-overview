import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(4).max(120),
  body: z.string().min(10).max(4000),
  categoryId: z.string().min(1),
  visibility: z.enum(["public", "internal"])
});

export const commentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().min(2).max(1200)
});

export const internalNoteSchema = z.object({
  postId: z.string().min(1),
  body: z.string().min(3).max(1200)
});

export const statusSchema = z.object({
  postId: z.string().min(1),
  status: z.enum(["Open", "Under Review", "Planned", "In Progress", "Shipped", "Declined", "Duplicate"])
});

export const mergeSchema = z.object({
  sourcePostId: z.string().min(1),
  targetPostId: z.string().min(1)
});

export const flagSchema = z.object({
  postId: z.string().min(1),
  reason: z.enum(["spam", "abuse", "duplicate", "off-topic", "low-quality"])
});
