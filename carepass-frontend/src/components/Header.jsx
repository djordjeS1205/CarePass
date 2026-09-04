export default function Header({ currentUser, onNavigate, onLogout }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button
          className="site-logo"
          type="button"
          onClick={() => onNavigate(currentUser ? "dashboard" : "home")}
        >
          CarePass
        </button>

        <nav className="site-navigation" aria-label="Glavna navigacija">
          {currentUser ? (
            <>
              <button className="header-link" type="button" onClick={() => onNavigate("dashboard")}>
                Dashboard
              </button>
              {currentUser.role === "candidate" && (
                <button className="header-link" type="button" onClick={() => onNavigate("jobs")}>
                  Oglasi
                </button>
              )}
              {currentUser.role === "agent" && (
                <button className="header-link" type="button" onClick={() => onNavigate("agent-assessments")}>
                  AI analiza
                </button>
              )}
              <button className="header-primary-button" type="button" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="header-link"
                type="button"
                onClick={() => onNavigate("login")}
              >
                Login
              </button>
              <button
                className="header-primary-button"
                type="button"
                onClick={() => onNavigate("register")}
              >
                Register
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
