import { useMemo, useState } from "react";
import DocumentIcon from "../components/DocumentIcon";
import StatusBadge from "../components/StatusBadge";
import auditService from "../services/auditService";
import authService from "../services/authService";
import documentService from "../services/documentService";

export default function InstitutionDashboardPage({ user }) {
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const requests = useMemo(() => documentService.getAllCandidateDocuments().filter((document) => document.institution === user.organization || document.authority === user.organization), [user.organization, revision]);
  const pending = requests.filter((document) => ["pending", "needs_update"].includes(document.status));
  const completed = requests.filter((document) => !["pending", "needs_update"].includes(document.status));

  function submitDecision() {
    setError("");
    if (!action) return setError("Izaberite radnju.");
    if (!reason.trim()) return setError("Obrazloženje je obavezno za svaku institucionalnu odluku.");
    const status = action === "accept" ? "verified" : action === "supplement" ? "needs_update" : "rejected";
    documentService.updateVerification(selected.ownerId, selected.id, status, reason.trim(), user);
    auditService.record(user, "credential_verification", selected.id, status, reason.trim());
    setSelected(null); setAction(""); setReason(""); setRevision((value) => value + 1);
  }

  function RequestList({ items }) {
    return items.length ? items.map((document) => {
      const candidate = authService.getUserById(document.ownerId);
      return (
        <button className="institution-request" type="button" key={`${document.ownerId}-${document.id}`} onClick={() => setSelected(document)}>
          <span className="document-icon-box"><DocumentIcon /></span>
          <span><strong>{document.title}</strong><small>Kandidat: {candidate?.fullName || "Nepoznat kandidat"}</small><small>Broj dokumenta: {document.documentNumber}</small></span>
          <StatusBadge status={document.status} />
          <b>Otvori zahtev</b>
        </button>
      );
    }) : <div className="empty-state compact-empty"><h3>Nema zahteva u ovoj grupi</h3></div>;
  }

  return (
    <main className="content-page institution-page">
      <section className="page-heading"><div><span className="carepass-badge">Ovlašćena institucija</span><h1>Zahtevi za verifikaciju</h1><p>{user.organization}</p></div></section>
      <section className="institution-statistics"><article><strong>{pending.length}</strong><span>Na čekanju</span></article><article><strong>{completed.filter((item) => item.status === "verified").length}</strong><span>Prihvaćeno</span></article><article><strong>{completed.filter((item) => item.status === "rejected").length}</strong><span>Odbijeno</span></article></section>
      <section className="content-panel institution-panel"><h2>Novi i otvoreni zahtevi</h2><div className="institution-list"><RequestList items={pending} /></div></section>
      <section className="content-panel institution-panel"><h2>Završeni zahtevi</h2><div className="institution-list"><RequestList items={completed} /></div></section>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section className="modal-card institution-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <h2>{selected.title}</h2>
            <dl className="details-grid"><div><dt>Kandidat</dt><dd>{authService.getUserById(selected.ownerId)?.fullName}</dd></div><div><dt>Vrsta</dt><dd>{selected.type}</dd></div><div><dt>Broj dokumenta</dt><dd>{selected.documentNumber}</dd></div><div><dt>Datum izdavanja</dt><dd>{selected.issuedAt}</dd></div><div className="full-detail"><dt>SHA-256 digitalni otisak</dt><dd className="hash-value">{selected.fileHash || "Demo dokument – hash nije upisan"}</dd></div></dl>
            <div className="decision-box"><h3>Institucionalna odluka</h3><div className="decision-options"><label><input type="radio" name="institution-action" value="accept" checked={action === "accept"} onChange={(e) => setAction(e.target.value)} /> Prihvati</label><label><input type="radio" name="institution-action" value="supplement" checked={action === "supplement"} onChange={(e) => setAction(e.target.value)} /> Traži dopunu</label><label><input type="radio" name="institution-action" value="reject" checked={action === "reject"} onChange={(e) => setAction(e.target.value)} /> Odbij</label></div><textarea placeholder="Obavezno obrazloženje i uputstvo kandidatu" value={reason} onChange={(e) => setReason(e.target.value)} />{error && <p className="form-message error-message">{error}</p>}</div>
            <div className="form-actions"><button className="outline-button" type="button" onClick={() => setSelected(null)}>Zatvori</button><button className="action-button" type="button" onClick={submitDecision}>Potvrdi odluku</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
