import { updateJsonFile, readJsonFile } from "@/server/json-store";
import type { ActivityEvent, Company, Contact, CrmDatabase, Deal, Lead, Note, Task } from "./types";

const DB_PATH = "data/crm-db.json";

export async function getCrmDatabase() {
  return readJsonFile<CrmDatabase>(DB_PATH);
}

export async function updateCrmDatabase(updater: (current: CrmDatabase) => CrmDatabase | Promise<CrmDatabase>) {
  await updateJsonFile<CrmDatabase>(DB_PATH, updater);
}

export async function appendActivityEvent(event: ActivityEvent) {
  await updateCrmDatabase((db) => ({
    ...db,
    activityEvents: [event, ...db.activityEvents]
  }));
}

export async function appendNote(note: Note) {
  await updateCrmDatabase((db) => ({
    ...db,
    notes: [note, ...db.notes]
  }));
}

export async function saveLead(nextLead: Lead) {
  await updateCrmDatabase((db) => {
    const existing = db.leads.some((lead) => lead.id === nextLead.id);
    return {
      ...db,
      leads: existing ? db.leads.map((lead) => (lead.id === nextLead.id ? nextLead : lead)) : [nextLead, ...db.leads]
    };
  });
}

export async function saveTask(nextTask: Task) {
  await updateCrmDatabase((db) => {
    const existing = db.tasks.some((task) => task.id === nextTask.id);
    return {
      ...db,
      tasks: existing ? db.tasks.map((task) => (task.id === nextTask.id ? nextTask : task)) : [nextTask, ...db.tasks]
    };
  });
}

export async function saveCompany(nextCompany: Company) {
  await updateCrmDatabase((db) => ({
    ...db,
    companies: [nextCompany, ...db.companies]
  }));
}

export async function saveContact(nextContact: Contact) {
  await updateCrmDatabase((db) => ({
    ...db,
    contacts: [nextContact, ...db.contacts]
  }));
}

export async function saveDeal(nextDeal: Deal) {
  await updateCrmDatabase((db) => ({
    ...db,
    deals: [nextDeal, ...db.deals]
  }));
}
