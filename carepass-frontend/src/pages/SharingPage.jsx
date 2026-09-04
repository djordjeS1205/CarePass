import { useMemo, useState } from "react";
import PageHeading from "../components/PageHeading";
import sharingService from "../services/sharingService";

export default function SharingPage({ user, documents, grants, onGrantsChange, onNavigate }) {
  const verifiedDocuments = useMemo(
    () => documents.filter((document) => document.status === "verified"),
    [documents],
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ recipient: "", purpose: "", expiresAt: "", documentIds: [] });
  const [error, setError] = useState("");

  function toggleDocument(id) {
    setForm((current) => ({
      ...current,
      documentIds: current.documentIds.includes(id)
        ? current.documentIds.filter((documentId) => documentId !== id)
        : [...current.documentIds, id],
    }));
  }

  function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.recipient.trim() || !form.purpose.trim() || !form.expiresAt || !form.documentIds.length) {
      return setError("Unesite primaoca, svrhu i rok i izaberite najmanje jedan dokument.");
    }
    sharingService.createGrant(user.id, form);
    onGrantsChange(sharingService.getGrants(user.id));
    setForm({ recipient: "", purpose: "", expiresAt: "", documentIds: [] });
    setShowForm(false);
  }

  function revoke(id) {
    onGrantsChange(sharingService.revokeGrant(user.id, id));
  }

  function documentTitles(ids) {
    return ids.map((id) => documents.find((document) => document.id === id)?.title).filter(Boolean).join(", ");
  }

  return (
    <main className="content-page sharing-page">
      <PageHeading
        title="Deljenje podataka"
        description="Vi odlučujete ko može da vidi izabrane verifikovane dokumente, u koju svrhu i koliko dugo."
        action={<button className="action-button large-action" type="button" onClick={() => setShowForm(!showForm)}>{showForm ? "Zatvori formu" : "Odobri novi pristup"}</button>}
      />

      {showForm && (
        <form className="content-panel sharing-form" onSubmit={submit}>
          <h2>Novo odobrenje za pristup</h2>
          <div className="form-grid">
            <label>Primalac<input placeholder="Email ili wallet adresa" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} /></label>
            <label>Pristup važi do<input type="date" value={form.expiresAt} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></label>
            <label className="full-field">Svrha deljenja<input placeholder="Na primer: Prijava za poziciju hirurga" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></label>
          </div>
          <fieldset className="document-checkboxes">
            <legend>Izaberite verifikovane dokumente</legend>
            {!verifiedDocuments.length ? <p>Trenutno nemate verifikovan dokument koji može biti podeljen.</p> : verifiedDocuments.map((document) => (
              <label key={document.id}><input type="checkbox" checked={form.documentIds.includes(document.id)} onChange={() => toggleDocument(document.id)} /><span><strong>{document.title}</strong><small>{document.institution}</small></span></label>
            ))}
          </fieldset>
          {error && <p className="form-message error-message">{error}</p>}
          <div className="form-actions"><button className="outline-button" type="button" onClick={() => setShowForm(false)}>Otkaži</button><button className="action-button" type="submit" disabled={!verifiedDocuments.length}>Odobri pristup</button></div>
        </form>
      )}

      <section className="content-panel grants-panel">
        <h2>Pregled odobrenih pristupa</h2>
        {!grants.length ? (
          <div className="empty-state compact-empty"><h3>Još nema podeljenih podataka</h3><p>Kada odobrite pristup, ovde će biti prikazani primalac, dokumenti, svrha i rok.</p></div>
        ) : (
          <div className="grants-list">
            {grants.map((grant) => (
              <article className="grant-card" key={grant.id}>
                <div className="grant-main"><span>Primalac</span><strong>{grant.recipient}</strong><small>{documentTitles(grant.documentIds)}</small></div>
                <div><span>Svrha</span><strong>{grant.purpose}</strong></div>
                <div><span>Važi do</span><strong>{new Date(`${grant.expiresAt}T00:00:00`).toLocaleDateString("sr-RS")}</strong></div>
                <div><span>Status</span><strong className={`grant-status grant-${grant.status}`}>{grant.status === "active" ? "Aktivno" : "Opozvano"}</strong></div>
                {grant.status === "active" && <button className="danger-outline-button" type="button" onClick={() => revoke(grant.id)}>Opozovi pristup</button>}
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="page-footer-actions"><button className="outline-button" type="button" onClick={() => onNavigate("dashboard")}>Nazad na dashboard</button></div>
    </main>
  );
}
