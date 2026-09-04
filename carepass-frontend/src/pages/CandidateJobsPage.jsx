import { useState } from "react";
import PageHeading from "../components/PageHeading";
import applicationService from "../services/applicationService";

export default function CandidateJobsPage({ user, jobs, documents, applications, onApplicationsChange, onNavigate }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [message, setMessage] = useState("");

  function applicationFor(jobId) {
    return applications.find((application) => application.jobId === jobId);
  }

  function openApplication(job) {
    setSelectedJob(job);
    setSelectedDocuments(documents.map((document) => document.id));
    setMessage("");
  }

  function toggleDocument(documentId) {
    setSelectedDocuments((current) =>
      current.includes(documentId) ? current.filter((id) => id !== documentId) : [...current, documentId],
    );
  }

  function apply() {
    setMessage("");
    if (!selectedDocuments.length) return setMessage("Izaberite najmanje jedan dokument uz prijavu.");
    try {
      applicationService.apply(user.id, selectedJob.id, selectedDocuments);
      onApplicationsChange(applicationService.getApplications());
      setSelectedJob(null);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const decisionLabels = {
    submitted: "Prijava podneta",
    interview: "Poziv na intervju",
    supplement: "Potrebna dopuna",
    rejected: "Prijava odbijena",
  };

  return (
    <main className="content-page jobs-page">
      <PageHeading title="Oglasi za posao" description="Pregledajte aktivne pozicije i prijavite se koristeći svoj CarePass profil." />
      <section className="jobs-grid">
        {jobs.map((job) => {
          const existingApplication = applicationFor(job.id);
          return (
            <article className="content-panel job-card" key={job.id}>
              <span className="job-location">{job.city}, {job.country}</span>
              <h2>{job.title}</h2>
              <h3>{job.employer}</h3>
              <p>{job.description}</p>
              <ul>
                <li>Iskustvo: najmanje {job.requirements.experienceYears} godina</li>
                <li>Jezik: {job.requirements.language} {job.requirements.languageLevel}</li>
                <li>Licenca: {job.requirements.license}</li>
              </ul>
              {existingApplication ? (
                <div className="application-status">
                  <strong>{decisionLabels[existingApplication.status]}</strong>
                  {existingApplication.humanDecision?.reason && <span>{existingApplication.humanDecision.reason}</span>}
                </div>
              ) : (
                <button className="action-button" type="button" onClick={() => openApplication(job)}>Prijavi se</button>
              )}
            </article>
          );
        })}
      </section>

      {selectedJob && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedJob(null)}>
          <section className="modal-card" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <h2>Prijava: {selectedJob.title}</h2>
            <p>Izaberite dokumente koje odobravate za ovu konkretnu prijavu.</p>
            <div className="document-checkboxes">
              {!documents.length ? <p>Prvo morate dodati dokumente u CarePass.</p> : documents.map((document) => (
                <label key={document.id}>
                  <input type="checkbox" checked={selectedDocuments.includes(document.id)} onChange={() => toggleDocument(document.id)} />
                  <span><strong>{document.title}</strong><small>Status: {document.status}</small></span>
                </label>
              ))}
            </div>
            {message && <p className="form-message error-message">{message}</p>}
            <div className="form-actions"><button className="outline-button" type="button" onClick={() => setSelectedJob(null)}>Otkaži</button><button className="action-button" type="button" onClick={apply} disabled={!documents.length}>Pošalji prijavu</button></div>
          </section>
        </div>
      )}
      <div className="page-footer-actions"><button className="outline-button" type="button" onClick={() => onNavigate("dashboard")}>Nazad na dashboard</button></div>
    </main>
  );
}
