import { demoDocuments } from "../data/mockData";
import {
  registerCredentialHash,
  registerCredentialVersion,
  recordVerificationStatus,
} from "./contractService";

const DOCUMENTS_PREFIX = "carepass_documents_";
const DEMO_OWNER_ID = "candidate-001";
const DB_NAME = "carepass_files";
const STORE_NAME = "documents";

function storageKey(userId) {
  return `${DOCUMENTS_PREFIX}${userId}`;
}

function openFileDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveFile(documentId, file) {
  if (!file) return;
  const database = await openFileDatabase();

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(file, documentId);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });

  database.close();
}

async function getFile(documentId) {
  const database = await openFileDatabase();

  const file = await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(documentId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });

  database.close();
  return file;
}

async function calculateFileHash(file) {
  if (!file) return "";
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getDocuments(userId) {
  const stored = localStorage.getItem(storageKey(userId));

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(storageKey(userId));
    }
  }

  const initialDocuments = userId === DEMO_OWNER_ID ? demoDocuments : [];
  localStorage.setItem(storageKey(userId), JSON.stringify(initialDocuments));
  return initialDocuments;
}

function persistDocuments(userId, documents) {
  localStorage.setItem(storageKey(userId), JSON.stringify(documents));
}

function getAllCandidateDocuments() {
  const owners = new Set([DEMO_OWNER_ID]);
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(DOCUMENTS_PREFIX)) owners.add(key.slice(DOCUMENTS_PREFIX.length));
  }
  return Array.from(owners).flatMap((ownerId) =>
    getDocuments(ownerId).map((document) => ({ ...document, ownerId })),
  );
}

async function updateVerification(userId, documentId, status, explanation, actor) {
  const documents = getDocuments(userId);
  const current = documents.find((document) => document.id === documentId);
  if (!current) throw new Error("Dokument nije pronađen.");

  const now = new Date();
  let chainNote = "";

  try {
    const chainResult = await recordVerificationStatus(documentId, Math.max(current.version - 1, 0), status);
    if (chainResult.mode === "chain") {
      chainNote = ` (upisano na blockchain, tx ${chainResult.transactionHash.slice(0, 10)}…)`;
    }
  } catch (error) {
    chainNote = ` (upis na blockchain nije uspeo: ${error.message})`;
  }

  const updatedDocuments = documents.map((document) => {
    if (document.id !== documentId) return document;
    const verified = status === "verified";
    return {
      ...document,
      status,
      updatedAt: now.toISOString(),
      currentPhase: verified
        ? "Konačna verifikacija završena"
        : status === "needs_update"
          ? "Potrebna dopuna dokumentacije"
          : "Dokument je odbijen",
      explanation,
      verificationSteps: verified
        ? document.verificationSteps.map((step) => ({
            ...step,
            state: "complete",
            date: step.date || now.toLocaleDateString("sr-RS"),
          }))
        : document.verificationSteps,
      history: [
        ...(document.history || []),
        {
          date: now.toLocaleString("sr-RS"),
          text: `${actor.organization || actor.fullName}: ${explanation}${chainNote}`,
        },
      ],
    };
  });
  persistDocuments(userId, updatedDocuments);
  return updatedDocuments.find((document) => document.id === documentId);
}

function buildInitialSteps(date) {
  return [
    { label: "Dokument podnet", date, state: "complete" },
    { label: "Formalna provera", date: "Na čekanju", state: "current" },
    { label: "Prosleđeno instituciji", date: "", state: "future" },
    { label: "Potvrda institucije", date: "", state: "future" },
    { label: "Konačna verifikacija", date: "", state: "future" },
  ];
}

async function createDocument(userId, formData, file) {
  const documents = getDocuments(userId);
  const now = new Date();
  const date = now.toLocaleDateString("sr-RS");
  const id = crypto.randomUUID();

  const fileHash = await calculateFileHash(file);
  const document = {
    id,
    ...formData,
    status: "pending",
    fileName: file?.name || "",
    fileType: file?.type || "",
    fileSize: file?.size || 0,
    fileHash,
    version: 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    requestNumber: `CP-${now.getFullYear()}-${String(documents.length + 1).padStart(4, "0")}`,
    authority: formData.institution,
    currentPhase: "Čeka se formalna provera",
    explanation:
      "Dokument je uspešno podnet. Ovlašćeni kontrolor treba da završi formalnu proveru pre prosleđivanja instituciji izdavaocu.",
    verificationSteps: buildInitialSteps(date),
    history: [
      {
        date: now.toLocaleString("sr-RS"),
        text: "Dokument je podnet na verifikaciju.",
      },
    ],
  };

  await saveFile(id, file);

  try {
    const chainResult = await registerCredentialHash(document);
    document.chainMode = chainResult.mode;
    document.chainTx = chainResult.transactionHash;
  } catch (error) {
    document.chainMode = "error";
    document.chainError = error.message;
  }

  persistDocuments(userId, [document, ...documents]);
  return document;
}

async function updateDocument(userId, documentId, formData, file) {
  const documents = getDocuments(userId);
  const current = documents.find((document) => document.id === documentId);

  if (!current) throw new Error("Dokument nije pronađen.");

  const now = new Date();
  const fileHash = file ? await calculateFileHash(file) : current.fileHash;
  const updated = {
    ...current,
    ...formData,
    status: "pending",
    fileName: file?.name || current.fileName,
    fileType: file?.type || current.fileType,
    fileSize: file?.size || current.fileSize,
    fileHash,
    version: current.version + 1,
    updatedAt: now.toISOString(),
    authority: formData.institution,
    currentPhase: "Čeka se formalna provera nove verzije",
    explanation:
      "Dostavljena je nova verzija dokumenta. Prethodna verifikacija više se ne primenjuje dok nova verzija ne prođe proveru.",
    verificationSteps: buildInitialSteps(now.toLocaleDateString("sr-RS")),
    history: [
      ...(current.history || []),
      {
        date: now.toLocaleString("sr-RS"),
        text: `Dodata je nova verzija dokumenta (verzija ${current.version + 1}).`,
      },
    ],
  };

  if (file) await saveFile(documentId, file);

  try {
    const chainResult = await registerCredentialVersion(updated);
    updated.chainMode = chainResult.mode;
    updated.chainTx = chainResult.transactionHash;
  } catch (error) {
    updated.chainMode = "error";
    updated.chainError = error.message;
  }

  persistDocuments(
    userId,
    documents.map((document) =>
      document.id === documentId ? updated : document,
    ),
  );

  return updated;
}

function getStatistics(documents) {
  return {
    total: documents.length,
    verified: documents.filter((document) => document.status === "verified").length,
    pending: documents.filter((document) =>
      ["pending", "needs_update"].includes(document.status),
    ).length,
  };
}

export default {
  getDocuments,
  getAllCandidateDocuments,
  getFile,
  createDocument,
  updateDocument,
  getStatistics,
  updateVerification,
};
