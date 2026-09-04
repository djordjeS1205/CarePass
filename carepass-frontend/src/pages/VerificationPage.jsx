import { useState } from "react";
import DocumentIcon from "../components/DocumentIcon";
import PageHeading from "../components/PageHeading";
import StatusBadge from "../components/StatusBadge";

function VerificationCard({ document, initiallyOpen }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <article className={`verification-card ${open ? "verification-open" : ""}`}>
      <button className="verification-summary" type="button" onClick={() => setOpen(!open)}>
        <span className="document-icon-box"><DocumentIcon /></span>
        <span className="verification-title"><strong>{document.title}</strong><small>Podneto: {new Date(document.createdAt).toLocaleDateString("sr-RS")} · Broj zahteva: {document.requestNumber}</small></span>
        <StatusBadge status={document.status} />
        <span className="chevron">⌃</span>
      </button>

      {open && (
        <div className="verification-body">
          <div className="verification-meta">
            <div><span>Nadležni organ</span><strong>{document.authority}</strong></div>
            <div><span>Trenutna faza</span><strong>{document.currentPhase}</strong></div>
          </div>

          <div className="verification-timeline">
            {document.verificationSteps.map((step, index) => (
              <div className={`timeline-step timeline-${step.state}`} key={`${step.label}-${index}`}>
                <div className="timeline-marker">{step.state === "complete" ? "✓" : step.state === "current" ? "◷" : index + 1}</div>
                <strong>{step.label}</strong><span>{step.date}</span>
              </div>
            ))}
          </div>

          <div className={`verification-explanation explanation-${document.status}`}>
            <span className="information-symbol">i</span>
            <div><strong>{document.status === "verified" ? "Dokument je prihvaćen" : "Zašto dokument još nije prihvaćen?"}</strong><p>{document.explanation}</p></div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function VerificationPage({ documents, onNavigate }) {
  const pending = documents.filter((document) => document.status !== "verified");
  const verified = documents.filter((document) => document.status === "verified");

  return (
    <main className="content-page verification-page">
      <PageHeading title="Status verifikacije" description="Pratite status provere podnetih dokumenata i akreditiva." />
      {!documents.length ? (
        <section className="content-panel empty-state"><div className="empty-icon"><DocumentIcon /></div><h2>Nema podnetih dokumenata</h2><p>Dodajte dokument da biste pokrenuli postupak verifikacije.</p><button className="action-button" type="button" onClick={() => onNavigate("document-form")}>Dodaj dokument</button></section>
      ) : (
        <section className="content-panel verification-panel">
          {pending.length > 0 && <div className="verification-group"><h2>Podneti dokumenti <span>{pending.length} na čekanju</span></h2>{pending.map((document, index) => <VerificationCard key={document.id} document={document} initiallyOpen={index === 0} />)}</div>}
          {verified.length > 0 && <div className="verification-group"><h2>Verifikovani dokumenti <span className="green-count">{verified.length} potvrđeno</span></h2>{verified.map((document) => <VerificationCard key={document.id} document={document} initiallyOpen={false} />)}</div>}
          <div className="page-footer-actions"><button className="outline-button" type="button" onClick={() => onNavigate("dashboard")}>Nazad na dashboard</button></div>
        </section>
      )}
    </main>
  );
}
