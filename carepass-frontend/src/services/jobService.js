import { demoJobs } from "../data/mockData";

const JOBS_KEY = "carepass_jobs";

function getJobs() {
  try {
    const stored = localStorage.getItem(JOBS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    localStorage.removeItem(JOBS_KEY);
  }
  localStorage.setItem(JOBS_KEY, JSON.stringify(demoJobs));
  return demoJobs;
}

function saveJobs(jobs) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

function createJob(agentId, data) {
  const job = {
    id: crypto.randomUUID(),
    agentId,
    ...data,
    active: true,
    createdAt: new Date().toISOString(),
  };
  saveJobs([job, ...getJobs()]);
  return job;
}

function toggleJob(jobId) {
  const jobs = getJobs().map((job) =>
    job.id === jobId ? { ...job, active: !job.active } : job,
  );
  saveJobs(jobs);
  return jobs;
}

export default {
  getJobs,
  getActiveJobs: () => getJobs().filter((job) => job.active),
  getAgentJobs: (agentId) => getJobs().filter((job) => job.agentId === agentId),
  createJob,
  toggleJob,
};
