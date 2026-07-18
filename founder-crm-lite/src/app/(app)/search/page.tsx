import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/modules/auth/session";
import { globalSearch } from "@/modules/crm/service";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const results = await globalSearch(user, q);

  return (
    <section className="grid">
      <PageHeader
        title="Global search"
        description="Search is often where weaker codebases bypass domain boundaries. This page still goes through services."
      />
      <article className="panel">
        <form action="/search" className="filters">
          <input name="q" type="search" placeholder="Search leads, companies, or deals" defaultValue={q} />
          <button className="button" type="submit">
            Search
          </button>
        </form>
      </article>

      <section className="two-column">
        <article className="panel">
          <h3>Leads</h3>
          <div className="list">
            {results.leads.map((lead) => (
              <div key={lead.id} className="list-item">
                <Link href={`/leads/${lead.id}`}>
                  <strong>{lead.fullName}</strong>
                </Link>
                <p className="subtle">{lead.notesSummary}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <h3>Companies</h3>
          <div className="list">
            {results.companies.map((company) => (
              <div key={company.id} className="list-item">
                <strong>{company.name}</strong>
                <p className="subtle">{company.description}</p>
              </div>
            ))}
          </div>
          <h3 style={{ marginTop: 24 }}>Deals</h3>
          <div className="list">
            {results.deals.map((deal) => (
              <div key={deal.id} className="list-item">
                <strong>{deal.name}</strong>
                <p className="subtle">{deal.notesSummary}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}
