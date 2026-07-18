import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/modules/auth/session";
import { listDeals } from "@/modules/crm/service";
import { formatMoney } from "@/modules/shared/format";

export default async function DealsPage() {
  const user = await requireUser();
  const stages = await listDeals(user);

  return (
    <section className="grid">
      <PageHeader
        title="Deals"
        description="Pipeline pages are a good place to study the difference between workflow state and presentation state."
      />
      <div className="grid metrics" style={{ alignItems: "start" }}>
        {stages.map((column) => (
          <article key={column.stage} className="panel">
            <div className="stack" style={{ justifyContent: "space-between" }}>
              <StatusBadge value={column.stage} />
              <strong>{column.deals.length}</strong>
            </div>
            <div className="list" style={{ marginTop: 14 }}>
              {column.deals.map((deal) => (
                <div key={deal.id} className="list-item">
                  <strong>{deal.name}</strong>
                  <p className="subtle">{deal.companyName}</p>
                  <div className="stack">
                    <span className="badge blue">{formatMoney(deal.value)}</span>
                    <span className="badge blue">{deal.ownerName}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
