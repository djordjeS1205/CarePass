import { useMemo, useState } from "react";
import PageHeading from "../components/PageHeading";
import { assessCandidate } from "../services/aiAssessmentService";
import applicationService from "../services/applicationService";
import authService from "../services/authService";
import auditService from "../services/auditService";
import documentService from "../services/documentService";

const eligibilityLabels = { eligible: "Uslovi ispunjeni", review: "Potrebna ljudska provera", blocked: "Eliminacioni uslov nije ispunjen" };

export default function AgentAssessmentsPage({ user, jobs, applications, onApplicationsChange, onNavigate }) {
  const agentJobs = jobs.filter((job) => job.agentId === user.id);
  const [selectedJobId, setSelectedJobId] = useState(agentJobs[0]?.id || "");
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const selectedJob = agentJobs.find((job) => job.id === selectedJobId);
  const allDocuments = documentService.getAllCandidateDocuments();
  const rows = useMemo(() => {
    if (!selectedJob) return [];
    return applications.filter((application) => application.jobId === selectedJob.id).map((application) => {
      const candidate = authService.getUserById(application.candidateId);
      return { application, candidate, assessment: assessCandidate(selectedJob, candidate, allDocuments.filter((document) => document.ownerId === candidate.id), application) };
    });
  }, [selectedJob, applications]);
  const selectedRow = rows.find((row) => row.application.id === selectedApplicationId);

  function saveDecision() {
    setError("");
    if (!decision || !reason.trim()) return setError("Izaberite odluku i unesite obavezno obrazloženje.");
    applicationService.makeDecision(selectedApplicationId, decision, reason.trim());
    auditService.record(user, "human_decision", selectedApplicationId, decision, reason.trim());
    onApplicationsChange(applicationService.getApplications());
    setDecision(""); setReason(""); setSelectedApplicationId(null);
  }

  return (
    <main className="content-page agent-ai-page">
      <PageHeading title="AI analiza kandidata" description="Ocena je podrška agentu. Konačnu odluku uvek donosi ovlašćeno lice." />
      {!agentJobs.length ? (
        <section className="content-panel empty-state"><h2>Još nemate oglasa</h2><p>Kreirajte oglas da biste definisali kriterijume AI analize.</p><button className="action-button" type="button" onClick={() => onNavigate("job-form")}>Kreiraj oglas</button></section>
      ) : (
        <>
          <section className="content-panel job-selector-panel">
            <label>Izaberite posao<select value={selectedJobId} onChange={(e) => { setSelectedJobId(e.target.value); setSelectedApplicationId(null); }}>{agentJobs.map((job) => <option value={job.id} key={job.id}>{job.title} – {job.city} ({applications.filter((application) => application.jobId === job.id).length} prijava)</option>)}</select></label>
          </section>
          <section className="content-panel assessments-panel">
            <h2>Prijavljeni kandidati</h2>
            {!rows.length ? <div className="empty-state compact-empty"><h3>Nema prijavljenih kandidata</h3><p>AI procena će biti dostupna nakon prve prijave.</p></div> : (
              <div className="assessment-list">
                {rows.map(({ application, candidate, assessment }) => (
                  <button className="assessment-row" type="button" key={application.id} onClick={() => setSelectedApplicationId(application.id)}>
                    <span><strong>{candidate.fullName}</strong><small>{candidate.profession} · {candidate.specialization || "Specijalizacija nije uneta"}</small></span>
                    <span className="score-circle">{assessment.score}</span>
                    <span className={`eligibility eligibility-${assessment.eligibility}`}>{eligibilityLabels[assessment.eligibility]}</span>
                    <span className="application-decision">{application.humanDecision ? `Odluka: ${application.humanDecision.decision}` : "Odluka nije doneta"}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {selectedRow && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedApplicationId(null)}>
          <section className="modal-card assessment-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="assessment-modal-header"><div><span>AI analiza za poziciju {selectedJob.title}</span><h2>{selectedRow.candidate.fullName}</h2></div><div className="large-score">{selectedRow.assessment.score}<small>/100</small></div></div>
            <div className={`assessment-notice eligibility-${selectedRow.assessment.eligibility}`}><strong>{eligibilityLabels[selectedRow.assessment.eligibility]}</strong><p>{selectedRow.assessment.recommendation}</p></div>
            <div className="breakdown-list">
              {selectedRow.assessment.breakdown.map((item) => <div className="breakdown-row" key={item.key}><span><strong>{item.key}</strong><small>{item.explanation}</small></span><b>{item.points}/{item.maximum}</b></div>)}
            </div>
            <p className="rules-version">Verzija pravila: {selectedRow.assessment.rulesVersion}. AI ne donosi konačnu odluku.</p>
            <div className="decision-box">
              <h3>Odluka ovlašćenog agenta</h3>
              <div className="decision-options">
                <label><input type="radio" name="decision" value="interview" checked={decision === "interview"} onChange={(e) => setDecision(e.target.value)} /> Pozovi na intervju</label>
                <label><input type="radio" name="decision" value="supplement" checked={decision === "supplement"} onChange={(e) => setDecision(e.target.value)} /> Traži dopunu</label>
                <label><input type="radio" name="decision" value="rejected" checked={decision === "rejected"} onChange={(e) => setDecision(e.target.value)} /> Odbij prijavu</label>
              </div>
              <textarea placeholder="Obavezno obrazloženje odluke" value={reason} onChange={(e) => setReason(e.target.value)} />
              {error && <p className="form-message error-message">{error}</p>}
            </div>
            <div className="form-actions"><button className="outline-button" type="button" onClick={() => setSelectedApplicationId(null)}>Zatvori</button><button className="action-button" type="button" onClick={saveDecision}>Sačuvaj odluku</button></div>
          </section>
        </div>
      )}
      <div className="page-footer-actions"><button className="outline-button" type="button" onClick={() => onNavigate("dashboard")}>Nazad na dashboard</button></div>
    </main>
  );
}
