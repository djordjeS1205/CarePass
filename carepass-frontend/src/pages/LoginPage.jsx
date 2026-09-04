import { useState } from "react";
import authService from "../services/authService";

export default function LoginPage({ onLogin, onNavigate }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("Unesite email adresu i lozinku.");
    try {
      onLogin(authService.login(form.email, form.password));
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Prijava</h1>
        <p>Prijavite se da biste pristupili platformi.</p>
        <form className="auth-form" onSubmit={submit}>
          <input
            type="email"
            aria-label="Email adresa"
            placeholder="Email adresa"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            type="password"
            aria-label="Lozinka"
            placeholder="Lozinka"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          {error && <p className="form-message error-message">{error}</p>}
          <button className="form-submit" type="submit">Login</button>
        </form>
        <p className="auth-footer">
          Nemate nalog?{" "}
          <button type="button" onClick={() => onNavigate("register")}>Registrujte se</button>
        </p>
        <div className="demo-logins">
          <strong>Demo nalozi — lozinka: carepass123</strong>
          <span>Kandidat: candidate@carepass.rs</span>
          <span>Agent: agent@carepass.rs</span>
          <span>Institucija: fakultet@carepass.rs</span>
        </div>
      </section>
    </main>
  );
}
