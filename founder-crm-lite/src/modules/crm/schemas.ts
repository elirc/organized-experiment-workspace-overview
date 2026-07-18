import { z } from "zod";

export const leadSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal("")),
  source: z.string().min(2),
  status: z.enum(["New", "Attempting Contact", "Qualified", "Unqualified", "Converted", "Lost"]),
  leadScore: z.coerce.number().min(0).max(100),
  ownerId: z.string().min(1),
  notesSummary: z.string().max(220).optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal(""))
});

export const noteSchema = z.object({
  entityType: z.enum(["lead", "company", "contact", "deal", "task"]),
  entityId: z.string().min(1),
  body: z.string().min(3).max(2000)
});

export const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().max(500).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  priority: z.enum(["Low", "Medium", "High"]),
  ownerId: z.string().min(1),
  linkedEntityType: z.enum(["lead", "company", "contact", "deal", "task"]),
  linkedEntityId: z.string().min(1)
});

export const settingStageSchema = z.object({
  stageName: z.string().min(3).max(40)
});
