import { useState } from "react";
import PageHeading from "../components/PageHeading";
import jobService from "../services/jobService";

const defaultWeights = { education: 15, license: 20, specialization: 15, experience: 20, language: 15, verification: 10, country: 5 };

export default function JobFormPage({ user, onJobsChange, onNavigate }) {
  const [form, setForm] = useState({
    title: "", employer: "", country: "", city: "", description: "", deadline: "",
    requirements: { education: "Diploma medicinskog fakulteta", license: "", specialization: "", experienceYears: 0, language: "", languageLevel: "B2", countryEligibility: true, licenseElimination: true },
    weights: defaultWeights,
  });
  const [error, setError] = useState("");
  const total = Object.values(form.weights).reduce((sum, value) => sum + Number(value), 0);

  function basic(field, value) { setForm({ ...form, [field]: value }); }
  function requirement(field, value) { setForm({ ...form, requirements: { ...form.requirements, [field]: value } }); }
  function weight(field, value) { setForm({ ...form, weights: { ...form.weights, [field]: Number(value) } }); }

  function submit(event) {
    event.preventDefault();
    setError("");
    if ([form.title, form.employer, form.country, form.city, form.deadline, form.requirements.license, form.requirements.specialization, form.requirements.language].some((value) => !String(value).trim())) return setError("Popunite sva obavezna polja.");
    if (total !== 100) return setError("Zbir težina AI kriterijuma mora biti tačno 100.");
    jobService.createJob(user.id, form);
    onJobsChange(jobService.getJobs());
    onNavigate("dashboard");
  }

  const weightLabels = { education: "Obrazovanje", license: "Licenca", specialization: "Specijalizacija", experience: "Iskustvo", language: "Jezik", verification: "Verifikacija dokumenata", country: "Uslovi države" };

  return (
    <main className="content-page">
      <PageHeading title="Kreiraj oglas za posao" description="Definišite poziciju, obavezne uslove i objašnjive kriterijume AI procene." />
      <form className="content-panel job-form" onSubmit={submit}>
        <h2>Podaci o poziciji</h2>
        <div className="form-grid">
          <label>Naziv pozicije<input value={form.title} onChange={(e) => basic("title", e.target.value)} /></label>
          <label>Poslodavac<input value={form.employer} onChange={(e) => basic("employer", e.target.value)} /></label>
          <label>Država<input value={form.country} onChange={(e) => basic("country", e.target.value)} /></label>
          <label>Grad<input value={form.city} onChange={(e) => basic("city", e.target.value)} /></label>
          <label>Rok prijave<input type="date" value={form.deadline} onChange={(e) => basic("deadline", e.target.value)} /></label>
          <label className="full-field">Opis pozicije<textarea value={form.description} onChange={(e) => basic("description", e.target.value)} /></label>
        </div>

        <h2>Obavezni uslovi</h2>
        <div className="form-grid">
          <label>Potrebno obrazovanje<input value={form.requirements.education} onChange={(e) => requirement("education", e.target.value)} /></label>
          <label>Potrebna licenca<input value={form.requirements.license} onChange={(e) => requirement("license", e.target.value)} /></label>
          <label>Specijalizacija<input value={form.requirements.specialization} onChange={(e) => requirement("specialization", e.target.value)} /></label>
          <label>Minimalno iskustvo<input type="number" min="0" value={form.requirements.experienceYears} onChange={(e) => requirement("experienceYears", Number(e.target.value))} /></label>
          <label>Jezik<input value={form.requirements.language} onChange={(e) => requirement("language", e.target.value)} /></label>
          <label>Nivo jezika<select value={form.requirements.languageLevel} onChange={(e) => requirement("languageLevel", e.target.value)}>{["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => <option key={level}>{level}</option>)}</select></label>
        </div>
        <label className="switch-label"><input type="checkbox" checked={form.requirements.licenseElimination} onChange={(e) => requirement("licenseElimination", e.target.checked)} /> Važeća licenca je eliminacioni uslov</label>

        <div className="weights-heading"><h2>Težine AI kriterijuma</h2><strong className={total === 100 ? "valid-total" : "invalid-total"}>Ukupno: {total}/100</strong></div>
        <div className="weights-grid">
          {Object.entries(form.weights).map(([key, value]) => <label key={key}>{weightLabels[key]}<input type="number" min="0" max="100" value={value} onChange={(e) => weight(key, e.target.value)} /></label>)}
        </div>
        {error && <p className="form-message error-message">{error}</p>}
        <div className="form-actions"><button className="outline-button" type="button" onClick={() => onNavigate("dashboard")}>Otkaži</button><button className="action-button" type="submit">Objavi oglas</button></div>
      </form>
    </main>
  );
}
