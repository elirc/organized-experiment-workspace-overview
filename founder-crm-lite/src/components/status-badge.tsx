export function StatusBadge({ value }: { value: string }) {
  const tone =
    value === "Qualified" || value === "Won" || value === "Active Opportunity"
      ? "green"
      : value === "Proposal" || value === "Negotiation" || value === "Attempting Contact"
        ? "gold"
        : value === "Lost" || value === "Unqualified" || value === "Archived"
          ? "red"
          : "blue";

  return <span className={`badge ${tone}`}>{value}</span>;
}
