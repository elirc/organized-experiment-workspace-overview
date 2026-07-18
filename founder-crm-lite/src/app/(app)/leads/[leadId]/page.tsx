import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { TimelineList } from "@/components/timeline-list";
import { requireUser, canEditOwnedRecord, canWriteOwnedRecords } from "@/modules/auth/session";
import { addNoteAction, convertLeadAction, createTaskAction } from "@/modules/crm/actions";
import { getLeadDetail } from "@/modules/crm/service";
import { formatDate, formatDateTime } from "@/modules/shared/format";

export default async function LeadDetailPage({ params }: { params: Promise<{ leadId: string }> }) {
  const user = await requireUser();
  const { leadId } = await params;
  const detail = await getLeadDetail(user, leadId);

  if (!detail) {
    notFound();
  }

  const canEdit = canEditOwnedRecord(user, detail.lead.ownerId);
  const canWrite = canWriteOwnedRecords(user);

  return (
    <section className="grid">
      <PageHeader
        title={detail.lead.fullName}
        description="Lead detail pages are where CRUD apps usually start mixing timeline, notes, tasks, and workflow mutations in one place. Watch how services keep that manageable."
        actions={
          <>
            <StatusBadge value={detail.lead.status} />
            {canEdit && !detail.lead.convertedAt ? (
              <form action={convertLeadAction}>
                <input type="hidden" name="leadId" value={detail.lead.id} />
                <button className="button" type="submit">
                  Convert lead
                </button>
              </form>
            ) : null}
          </>
        }
      />

      <section className="two-column">
        <article className="panel">
          <h3>Lead summary</h3>
          <div className="detail-meta">
            <span className="badge blue">Score {detail.lead.leadScore}</span>
            <span className="badge blue">Owner {detail.ownerName}</span>
            <span className="badge blue">Created {formatDate(detail.lead.createdAt)}</span>
          </div>
          <p>{detail.lead.notesSummary || "No summary provided."}</p>
          <div className="stack">
            {detail.lead.tags.map((tag) => (
              <span key={tag} className="badge blue">
                {tag}
              </span>
            ))}
          </div>
          <div className="panel" style={{ marginTop: 18, background: "var(--surface-alt)" }}>
            <strong>Qualification details</strong>
            <p className="subtle">Email: {detail.lead.email ?? "Not captured"} · Phone: {detail.lead.phone ?? "Not captured"}</p>
            <p className="subtle">
              Last contacted: {formatDate(detail.lead.lastContactedAt)} · Converted:{" "}
              {detail.lead.convertedAt ? formatDateTime(detail.lead.convertedAt) : "Not yet"}
            </p>
          </div>
        </article>

        <article className="panel">
          <h3>Follow-up tasks</h3>
          <div className="list">
            {detail.tasks.map((task) => (
              <div key={task.id} className="list-item">
                <strong>{task.title}</strong>
                <p className="subtle">{task.description}</p>
                <StatusBadge value={task.status} />
              </div>
            ))}
          </div>

          {canWrite ? (
            <form action={createTaskAction} className="form-grid" style={{ marginTop: 18 }}>
              <input type="hidden" name="linkedEntityType" value="lead" />
              <input type="hidden" name="linkedEntityId" value={detail.lead.id} />
              <input type="hidden" name="ownerId" value={detail.lead.ownerId} />
              <div className="field">
                <label htmlFor="title">Task title</label>
                <input id="title" name="title" required />
              </div>
              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={3} />
              </div>
              <div className="form-grid columns-2">
                <div className="field">
                  <label htmlFor="dueDate">Due date</label>
                  <input id="dueDate" name="dueDate" type="datetime-local" />
                </div>
                <div className="field">
                  <label htmlFor="priority">Priority</label>
                  <select id="priority" name="priority" defaultValue="Medium">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <button className="button-secondary" type="submit">
                Add task
              </button>
            </form>
          ) : null}
        </article>
      </section>

      <section className="two-column">
        <article className="panel">
          <h3>Notes</h3>
          <TimelineList
            items={detail.notes.map((note) => ({
              id: note.id,
              title: "Note added",
              body: note.body,
              createdAt: note.createdAt
            }))}
          />
          {canWrite ? (
            <form action={addNoteAction} className="form-grid" style={{ marginTop: 18 }}>
              <input type="hidden" name="entityType" value="lead" />
              <input type="hidden" name="entityId" value={detail.lead.id} />
              <div className="field">
                <label htmlFor="body">Add note</label>
                <textarea id="body" name="body" rows={4} required />
              </div>
              <button className="button-secondary" type="submit">
                Save note
              </button>
            </form>
          ) : null}
        </article>

        <article className="panel">
          <h3>Activity timeline</h3>
          <TimelineList
            items={detail.activity.map((event) => ({
              id: event.id,
              title: event.description,
              createdAt: event.createdAt
            }))}
          />
        </article>
      </section>
    </section>
  );
}
