import { demoApplications } from "../data/mockData";

const APPLICATIONS_KEY = "carepass_applications";

function getApplications() {
  try {
    const stored = localStorage.getItem(APPLICATIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    localStorage.removeItem(APPLICATIONS_KEY);
  }
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(demoApplications));
  return demoApplications;
}

function saveApplications(applications) {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
}

function apply(candidateId, jobId, documentIds) {
  const applications = getApplications();
  if (applications.some((item) => item.candidateId === candidateId && item.jobId === jobId)) {
    throw new Error("Već ste se prijavili na ovaj oglas.");
  }
  const application = {
    id: crypto.randomUUID(),
    candidateId,
    jobId,
    documentIds,
    status: "submitted",
    submittedAt: new Date().toISOString(),
    humanDecision: null,
  };
  saveApplications([application, ...applications]);
  return application;
}

function makeDecision(applicationId, decision, reason) {
  const applications = getApplications().map((application) =>
    application.id === applicationId
      ? {
          ...application,
          status: decision,
          humanDecision: { decision, reason, decidedAt: new Date().toISOString() },
        }
      : application,
  );
  saveApplications(applications);
  return applications;
}

export default {
  getApplications,
  getCandidateApplications: (candidateId) => getApplications().filter((item) => item.candidateId === candidateId),
  getJobApplications: (jobId) => getApplications().filter((item) => item.jobId === jobId),
  apply,
  makeDecision,
};
