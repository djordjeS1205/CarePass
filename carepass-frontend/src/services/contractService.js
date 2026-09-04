/*
  Integraciona granica prema Solidity ugovoru CarePassRegistry.
  React komponente ne pozivaju MetaMask direktno, već koriste ovaj servis.

  Ugovor: contracts/contracts/CarePassRegistry.sol (deployuje se na Sepolia testnet).
  Dok VITE_CONTRACT_ADDRESS nije podešen (.env u ovom projektu), sve funkcije
  rade u demo režimu i ne pokušavaju da pozovu MetaMask.
*/

import { BrowserProvider, Contract, isHexString } from "ethers";
import contractAbi from "../contracts/CarePassRegistryAbi.json";

export const SEPOLIA_CHAIN_ID = 11155111n;

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

const STATUS_TO_INDEX = {
  pending: 0,
  verified: 1,
  rejected: 2,
  needs_update: 3,
  revoked: 4,
};

const INDEX_TO_STATUS = ["pending", "verified", "rejected", "needs_update", "revoked"];

export function isContractConfigured() {
  return Boolean(CONTRACT_ADDRESS);
}

function toBytes32Hash(fileHash) {
  if (!fileHash) return `0x${"0".repeat(64)}`;
  const value = fileHash.startsWith("0x") ? fileHash : `0x${fileHash}`;
  if (!isHexString(value, 32)) {
    throw new Error("Dokument nema važeći SHA-256 heš za upis na blockchain.");
  }
  return value;
}

async function getContract(withSigner) {
  if (!window.ethereum) {
    throw new Error("MetaMask nije pronađen u pregledaču.");
  }
  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  if (network.chainId !== SEPOLIA_CHAIN_ID) {
    throw new Error("Prebacite MetaMask na Sepolia test mrežu da biste nastavili.");
  }
  if (withSigner) {
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, contractAbi, signer);
  }
  return new Contract(CONTRACT_ADDRESS, contractAbi, provider);
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask nije pronađen u pregledaču.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0] || null;
}

async function registerOnChain(credential) {
  const contract = await getContract(true);
  const tx = await contract.registerCredential(
    credential.id,
    toBytes32Hash(credential.fileHash),
    credential.type || "",
    credential.institution || "",
  );
  const receipt = await tx.wait();
  return { mode: "chain", transactionHash: receipt.hash };
}

export async function registerCredentialHash(credential) {
  if (!isContractConfigured()) return { mode: "demo", transactionHash: null };
  return registerOnChain(credential);
}

export async function registerCredentialVersion(credential) {
  if (!isContractConfigured()) return { mode: "demo", transactionHash: null };
  return registerOnChain(credential);
}

export async function grantCredentialAccess(_grant) {
  // Deljenje pristupa ostaje van lanca - dokazni model iz master rada
  // upisuje samo heš/status verifikacije, ne i kome je dokument deljen.
  return { mode: "demo", transactionHash: null };
}

export async function revokeCredentialAccess(_grantId) {
  return { mode: "demo", transactionHash: null };
}

export async function recordVerificationStatus(credentialId, versionIndex, status) {
  if (!isContractConfigured()) return { mode: "demo", transactionHash: null };
  const statusIndex = STATUS_TO_INDEX[status];
  if (statusIndex === undefined) {
    throw new Error(`Nepoznat status za upis na blockchain: ${status}`);
  }

  const contract = await getContract(true);
  const tx = await contract.recordVerificationStatus(credentialId, versionIndex, statusIndex);
  const receipt = await tx.wait();
  return { mode: "chain", transactionHash: receipt.hash };
}

export async function getCredentialChainRecord(credentialId) {
  if (!isContractConfigured()) return null;
  const contract = await getContract(false);
  const versionCount = await contract.getVersionCount(credentialId);
  if (versionCount === 0n) return null;

  const latest = await contract.getLatestVersion(credentialId);
  return {
    documentHash: latest.documentHash,
    documentType: latest.documentType,
    issuer: latest.issuer,
    status: INDEX_TO_STATUS[Number(latest.status)],
    submittedBy: latest.submittedBy,
    decidedBy: latest.decidedBy,
    recordedAt: new Date(Number(latest.recordedAt) * 1000).toISOString(),
    versionIndex: Number(latest.versionIndex),
    versionCount: Number(versionCount),
  };
}

export default {
  isContractConfigured,
  connectWallet,
  registerCredentialHash,
  registerCredentialVersion,
  grantCredentialAccess,
  revokeCredentialAccess,
  recordVerificationStatus,
  getCredentialChainRecord,
};
