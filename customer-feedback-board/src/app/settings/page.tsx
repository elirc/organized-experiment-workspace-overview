import { PageHeader } from "@/components/page-header";
import { SiteShell } from "@/components/site-shell";
import { requireRole } from "@/modules/auth/session";
import { getFeedbackDatabase } from "@/modules/feedback/repository";

export default async function SettingsPage() {
  const user = await requireRole(["admin"]);
  const db = await getFeedbackDatabase();

  return (
    <SiteShell user={user}>
      <PageHeader
        title="Admin settings"
        description="Settings pages matter because they reveal whether system-wide configuration has a clean ownership boundary."
      />
      <section className="grid two">
        <article className="card">
          <h3>Portal settings</h3>
          <p className="muted">Portal mode: {db.settings.portalMode}</p>
          <p className="muted">Guest browsing: {String(db.settings.allowGuestBrowsing)}</p>
          <p className="muted">Voting enabled: {String(db.settings.allowVoting)}</p>
        </article>
        <article className="card">
          <h3>Configured statuses</h3>
          <div className="toolbar">
            {db.settings.statuses.map((status) => (
              <span key={status} className="badge blue">
                {status}
              </span>
            ))}
          </div>
        </article>
      </section>
    </SiteShell>
  );
}
