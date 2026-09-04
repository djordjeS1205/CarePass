const labels = {
  verified: "Verifikovano",
  pending: "Na čekanju",
  needs_update: "Potrebna dopuna",
  rejected: "Odbijeno",
  expired: "Isteklo",
  revoked: "Opozvano",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-symbol">
        {status === "verified" ? "✓" : status === "pending" ? "◷" : "!"}
      </span>
      {labels[status] || status}
    </span>
  );
}
