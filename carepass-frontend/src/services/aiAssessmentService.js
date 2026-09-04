const levels = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

function documentMatch(document, words) {
  const value = `${document.title} ${document.type}`.toLowerCase();
  return words.some((word) => value.includes(word.toLowerCase()));
}

function evaluateCredential(documents, words, weight, label) {
  const credential = documents.find((document) => documentMatch(document, words));
  if (!credential) {
    return { key: label, points: 0, maximum: weight, state: "missing", explanation: `Nije dostavljen proverljiv dokaz: ${label}.` };
  }
  if (credential.status === "verified") {
    return { key: label, points: weight, maximum: weight, state: "satisfied", explanation: `${label} je potvrđen verifikovanim dokumentom.` };
  }
  if (credential.status === "pending" || credential.status === "needs_update") {
    return { key: label, points: Math.round(weight * 0.5), maximum: weight, state: "unverified", explanation: `${label} je dostavljen, ali dokaz još nije verifikovan.` };
  }
  return { key: label, points: 0, maximum: weight, state: "failed", explanation: `${label} nema važeći status (${credential.status}).` };
}

export function assessCandidate(job, candidate, allDocuments, application) {
  const documents = allDocuments.filter((document) => application.documentIds.includes(document.id));
  const { requirements, weights } = job;
  const breakdown = [];

  breakdown.push(evaluateCredential(documents, ["diploma"], weights.education, "Odgovarajuće obrazovanje"));
  const licenseResult = evaluateCredential(documents, [requirements.license, "licenca"], weights.license, "Profesionalna licenca");
  breakdown.push(licenseResult);

  const specializationMatches = candidate.specialization?.toLowerCase().includes(requirements.specialization.toLowerCase());
  breakdown.push({ key: "Specijalizacija", points: specializationMatches ? weights.specialization : 0, maximum: weights.specialization, state: specializationMatches ? "satisfied" : "missing", explanation: specializationMatches ? `Specijalizacija ${requirements.specialization} odgovara oglasu.` : `Nije potvrđena tražena specijalizacija: ${requirements.specialization}.` });

  const experienceMatches = Number(candidate.experienceYears || 0) >= Number(requirements.experienceYears || 0);
  breakdown.push({ key: "Radno iskustvo", points: experienceMatches ? weights.experience : Math.round(weights.experience * Math.min(Number(candidate.experienceYears || 0) / Math.max(Number(requirements.experienceYears || 1), 1), 1)), maximum: weights.experience, state: experienceMatches ? "satisfied" : "missing", explanation: experienceMatches ? `Kandidat ispunjava uslov od najmanje ${requirements.experienceYears} godina iskustva.` : `Kandidat nema dokazano najmanje ${requirements.experienceYears} godina iskustva.` });

  const language = (candidate.languages || []).find((item) => item.name.toLowerCase() === requirements.language.toLowerCase());
  const languageMatches = language && levels[language.level] >= levels[requirements.languageLevel];
  breakdown.push({ key: "Znanje jezika", points: languageMatches ? weights.language : 0, maximum: weights.language, state: languageMatches ? "satisfied" : "missing", explanation: languageMatches ? `${requirements.language} je potvrđen na nivou ${language.level}.` : `Nije dostavljen proverljiv dokaz za ${requirements.language} ${requirements.languageLevel}.` });

  const verifiedRatio = documents.length ? documents.filter((document) => document.status === "verified").length / documents.length : 0;
  breakdown.push({ key: "Status dokumentacije", points: Math.round(weights.verification * verifiedRatio), maximum: weights.verification, state: verifiedRatio === 1 ? "satisfied" : "unverified", explanation: verifiedRatio === 1 ? "Svi priloženi dokazi su verifikovani." : "Jedan ili više priloženih dokaza čeka proveru." });

  const countryMatches = !requirements.countryEligibility || (candidate.countryEligibility || []).includes(job.country);
  breakdown.push({ key: "Uslovi države", points: countryMatches ? weights.country : 0, maximum: weights.country, state: countryMatches ? "satisfied" : "unverified", explanation: countryMatches ? `Profil sadrži podatke relevantne za uslove države ${job.country}.` : `Potrebna je dodatna provera uslova države ${job.country}.` });

  const score = Math.round(breakdown.reduce((sum, item) => sum + item.points, 0));
  const blocked = requirements.licenseElimination && ["failed"].includes(licenseResult.state);
  const unverified = breakdown.some((item) => ["missing", "unverified"].includes(item.state));
  const eligibility = blocked ? "blocked" : unverified ? "review" : "eligible";
  const recommendation = blocked
    ? "Obavezni eliminacioni uslov nije ispunjen. Agent mora proveriti dokaz pre odluke."
    : unverified
      ? "Zatražiti dopunu ili proveru dokumentacije pre konačne odluke."
      : "Kandidat ispunjava definisane uslove i može biti razmotren za intervju.";

  return {
    score,
    eligibility,
    recommendation,
    breakdown,
    satisfied: breakdown.filter((item) => item.state === "satisfied"),
    missing: breakdown.filter((item) => item.state === "missing" || item.state === "failed"),
    unverified: breakdown.filter((item) => item.state === "unverified"),
    rulesVersion: "CarePass rules 1.0",
    assessedAt: new Date().toISOString(),
  };
}
