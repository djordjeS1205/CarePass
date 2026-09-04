const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const CarePassRegistry = await hre.ethers.getContractFactory("CarePassRegistry");
  const registry = await CarePassRegistry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("CarePassRegistry deployed to:", address);
  console.log("Deployer address:", deployer.address);
  console.log("\nNext steps:");
  console.log(`1. Put VITE_CONTRACT_ADDRESS=${address} in carepass-frontend/.env`);
  console.log("2. Authorize each institution wallet with: npm run authorize:sepolia -- <institutionAddress>");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
