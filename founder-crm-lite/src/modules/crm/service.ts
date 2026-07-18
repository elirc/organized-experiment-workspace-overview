import { randomUUID } from "crypto";
import type { DemoUser } from "@/modules/auth/demo-users";
import { canEditOwnedRecord, canManageAdmin, canWriteOwnedRecords } from "@/modules/auth/session";
import {
  appendActivityEvent,
  appendNote,
  getCrmDatabase,
  saveCompany,
  saveContact,
  saveDeal,
  saveLead,
  saveTask,
  updateCrmDatabase
} from "./repository";
import type {
  ActivityEvent,
  Company,
  Contact,
  CrmDatabase,
  Deal,
  DealStage,
  EntityType,
  Lead,
  LeadStatus,
  Note,
  Task
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function getUserName(db: CrmDatabase, id: string) {
  return db.users.find((user) => user.id === id)?.name ?? "Unknown";
}

function createActivity(entityType: EntityType, entityId: string, eventType: string, description: string, actorId: string): ActivityEvent {
  return {
    id: randomUUID(),
    entityType,
    entityId,
    eventType,
    description,
    actorId,
    createdAt: nowIso()
  };
}

export type LeadFilters = {
  q?: string;
  status?: string;
  owner?: string;
};

export async function getDashboardData(user: DemoUser) {
  const db = await getCrmDatabase();
  const visibleLeads = user.role === "sales_rep" ? db.leads.filter((lead) => lead.ownerId === user.id) : db.leads;
  const visibleDeals = user.role === "sales_rep" ? db.deals.filter((deal) => deal.ownerId === user.id) : db.deals;
  const visibleTasks = user.role === "sales_rep" ? db.tasks.filter((task) => task.ownerId === user.id) : db.tasks;

  return {
    openLeadCount: visibleLeads.filter((lead) => !["Converted", "Lost", "Unqualified"].includes(lead.status)).length,
    qualifiedLeadCount: visibleLeads.filter((lead) => lead.status === "Qualified").length,
    dueTodayCount: visibleTasks.filter((task) => task.status !== "Completed").length,
    openPipelineValue: visibleDeals
      .filter((deal) => !["Won", "Lost"].includes(deal.stage))
      .reduce((total, deal) => total + deal.value, 0),
    recentActivity: db.activityEvents.slice(0, 8).map((event) => ({
      ...event,
      actorName: getUserName(db, event.actorId)
    })),
    pipelineByStage: db.settings.pipelineStages.map((stage) => ({
      stage,
      count: visibleDeals.filter((deal) => deal.stage === stage).length,
      value: visibleDeals.filter((deal) => deal.stage === stage).reduce((total, deal) => total + deal.value, 0)
    })),
    tasks: visibleTasks.slice(0, 6),
    leads: visibleLeads.slice(0, 5),
    settings: db.settings
  };
}

export async function listLeads(user: DemoUser, filters: LeadFilters) {
  const db = await getCrmDatabase();
  const q = filters.q?.trim().toLowerCase();

  return db.leads
    .filter((lead) => (user.role === "sales_rep" ? lead.ownerId === user.id : true))
    .filter((lead) => (filters.status ? lead.status === filters.status : true))
    .filter((lead) => (filters.owner ? lead.ownerId === filters.owner : true))
    .filter((lead) =>
      q
        ? [lead.fullName, lead.email ?? "", lead.source, lead.notesSummary, lead.tags.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(q)
        : true
    )
    .map((lead) => ({
      ...lead,
      ownerName: getUserName(db, lead.ownerId)
    }));
}

export async function getLeadDetail(user: DemoUser, leadId: string) {
  const db = await getCrmDatabase();
  const lead = db.leads.find((entry) => entry.id === leadId);

  if (!lead) {
    return null;
  }

  if (user.role === "sales_rep" && lead.ownerId !== user.id) {
    throw new Error("You do not have access to this lead.");
  }

  return {
    lead,
    ownerName: getUserName(db, lead.ownerId),
    notes: db.notes.filter((note) => note.entityType === "lead" && note.entityId === leadId),
    tasks: db.tasks.filter((task) => task.linkedEntityType === "lead" && task.linkedEntityId === leadId),
    activity: db.activityEvents.filter((event) => event.entityType === "lead" && event.entityId === leadId),
    users: db.users
  };
}

export async function listDeals(user: DemoUser) {
  const db = await getCrmDatabase();
  return db.settings.pipelineStages.map((stage) => ({
    stage,
    deals: db.deals
      .filter((deal) => (user.role === "sales_rep" ? deal.ownerId === user.id : true))
      .filter((deal) => deal.stage === stage)
      .map((deal) => ({
        ...deal,
        companyName: db.companies.find((company) => company.id === deal.companyId)?.name ?? "Unknown company",
        ownerName: getUserName(db, deal.ownerId)
      }))
  }));
}

export async function listCompanies() {
  const db = await getCrmDatabase();
  return db.companies.map((company) => ({
    ...company,
    ownerName: getUserName(db, company.ownerId),
    dealCount: db.deals.filter((deal) => deal.companyId === company.id).length,
    contactCount: db.contacts.filter((contact) => contact.companyId === company.id).length
  }));
}

export async function listTasks(user: DemoUser) {
  const db = await getCrmDatabase();
  return db.tasks
    .filter((task) => (user.role === "sales_rep" ? task.ownerId === user.id : true))
    .map((task) => ({
      ...task,
      ownerName: getUserName(db, task.ownerId)
    }));
}

export async function globalSearch(user: DemoUser, query: string) {
  const db = await getCrmDatabase();
  const q = query.trim().toLowerCase();
  if (!q) {
    return { leads: [], companies: [], deals: [] };
  }

  return {
    leads: db.leads.filter((lead) => [lead.fullName, lead.email ?? "", lead.notesSummary].join(" ").toLowerCase().includes(q)),
    companies: db.companies.filter((company) => [company.name, company.industry, company.description].join(" ").toLowerCase().includes(q)),
    deals: db.deals
      .filter((deal) => (user.role === "sales_rep" ? deal.ownerId === user.id : true))
      .filter((deal) => [deal.name, deal.notesSummary, deal.stage].join(" ").toLowerCase().includes(q))
  };
}

export async function createLead(user: DemoUser, input: {
  fullName: string;
  email?: string;
  phone?: string;
  title?: string;
  source: string;
  status: LeadStatus;
  leadScore: number;
  ownerId: string;
  notesSummary?: string;
  tags?: string;
}) {
  if (!canWriteOwnedRecords(user)) {
    throw new Error("You do not have permission to create leads.");
  }

  if (user.role === "sales_rep" && input.ownerId !== user.id) {
    throw new Error("Sales reps may only create leads they own.");
  }

  const lead: Lead = {
    id: `lead-${randomUUID().slice(0, 8)}`,
    fullName: input.fullName,
    email: input.email || null,
    phone: input.phone || null,
    title: input.title || null,
    source: input.source,
    status: input.status,
    leadScore: input.leadScore,
    ownerId: input.ownerId,
    companyId: null,
    notesSummary: input.notesSummary || "",
    tags: input.tags ? input.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    lastContactedAt: null,
    convertedAt: null,
    archivedAt: null
  };

  await saveLead(lead);
  await appendActivityEvent(createActivity("lead", lead.id, "lead.created", `Lead created for ${lead.fullName}.`, user.id));
}

export async function createTask(user: DemoUser, input: {
  title: string;
  description?: string;
  dueDate?: string;
  priority: "Low" | "Medium" | "High";
  ownerId: string;
  linkedEntityType: EntityType;
  linkedEntityId: string;
}) {
  if (!canWriteOwnedRecords(user)) {
    throw new Error("You do not have permission to create tasks.");
  }

  const task: Task = {
    id: `task-${randomUUID().slice(0, 8)}`,
    title: input.title,
    description: input.description || "",
    dueDate: input.dueDate || null,
    priority: input.priority,
    status: "Open",
    ownerId: input.ownerId,
    linkedEntityType: input.linkedEntityType,
    linkedEntityId: input.linkedEntityId,
    createdAt: nowIso(),
    completedAt: null
  };

  await saveTask(task);
  await appendActivityEvent(createActivity("task", task.id, "task.created", `Task created: ${task.title}.`, user.id));
}

export async function addNote(user: DemoUser, input: { entityType: EntityType; entityId: string; body: string }) {
  if (!canWriteOwnedRecords(user)) {
    throw new Error("You do not have permission to add notes.");
  }

  const note: Note = {
    id: `note-${randomUUID().slice(0, 8)}`,
    entityType: input.entityType,
    entityId: input.entityId,
    body: input.body,
    createdBy: user.id,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  await appendNote(note);
  await appendActivityEvent(createActivity(input.entityType, input.entityId, "note.added", "Note added.", user.id));
}

export async function completeTask(user: DemoUser, taskId: string) {
  const db = await getCrmDatabase();
  const task = db.tasks.find((entry) => entry.id === taskId);

  if (!task) {
    throw new Error("Task not found.");
  }

  if (!canEditOwnedRecord(user, task.ownerId)) {
    throw new Error("You do not have permission to update this task.");
  }

  await saveTask({
    ...task,
    status: "Completed",
    completedAt: nowIso()
  });

  await appendActivityEvent(createActivity("task", task.id, "task.completed", `Task completed: ${task.title}.`, user.id));
}

export async function convertLead(user: DemoUser, leadId: string) {
  const db = await getCrmDatabase();
  const lead = db.leads.find((entry) => entry.id === leadId);

  if (!lead) {
    throw new Error("Lead not found.");
  }

  if (lead.convertedAt) {
    throw new Error("Lead has already been converted.");
  }

  if (!canEditOwnedRecord(user, lead.ownerId)) {
    throw new Error("You do not have permission to convert this lead.");
  }

  const company: Company = {
    id: `company-${randomUUID().slice(0, 8)}`,
    name: `${lead.fullName.split(" ")[0]} Advisory Group`,
    website: null,
    industry: "Pending Qualification",
    employeeCountRange: "11-50",
    location: "Unknown",
    ownerId: lead.ownerId,
    annualRevenueRange: null,
    accountStatus: "Active Opportunity",
    tags: lead.tags,
    description: lead.notesSummary,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  const [firstName, ...rest] = lead.fullName.split(" ");
  const contact: Contact = {
    id: `contact-${randomUUID().slice(0, 8)}`,
    firstName,
    lastName: rest.join(" ") || "Contact",
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    jobTitle: lead.title,
    companyId: company.id,
    ownerId: lead.ownerId,
    tags: lead.tags,
    isPrimary: true,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  const deal: Deal = {
    id: `deal-${randomUUID().slice(0, 8)}`,
    name: `${lead.fullName} Expansion`,
    companyId: company.id,
    primaryContactId: contact.id,
    ownerId: lead.ownerId,
    stage: "Discovery",
    value: 18000 + lead.leadScore * 120,
    probability: 25,
    expectedCloseDate: null,
    sourceLeadId: lead.id,
    notesSummary: lead.notesSummary,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    closedAt: null,
    lossReason: null,
    watcherIds: []
  };

  await saveCompany(company);
  await saveContact(contact);
  await saveDeal(deal);
  await saveLead({
    ...lead,
    status: "Converted",
    companyId: company.id,
    convertedAt: nowIso(),
    updatedAt: nowIso()
  });
  await appendActivityEvent(createActivity("lead", lead.id, "lead.converted", `Lead converted into company ${company.name} and new deal ${deal.name}.`, user.id));
}

export async function addPipelineStage(user: DemoUser, stageName: string) {
  if (!canManageAdmin(user)) {
    throw new Error("Only admins can manage pipeline stages.");
  }

  await updateCrmDatabase((db) => {
    if (db.settings.pipelineStages.includes(stageName as DealStage)) {
      return db;
    }

    return {
      ...db,
      settings: {
        ...db.settings,
        pipelineStages: [...db.settings.pipelineStages.slice(0, -2), stageName as DealStage, ...db.settings.pipelineStages.slice(-2)]
      }
    };
  });
}

export async function exportableLeads(user: DemoUser) {
  const db = await getCrmDatabase();
  return db.leads
    .filter((lead) => (user.role === "sales_rep" ? lead.ownerId === user.id : true))
    .map((lead) => ({
      id: lead.id,
      fullName: lead.fullName,
      email: lead.email ?? "",
      source: lead.source,
      status: lead.status,
      owner: getUserName(db, lead.ownerId),
      score: lead.leadScore.toString()
    }));
}
