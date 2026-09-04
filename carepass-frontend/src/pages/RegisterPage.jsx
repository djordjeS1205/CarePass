import { useState } from "react";
import authService from "../services/authService";

export default function RegisterPage({ onRegister, onNavigate }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    setError("");
    if (Object.values(form).some((value) => !value.trim())) return setError("Popunite sva polja.");
    if (form.password !== form.confirmPassword) return setError("Lozinke se ne podudaraju.");
    if (form.password.length < 6) return setError("Lozinka mora imati najmanje 6 karaktera.");
    try {
      onRegister(authService.register(form));
    } catch (registerError) {
      setError(registerError.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card register-card">
        <h1>Registracija</h1>
        <p>Kreirajte nalog za pristup aplikaciji.</p>
        <form className="auth-form" onSubmit={submit}>
          <input placeholder="Ime i prezime" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
          <input type="email" placeholder="Email adresa" value={form.email} onChange={(e) => update("email", e.target.value)} />
          <input type="password" placeholder="Lozinka" value={form.password} onChange={(e) => update("password", e.target.value)} />
          <input type="password" placeholder="Potvrdite lozinku" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
          {error && <p className="form-message error-message">{error}</p>}
          <button className="form-submit" type="submit">Registruj se</button>
        </form>
        <p className="auth-footer">
          Već imate nalog?{" "}
          <button type="button" onClick={() => onNavigate("login")}>Prijavite se</button>
        </p>
      </section>
    </main>
  );
}
