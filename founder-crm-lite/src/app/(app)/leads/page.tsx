import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/modules/auth/session";
import { listLeads } from "@/modules/crm/service";
import { formatDate } from "@/modules/shared/format";

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const leads = await listLeads(user, {
    q: typeof params.q === "string" ? params.q : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    owner: typeof params.owner === "string" ? params.owner : undefined
  });

  return (
    <section className="grid">
      <PageHeader
        title="Leads"
        description="Lead management is where junior engineers often over-focus on fields and under-focus on lifecycle transitions. Study both."
        actions={
          <>
            <Link href="/leads/new" className="button">
              Create lead
            </Link>
            <Link href="/api/exports/leads" className="button-secondary">
              Export CSV
            </Link>
          </>
        }
      />

      <article className="panel">
        <form className="filters" action="/leads">
          <input type="search" name="q" placeholder="Search leads, notes, or tags" defaultValue={typeof params.q === "string" ? params.q : ""} />
          <select name="status" defaultValue={typeof params.status === "string" ? params.status : ""}>
            <option value="">All statuses</option>
            <option value="New">New</option>
            <option value="Attempting Contact">Attempting Contact</option>
            <option value="Qualified">Qualified</option>
            <option value="Unqualified">Unqualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
          <button className="button-secondary" type="submit">
            Apply filters
          </button>
        </form>
      </article>

      <article className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Status</th>
              <th>Source</th>
              <th>Owner</th>
              <th>Score</th>
              <th>Last contacted</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <Link href={`/leads/${lead.id}`}>
                    <strong>{lead.fullName}</strong>
                  </Link>
                  <div className="subtle">{lead.email ?? "No email on file"}</div>
                </td>
                <td>
                  <StatusBadge value={lead.status} />
                </td>
                <td>{lead.source}</td>
                <td>{lead.ownerName}</td>
                <td>{lead.leadScore}</td>
                <td>{formatDate(lead.lastContactedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
