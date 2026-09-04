/*
  Integraciona granica prema budućem Solidity ugovoru.
  React komponente ne pozivaju MetaMask direktno, već koriste ovaj servis.

  Kada pametni ugovor bude završen, ovde treba dodati:
  - ABI ugovora
  - adresu ugovora
  - podržani chain ID
  - ethers ili viem klijent
  - mapiranje Solidity događaja na statuse interfejsa
*/

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask nije pronađen u pregledaču.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0] || null;
}

export async function registerCredentialHash(_credential) {
  // Budući poziv npr. contract.createCredential(...)
  return { mode: "demo", transactionHash: null };
}

export async function registerCredentialVersion(_credential) {
  // Budući poziv koji kreira novu verziju, bez brisanja stare.
  return { mode: "demo", transactionHash: null };
}

export async function grantCredentialAccess(_grant) {
  // Budući dokaz davanja vremenski ograničenog pristupa.
  return { mode: "demo", transactionHash: null };
}

export async function revokeCredentialAccess(_grantId) {
  return { mode: "demo", transactionHash: null };
}

export async function recordVerificationStatus(_credentialId, _status) {
  // Budući poziv ovlašćenog izdavaoca/kontrolora ka pametnom ugovoru.
  return { mode: "demo", transactionHash: null };
}
