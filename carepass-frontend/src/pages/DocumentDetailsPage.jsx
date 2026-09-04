import { useState } from "react";
import DocumentIcon from "../components/DocumentIcon";
import PageHeading from "../components/PageHeading";
import StatusBadge from "../components/StatusBadge";
import documentService from "../services/documentService";

function formatDate(value) {
  if (!value) return "Nije određeno";
  return new Intl.DateTimeFormat("sr-RS").format(new Date(value.length === 10 ? `${value}T00:00:00` : value));
}

export default function DocumentDetailsPage({ document, onNavigate, onEdit }) {
  const [message, setMessage] = useState("");

  if (!document) return null;

  async function openFile() {
    const file = await documentService.getFile(document.id);
    if (!file) return setMessage("Demo dokument nema sačuvan fajl. Novi dokumenti mogu se otvoriti nakon unosa.");
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  return (
    <main className="content-page">
      <PageHeading title="Detalji dokumenta" description="Pregled podataka, statusa i istorije izabranog dokumenta." />
      <section className="content-panel details-panel">
        <div className="details-header">
          <div className="document-icon-box"><DocumentIcon /></div>
          <div><h2>{document.title}</h2><p>Verzija dokumenta: {document.version}</p></div>
          <StatusBadge status={document.status} />
        </div>

        <dl className="details-grid">
          <div><dt>Vrsta dokumenta</dt><dd>{document.type}</dd></div>
          <div><dt>Broj dokumenta</dt><dd>{document.documentNumber}</dd></div>
          <div><dt>Institucija izdavalac</dt><dd>{document.institution}</dd></div>
          <div><dt>Datum izdavanja</dt><dd>{formatDate(document.issuedAt)}</dd></div>
          <div><dt>Datum isteka</dt><dd>{formatDate(document.expiresAt)}</dd></div>
          <div><dt>Broj zahteva</dt><dd>{document.requestNumber}</dd></div>
          <div><dt>Naziv fajla</dt><dd>{document.fileName || "Nije dostupan"}</dd></div>
          <div><dt>Poslednja izmena</dt><dd>{formatDate(document.updatedAt)}</dd></div>
          <div className="full-detail"><dt>SHA-256 digitalni otisak</dt><dd className="hash-value">{document.fileHash || "Biće izračunat prilikom unosa stvarnog fajla"}</dd></div>
        </dl>

        <section className="history-section">
          <h3>Istorija dokumenta</h3>
          {(document.history || []).map((item, index) => (
            <div className="history-item" key={`${item.date}-${index}`}><span>{item.date}</span><p>{item.text}</p></div>
          ))}
        </section>

        {message && <p className="form-message info-message">{message}</p>}
        <div className="form-actions">
          <button className="outline-button" type="button" onClick={() => onNavigate("documents")}>Nazad</button>
          <button className="outline-button" type="button" onClick={openFile}>Otvori fajl</button>
          <button className="action-button" type="button" onClick={onEdit}>Ažuriraj dokument</button>
        </div>
      </section>
    </main>
  );
}
