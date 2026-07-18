import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listCompanies } from "@/modules/crm/service";

export default async function CompaniesPage() {
  const companies = await listCompanies();

  return (
    <section className="grid">
      <PageHeader
        title="Companies"
        description="Company pages matter because CRMs eventually pivot from lead-centric work to account-centric work."
      />
      <article className="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Contacts</th>
              <th>Deals</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td>
                  <strong>{company.name}</strong>
                  <div className="subtle">{company.industry}</div>
                </td>
                <td>
                  <StatusBadge value={company.accountStatus} />
                </td>
                <td>{company.ownerName}</td>
                <td>{company.contactCount}</td>
                <td>{company.dealCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
