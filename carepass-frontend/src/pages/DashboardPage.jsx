import documentService from "../services/documentService";

export default function DashboardPage({ user, documents, grants, onNavigate }) {
  const statistics = documentService.getStatistics(documents);
  const activeShares = grants.filter((grant) => grant.status === "active").length;

  const cards = [
    { page: "profile", title: "Moj profil", text: "Pregled osnovnih podataka zdravstvenog radnika." },
    { page: "documents", title: "Moji dokumenti", text: "Licence, sertifikati, kvalifikacije i radno iskustvo." },
    { page: "sharing", title: "Deljenje podataka", text: "Kontrola pristupa i pregled podeljenih informacija." },
    { page: "verification", title: "Status verifikacije", text: "Status digitalne potvrde dokumenata i kompetencija." },
  ];

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <section className="dashboard-introduction">
          <div>
            <span className="carepass-badge">Digitalni pasoš kompetencija</span>
            <h1>Dobrodošli u vaš dashboard</h1>
            <p>Na ovom mestu možete upravljati svojim kvalifikacijama, dokumentima, verifikacijama i deljenjem podataka.</p>
          </div>
          <button className="dashboard-add-button" type="button" onClick={() => onNavigate("document-form")}>
            Dodaj dokument
          </button>
        </section>

        <section className="dashboard-navigation-grid">
          {cards.map((card) => (
            <button key={card.page} className="dashboard-navigation-card" type="button" onClick={() => onNavigate(card.page)}>
              <strong>{card.title}</strong>
              <span>{card.text}</span>
            </button>
          ))}
        </section>

        <section className="dashboard-details-grid">
          <article className="dashboard-panel profile-panel">
            <h2>Pregled profila</h2>
            <div className="profile-data-row"><span>Ime i prezime</span><strong>{user.fullName}</strong></div>
            <div className="profile-data-row"><span>Email</span><strong>{user.email}</strong></div>
            <div className="profile-data-row"><span>Profesija</span><strong>{user.profession}</strong></div>
            <div className="profile-data-row"><span>Država</span><strong>{user.country}</strong></div>
          </article>

          <article className="dashboard-panel passport-panel">
            <h2>Status pasoša kompetencija</h2>
            <div className="passport-statistics">
              <div className="passport-statistic"><span>Ukupno dokumenata</span><strong>{statistics.total}</strong></div>
              <div className="passport-statistic"><span>Verifikovano</span><strong>{statistics.verified}</strong></div>
              <div className="passport-statistic"><span>Na čekanju</span><strong>{statistics.pending}</strong></div>
              <div className="passport-statistic"><span>Podeljeno</span><strong>{activeShares}</strong></div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
