export default function AgentDashboardPage({ user, jobs, applications, onNavigate }) {
  const agentJobs = jobs.filter((job) => job.agentId === user.id);
  const jobIds = new Set(agentJobs.map((job) => job.id));
  const agentApplications = applications.filter((application) => jobIds.has(application.jobId));

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <section className="dashboard-introduction">
          <div><span className="carepass-badge">Agent za zapošljavanje</span><h1>Dobrodošli, {user.fullName}</h1><p>Kreirajte oglase, pregledajte prijave i koristite objašnjivu AI podršku pri preselekciji.</p></div>
        </section>
        <section className="role-action-grid">
          <button className="role-action-card" type="button" onClick={() => onNavigate("job-form")}><span>＋</span><strong>Kreiraj oglas za posao</strong><p>Definišite poziciju, obavezne uslove i težine AI kriterijuma.</p></button>
          <button className="role-action-card" type="button" onClick={() => onNavigate("agent-assessments")}><span>AI</span><strong>AI analiza kandidata</strong><p>Pregledajte ocene i objašnjenja kandidata za svaki aktivan posao.</p></button>
        </section>
        <section className="dashboard-details-grid agent-statistics">
          <article className="dashboard-panel"><h2>Pregled oglasa</h2><div className="large-stat">{agentJobs.length}</div><p>Ukupno kreiranih oglasa</p></article>
          <article className="dashboard-panel"><h2>Prijave kandidata</h2><div className="large-stat">{agentApplications.length}</div><p>Prijave na vašim oglasima</p></article>
        </section>
      </div>
    </main>
  );
}
