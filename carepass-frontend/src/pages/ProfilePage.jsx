import { useState } from "react";
import PageHeading from "../components/PageHeading";
import authService from "../services/authService";

export default function ProfilePage({ user, onUserChange, onBack }) {
  const [profile, setProfile] = useState({ fullName: user.fullName, email: user.email });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  function saveProfile(event) {
    event.preventDefault();
    if (!profile.fullName.trim() || !profile.email.trim()) return setProfileMessage("Popunite oba polja.");
    const updatedUser = authService.updateProfile(user.id, profile);
    onUserChange(updatedUser);
    setProfileMessage("Podaci su uspešno sačuvani.");
  }

  function savePassword(event) {
    event.preventDefault();
    setPasswordMessage("");
    if (!passwords.current || !passwords.next || !passwords.confirm) return setPasswordMessage("Popunite sva polja za promenu lozinke.");
    if (passwords.next.length < 6) return setPasswordMessage("Nova lozinka mora imati najmanje 6 karaktera.");
    if (passwords.next !== passwords.confirm) return setPasswordMessage("Nove lozinke se ne podudaraju.");
    try {
      authService.changePassword(user.id, passwords.current, passwords.next);
      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordMessage("Lozinka je uspešno promenjena.");
    } catch (error) {
      setPasswordMessage(error.message);
    }
  }

  return (
    <main className="content-page">
      <PageHeading title="Moj profil" description="Pregledajte i izmenite osnovne podatke svog CarePass naloga." />
      <section className="two-column-panels">
        <form className="content-panel profile-form" onSubmit={saveProfile}>
          <h2>Osnovni podaci</h2>
          <label>Ime i prezime<input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /></label>
          <label>Email adresa<input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
          <label>Profesija<input value={user.profession} disabled /></label>
          <label>Država<input value={user.country} disabled /></label>
          {profileMessage && <p className="form-message success-message">{profileMessage}</p>}
          <button className="action-button" type="submit">Sačuvaj izmene</button>
        </form>

        <form className="content-panel profile-form" onSubmit={savePassword}>
          <h2>Promena lozinke</h2>
          <label>Trenutna lozinka<input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} /></label>
          <label>Nova lozinka<input type="password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} /></label>
          <label>Potvrdite novu lozinku<input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} /></label>
          {passwordMessage && <p className={`form-message ${passwordMessage.includes("uspešno") ? "success-message" : "error-message"}`}>{passwordMessage}</p>}
          <button className="action-button" type="submit">Promeni lozinku</button>
        </form>
      </section>
      <div className="page-footer-actions"><button className="outline-button" type="button" onClick={onBack}>Nazad na dashboard</button></div>
    </main>
  );
}
