import { useEffect, useState } from "react";
import PageHeading from "../components/PageHeading";

const initialForm = {
  type: "",
  title: "",
  institution: "",
  documentNumber: "",
  issuedAt: "",
  expiresAt: "",
};

export default function DocumentFormPage({ document, onSave, onCancel }) {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (document) {
      setForm({
        type: document.type,
        title: document.title,
        institution: document.institution,
        documentNumber: document.documentNumber,
        issuedAt: document.issuedAt,
        expiresAt: document.expiresAt,
      });
    } else {
      setForm(initialForm);
    }
  }, [document]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function validateFile(selectedFile) {
    if (!selectedFile) return true;
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(selectedFile.type)) return setError("Dozvoljeni su PDF, JPG i PNG fajlovi."), false;
    if (selectedFile.size > 10 * 1024 * 1024) return setError("Fajl ne sme biti veći od 10 MB."), false;
    return true;
  }

  function chooseFile(selectedFile) {
    setError("");
    if (validateFile(selectedFile)) setFile(selectedFile);
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if ([form.type, form.title, form.institution, form.documentNumber, form.issuedAt].some((value) => !value.trim())) {
      return setError("Popunite sva obavezna polja.");
    }
    if (!document && !file) return setError("Izaberite dokument koji želite da dodate.");
    setSaving(true);
    try {
      await onSave(form, file);
    } catch (saveError) {
      setError(saveError.message || "Dokument nije sačuvan.");
      setSaving(false);
    }
  }

  return (
    <main className="content-page document-form-page">
      <PageHeading title={document ? "Ažurirajte dokument" : "Unesite dokument"} description={document ? "Dodajte novu verziju dokumenta. Prethodna verzija ostaje evidentirana u istoriji." : "Dodajte dokument u svoj digitalni pasoš kompetencija."} />
      <form className="content-panel upload-form" onSubmit={submit}>
        <div className="form-grid">
          <label>Vrsta dokumenta
            <select value={form.type} onChange={(e) => update("type", e.target.value)}>
              <option value="">Izaberite vrstu dokumenta</option>
              <option>Diploma</option><option>Profesionalna licenca</option><option>Sertifikat</option><option>Dokaz o jeziku</option><option>Radno iskustvo</option><option>Drugo</option>
            </select>
          </label>
          <label>Naziv dokumenta<input placeholder="Unesite naziv dokumenta" value={form.title} onChange={(e) => update("title", e.target.value)} /></label>
          <label>Institucija izdavalac<input placeholder="Unesite naziv institucije" value={form.institution} onChange={(e) => update("institution", e.target.value)} /></label>
          <label>Broj dokumenta<input placeholder="Unesite broj dokumenta" value={form.documentNumber} onChange={(e) => update("documentNumber", e.target.value)} /></label>
          <label>Datum izdavanja<input type="date" value={form.issuedAt} onChange={(e) => update("issuedAt", e.target.value)} /></label>
          <label>Datum isteka <small>(nije obavezno)</small><input type="date" value={form.expiresAt} onChange={(e) => update("expiresAt", e.target.value)} /></label>
        </div>

        <label
          className={`file-drop ${dragging ? "file-drop-active" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); chooseFile(e.dataTransfer.files[0]); }}
        >
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => chooseFile(e.target.files[0])} />
          <span className="upload-symbol">↥</span>
          <strong>{file ? file.name : document?.fileName || "Prevucite dokument ovde ili izaberite fajl"}</strong>
          <span>PDF, JPG ili PNG, maksimalno 10 MB</span>
        </label>

        {error && <p className="form-message error-message">{error}</p>}
        <div className="form-actions">
          <button className="outline-button" type="button" onClick={onCancel}>Otkaži</button>
          <button className="action-button save-document-button" type="submit" disabled={saving}>{saving ? "Čuvanje..." : document ? "Sačuvaj novu verziju" : "Sačuvaj dokument"}</button>
        </div>
      </form>
    </main>
  );
}
