export default function HomePage({ onNavigate }) {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="carepass-badge">Dokumentacija je sigurna na CarePass</span>
          <h1>Dobrodošli u aplikaciju za odlaganje dokumenata zdravstvenih radnika</h1>
          <p className="home-description">
            Platforma je namenjena sigurnom čuvanju i upravljanju dokumentima
            zdravstvenih radnika koji se koriste na glavnoj platformi. Sistem
            omogućava jednostavan pristup, preglednost i organizaciju dokumentacije.
          </p>
          <div className="home-actions">
            <button className="primary-button" type="button" onClick={() => onNavigate("login")}>
              Prijava
            </button>
            <button className="secondary-button" type="button" onClick={() => onNavigate("register")}>
              Registracija
            </button>
          </div>
        </div>

        <div className="home-visual" aria-hidden="true">
          <div className="visual-card visual-main-card">
            <h2>Digitalni pasoš kompetencija</h2>
            <p>Na jednom mestu čuvajte kvalifikacije, licence, sertifikate, radno iskustvo i profesionalne veštine.</p>
          </div>
          <div className="visual-card visual-top-card">
            <span>Sigurno upravljanje podacima</span>
            <strong>Korisnik ima potpunu kontrolu nad svojim dokumentima i odlučuje kada i kome ih deli.</strong>
          </div>
          <div className="visual-card visual-bottom-card">
            <span>Brža verifikacija i mobilnost</span>
            <strong>Digitalno verifikovani podaci olakšavaju priznavanje kompetencija i ubrzavaju profesionalnu mobilnost.</strong>
          </div>
        </div>
      </section>

      <section className="home-feature-grid">
        <article className="home-feature-card">
          <h2>Digitalni pasoš kompetencija</h2>
          <p>Na jednom mestu čuvajte kvalifikacije, licence, sertifikate, radno iskustvo i profesionalne veštine.</p>
        </article>
        <article className="home-feature-card">
          <h2>Sigurno upravljanje podacima</h2>
          <p>Korisnik ima potpunu kontrolu nad svojim dokumentima i odlučuje kada i kome ih deli.</p>
        </article>
        <article className="home-feature-card">
          <h2>Brža verifikacija i mobilnost</h2>
          <p>Digitalno verifikovani podaci olakšavaju priznavanje kompetencija i ubrzavaju profesionalnu mobilnost.</p>
        </article>
      </section>
    </main>
  );
}
