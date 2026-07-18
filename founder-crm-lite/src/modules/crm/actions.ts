"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/modules/auth/session";
import { addNote, addPipelineStage, completeTask, convertLead, createLead, createTask } from "./service";
import { leadSchema, noteSchema, settingStageSchema, taskSchema } from "./schemas";

export async function createLeadAction(formData: FormData) {
  const user = await requireUser();
  const parsed = leadSchema.parse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    title: formData.get("title"),
    source: formData.get("source"),
    status: formData.get("status"),
    leadScore: formData.get("leadScore"),
    ownerId: formData.get("ownerId"),
    notesSummary: formData.get("notesSummary"),
    tags: formData.get("tags")
  });

  await createLead(user, parsed);
  revalidatePath("/");
  revalidatePath("/leads");
  redirect("/leads");
}

export async function addNoteAction(formData: FormData) {
  const user = await requireUser();
  const parsed = noteSchema.parse({
    entityType: formData.get("entityType"),
    entityId: formData.get("entityId"),
    body: formData.get("body")
  });

  await addNote(user, parsed);
  revalidatePath(`/${parsed.entityType}s`);
  revalidatePath(`/leads/${parsed.entityId}`);
}

export async function createTaskAction(formData: FormData) {
  const user = await requireUser();
  const parsed = taskSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    priority: formData.get("priority"),
    ownerId: formData.get("ownerId"),
    linkedEntityType: formData.get("linkedEntityType"),
    linkedEntityId: formData.get("linkedEntityId")
  });

  await createTask(user, parsed);
  revalidatePath("/tasks");
  revalidatePath(`/leads/${parsed.linkedEntityId}`);
}

export async function completeTaskAction(formData: FormData) {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") ?? "");
  await completeTask(user, taskId);
  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function convertLeadAction(formData: FormData) {
  const user = await requireUser();
  const leadId = String(formData.get("leadId") ?? "");
  await convertLead(user, leadId);
  revalidatePath("/leads");
  revalidatePath("/companies");
  revalidatePath("/deals");
  redirect(`/leads/${leadId}`);
}

export async function addPipelineStageAction(formData: FormData) {
  const user = await requireUser();
  const parsed = settingStageSchema.parse({
    stageName: formData.get("stageName")
  });

  await addPipelineStage(user, parsed.stageName);
  revalidatePath("/settings");
  revalidatePath("/deals");
}
