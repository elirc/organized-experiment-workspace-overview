import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/modules/auth/session";
import { getDashboardData } from "@/modules/crm/service";
import { formatDateTime, formatMoney } from "@/modules/shared/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user);

  return (
    <>
      <div className="topbar">
        <div>
          <strong>Revenue Operating System</strong>
          <p className="subtle" style={{ margin: "4px 0 0" }}>
            Use this dashboard to spot overdue follow-ups, pipeline concentration, and recent customer signals.
          </p>
        </div>
        <div className="stack">
          <Link href="/leads/new" className="button">
            New lead
          </Link>
          <Link href="/api/exports/leads" className="button-secondary">
            Export leads CSV
          </Link>
        </div>
      </div>

      <PageHeader
        title="Dashboard"
        description="A realistic internal-sales home screen should help a founder or rep decide where to spend time next."
      />

      <section className="grid metrics">
        <article className="metric">
          <span className="subtle">Open leads</span>
          <strong>{data.openLeadCount}</strong>
        </article>
        <article className="metric">
          <span className="subtle">Qualified leads</span>
          <strong>{data.qualifiedLeadCount}</strong>
        </article>
        <article className="metric">
          <span className="subtle">Tasks due / active</span>
          <strong>{data.dueTodayCount}</strong>
        </article>
        <article className="metric">
          <span className="subtle">Open pipeline</span>
          <strong>{formatMoney(data.openPipelineValue)}</strong>
        </article>
      </section>

      <section className="two-column">
        <article className="panel">
          <h3>Pipeline by stage</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Count</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {data.pipelineByStage.map((entry) => (
                  <tr key={entry.stage}>
                    <td>
                      <StatusBadge value={entry.stage} />
                    </td>
                    <td>{entry.count}</td>
                    <td>{formatMoney(entry.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h3>Tasks due soon</h3>
          <div className="list">
            {data.tasks.map((task) => (
              <div key={task.id} className="list-item">
                <strong>{task.title}</strong>
                <p className="subtle">{task.description}</p>
                <StatusBadge value={task.status} />
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="two-column">
        <article className="panel">
          <h3>Recent activity</h3>
          <div className="timeline">
            {data.recentActivity.map((event) => (
              <div key={event.id} className="timeline-item">
                <strong>{event.description}</strong>
                <span className="subtle">
                  {event.actorName} · {formatDateTime(event.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <h3>Lead queue</h3>
          <div className="list">
            {data.leads.map((lead) => (
              <div key={lead.id} className="list-item">
                <Link href={`/leads/${lead.id}`}>
                  <strong>{lead.fullName}</strong>
                </Link>
                <p className="subtle">{lead.notesSummary}</p>
                <div className="stack">
                  <StatusBadge value={lead.status} />
                  <span className="badge blue">Score {lead.leadScore}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
