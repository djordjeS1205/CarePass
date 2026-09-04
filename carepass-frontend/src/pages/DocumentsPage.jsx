import { useMemo, useState } from "react";
import DocumentIcon from "../components/DocumentIcon";
import PageHeading from "../components/PageHeading";
import StatusBadge from "../components/StatusBadge";

function formatDate(value) {
  if (!value) return "Nije određeno";
  return new Intl.DateTimeFormat("sr-RS").format(new Date(`${value}T00:00:00`));
}

export default function DocumentsPage({ documents, onNavigate, onSelectDocument }) {
  const [search, setSearch] = useState("");
  const visibleDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((document) =>
      [document.title, document.type, document.institution].some((value) => value.toLowerCase().includes(query)),
    );
  }, [documents, search]);

  function openDocument(id) {
    onSelectDocument(id);
    onNavigate("document-details");
  }

  return (
    <main className="content-page documents-page">
      <PageHeading
        title="Moji dokumenti"
        description="Pregledajte i upravljajte dokumentima u svom digitalnom pasošu kompetencija."
        action={<button className="action-button large-action" type="button" onClick={() => onNavigate("document-form")}>Dodaj dokument</button>}
      />

      <section className="content-panel documents-panel">
        <label className="search-box">
          <span className="search-symbol">⌕</span>
          <input placeholder="Pretražite dokumente" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>

        {visibleDocuments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><DocumentIcon /></div>
            <h2>{documents.length ? "Nema rezultata pretrage" : "Još nemate unetih dokumenata"}</h2>
            <p>{documents.length ? "Promenite pojam za pretragu." : "Dodajte prvi dokument u svoj digitalni pasoš kompetencija."}</p>
            {!documents.length && <button className="action-button" type="button" onClick={() => onNavigate("document-form")}>Dodaj prvi dokument</button>}
          </div>
        ) : (
          <div className="document-list">
            {visibleDocuments.map((document) => (
              <article className="document-row" key={document.id}>
                <div className="document-icon-box"><DocumentIcon /></div>
                <div className="document-summary">
                  <h2>{document.title}</h2>
                  <p><strong>Vrsta:</strong> {document.type}</p>
                  <p><strong>Izdavalac:</strong> {document.institution}</p>
                  <p><strong>{document.expiresAt ? "Važi do:" : "Datum izdavanja:"}</strong> {formatDate(document.expiresAt || document.issuedAt)}</p>
                </div>
                <StatusBadge status={document.status} />
                <button className="details-button" type="button" onClick={() => openDocument(document.id)}><span>⌕</span> Detaljnije</button>
              </article>
            ))}
          </div>
        )}

        <div className="document-total">Ukupno dokumenata: {documents.length}</div>
      </section>
      <div className="page-footer-actions"><button className="outline-button" type="button" onClick={() => onNavigate("dashboard")}>Nazad na dashboard</button></div>
    </main>
  );
}
