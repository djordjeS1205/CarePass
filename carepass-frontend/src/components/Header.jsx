import { useState } from "react";
import contractService from "../services/contractService";

function WalletConnect() {
  const [address, setAddress] = useState(null);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  if (!contractService.isContractConfigured()) {
    return <span className="wallet-badge wallet-demo" title="Ugovor još nije deployovan – aplikacija radi u demo režimu">Demo režim</span>;
  }

  async function connect() {
    setError("");
    setConnecting(true);
    try {
      const account = await contractService.connectWallet();
      setAddress(account);
    } catch (connectError) {
      setError(connectError.message);
    } finally {
      setConnecting(false);
    }
  }

  if (address) {
    return <span className="wallet-badge wallet-connected">{address.slice(0, 6)}…{address.slice(-4)}</span>;
  }

  return (
    <span className="wallet-connect-wrap">
      <button className="header-link" type="button" onClick={connect} disabled={connecting}>
        {connecting ? "Povezujem…" : "Poveži novčanik"}
      </button>
      {error && <small className="wallet-error">{error}</small>}
    </span>
  );
}

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
              <WalletConnect />
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
