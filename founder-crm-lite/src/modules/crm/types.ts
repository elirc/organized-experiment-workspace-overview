import type { AppRole } from "@/modules/auth/demo-users";

export type LeadStatus =
  | "New"
  | "Attempting Contact"
  | "Qualified"
  | "Unqualified"
  | "Converted"
  | "Lost";

export type CompanyStatus = "Prospect" | "Active Opportunity" | "Customer" | "Churned" | "Archived";
export type DealStage =
  | "Discovery"
  | "Qualified Opportunity"
  | "Demo"
  | "Proposal"
  | "Negotiation"
  | "Won"
  | "Lost";

export type TaskStatus = "Open" | "In Progress" | "Completed" | "Skipped";
export type TaskPriority = "Low" | "Medium" | "High";
export type EntityType = "lead" | "company" | "contact" | "deal" | "task";

export type CrmUser = {
  id: string;
  name: string;
  role: AppRole;
};

export type Lead = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  source: string;
  status: LeadStatus;
  leadScore: number;
  ownerId: string;
  companyId: string | null;
  notesSummary: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastContactedAt: string | null;
  convertedAt: string | null;
  archivedAt: string | null;
};

export type Company = {
  id: string;
  name: string;
  website: string | null;
  industry: string;
  employeeCountRange: string;
  location: string;
  ownerId: string;
  annualRevenueRange: string | null;
  accountStatus: CompanyStatus;
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  companyId: string | null;
  ownerId: string;
  tags: string[];
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Deal = {
  id: string;
  name: string;
  companyId: string;
  primaryContactId: string | null;
  ownerId: string;
  stage: DealStage;
  value: number;
  probability: number;
  expectedCloseDate: string | null;
  sourceLeadId: string | null;
  notesSummary: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  lossReason: string | null;
  watcherIds: string[];
};

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  ownerId: string;
  linkedEntityType: EntityType;
  linkedEntityId: string;
  createdAt: string;
  completedAt: string | null;
};

export type Note = {
  id: string;
  entityType: EntityType;
  entityId: string;
  body: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivityEvent = {
  id: string;
  entityType: EntityType;
  entityId: string;
  eventType: string;
  description: string;
  actorId: string;
  createdAt: string;
};

export type SavedView = {
  id: string;
  name: string;
  entityType: "lead" | "deal";
  ownerId: string | null;
  filters: Record<string, string>;
  isShared: boolean;
};

export type CrmSettings = {
  pipelineStages: DealStage[];
  leadSources: string[];
  tags: string[];
};

export type CrmDatabase = {
  users: CrmUser[];
  leads: Lead[];
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  tasks: Task[];
  notes: Note[];
  activityEvents: ActivityEvent[];
  savedViews: SavedView[];
  settings: CrmSettings;
};
