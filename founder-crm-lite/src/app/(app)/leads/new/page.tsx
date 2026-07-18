import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/modules/auth/session";
import { createLeadAction } from "@/modules/crm/actions";
import { getCrmDatabase } from "@/modules/crm/repository";

export default async function NewLeadPage() {
  const user = await requireUser();
  const db = await getCrmDatabase();
  const selectableOwners = user.role === "sales_rep" ? db.users.filter((entry) => entry.id === user.id) : db.users;

  return (
    <section className="grid">
      <PageHeader
        title="Create lead"
        description="This form intentionally stays thin. Validation and authorization live at the server boundary and service layer."
      />

      <article className="panel">
        <form action={createLeadAction} className="form-grid columns-2">
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" />
          </div>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" name="title" />
          </div>
          <div className="field">
            <label htmlFor="source">Source</label>
            <select id="source" name="source" defaultValue={db.settings.leadSources[0]}>
              {db.settings.leadSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="New">
              <option>New</option>
              <option>Attempting Contact</option>
              <option>Qualified</option>
              <option>Unqualified</option>
              <option>Converted</option>
              <option>Lost</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="leadScore">Lead score</label>
            <input id="leadScore" name="leadScore" type="number" min="0" max="100" defaultValue={65} />
          </div>
          <div className="field">
            <label htmlFor="ownerId">Owner</label>
            <select id="ownerId" name="ownerId" defaultValue={user.id}>
              {selectableOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="notesSummary">Notes summary</label>
            <textarea id="notesSummary" name="notesSummary" rows={4} />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="tags">Tags</label>
            <input id="tags" name="tags" placeholder="finance, onboarding, expansion" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="button" type="submit">
              Save lead
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}
