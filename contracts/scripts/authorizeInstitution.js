const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const institutionAddress = process.env.INSTITUTION_ADDRESS || process.argv[2];

  if (!contractAddress) {
    throw new Error("Set CONTRACT_ADDRESS in contracts/.env to the deployed registry address.");
  }
  if (!institutionAddress) {
    throw new Error("Usage: INSTITUTION_ADDRESS=0x... npm run authorize:sepolia");
  }

  const registry = await hre.ethers.getContractAt("CarePassRegistry", contractAddress);
  const tx = await registry.setInstitutionAuthorization(institutionAddress, true);
  await tx.wait();

  console.log(`Authorized ${institutionAddress} as an institution on ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
