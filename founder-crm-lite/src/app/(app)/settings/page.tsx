import { PageHeader } from "@/components/page-header";
import { requireUser, canManageAdmin } from "@/modules/auth/session";
import { addPipelineStageAction } from "@/modules/crm/actions";
import { getCrmDatabase } from "@/modules/crm/repository";

export default async function SettingsPage() {
  const user = await requireUser();
  const db = await getCrmDatabase();
  const isAdmin = canManageAdmin(user);

  return (
    <section className="grid">
      <PageHeader
        title="Admin settings"
        description="Admin pages are worth studying because permission checks should be obvious in both routing and mutation paths."
      />

      <section className="two-column">
        <article className="panel">
          <h3>Pipeline stages</h3>
          <div className="list">
            {db.settings.pipelineStages.map((stage) => (
              <div key={stage} className="list-item">
                {stage}
              </div>
            ))}
          </div>

          {isAdmin ? (
            <form action={addPipelineStageAction} className="form-grid" style={{ marginTop: 18 }}>
              <div className="field">
                <label htmlFor="stageName">Add stage</label>
                <input id="stageName" name="stageName" />
              </div>
              <button type="submit" className="button-secondary">
                Save stage
              </button>
            </form>
          ) : (
            <p className="subtle">Only founders/admins can change settings.</p>
          )}
        </article>

        <article className="panel">
          <h3>Users and defaults</h3>
          <div className="list">
            {db.users.map((entry) => (
              <div key={entry.id} className="list-item">
                <strong>{entry.name}</strong>
                <p className="subtle">{entry.role}</p>
              </div>
            ))}
          </div>
          <h3 style={{ marginTop: 24 }}>Lead sources</h3>
          <div className="stack">
            {db.settings.leadSources.map((source) => (
              <span key={source} className="badge blue">
                {source}
              </span>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}
