const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarePassRegistry", function () {
  async function deployFixture() {
    const [owner, candidate, institution, stranger] = await ethers.getSigners();
    const CarePassRegistry = await ethers.getContractFactory("CarePassRegistry");
    const registry = await CarePassRegistry.deploy();
    await registry.waitForDeployment();
    return { registry, owner, candidate, institution, stranger };
  }

  const hash = ethers.keccak256(ethers.toUtf8Bytes("diploma-file-bytes"));

  it("registers a credential and reads it back", async function () {
    const { registry, candidate } = await deployFixture();

    await expect(
      registry.connect(candidate).registerCredential("credential-001", hash, "Diploma", "Univerzitet u Beogradu"),
    )
      .to.emit(registry, "CredentialRegistered")
      .withArgs("credential-001", 0n, hash, "Diploma", "Univerzitet u Beogradu", candidate.address);

    const latest = await registry.getLatestVersion("credential-001");
    expect(latest.documentHash).to.equal(hash);
    expect(latest.status).to.equal(0n); // Pending
    expect(latest.versionIndex).to.equal(0n);
  });

  it("only an authorized institution can record a verification status", async function () {
    const { registry, candidate, institution, stranger } = await deployFixture();
    await registry.connect(candidate).registerCredential("credential-001", hash, "Diploma", "Univerzitet u Beogradu");

    await expect(
      registry.connect(stranger).recordVerificationStatus("credential-001", 0, 1),
    ).to.be.revertedWith("CarePass: not an authorized institution");

    await registry.setInstitutionAuthorization(institution.address, true);
    await expect(registry.connect(institution).recordVerificationStatus("credential-001", 0, 1))
      .to.emit(registry, "VerificationStatusUpdated")
      .withArgs("credential-001", 0n, 1n, institution.address);

    const latest = await registry.getLatestVersion("credential-001");
    expect(latest.status).to.equal(1n); // Verified
  });

  it("keeps old versions in history when a new version is registered", async function () {
    const { registry, candidate, institution } = await deployFixture();
    await registry.setInstitutionAuthorization(institution.address, true);

    await registry.connect(candidate).registerCredential("credential-001", hash, "Diploma", "Univerzitet u Beogradu");
    await registry.connect(institution).recordVerificationStatus("credential-001", 0, 1);

    const newHash = ethers.keccak256(ethers.toUtf8Bytes("diploma-file-bytes-v2"));
    await registry.connect(candidate).registerCredential("credential-001", newHash, "Diploma", "Univerzitet u Beogradu");

    expect(await registry.getVersionCount("credential-001")).to.equal(2n);

    const oldVersion = await registry.getVersion("credential-001", 0);
    expect(oldVersion.documentHash).to.equal(hash);
    expect(oldVersion.status).to.equal(1n); // still Verified, untouched

    const newVersion = await registry.getVersion("credential-001", 1);
    expect(newVersion.documentHash).to.equal(newHash);
    expect(newVersion.status).to.equal(0n); // Pending again
  });

  it("blocks a different wallet from adding versions to someone else's credential", async function () {
    const { registry, candidate, stranger } = await deployFixture();
    await registry.connect(candidate).registerCredential("credential-001", hash, "Diploma", "Univerzitet u Beogradu");

    await expect(
      registry.connect(stranger).registerCredential("credential-001", hash, "Diploma", "Univerzitet u Beogradu"),
    ).to.be.revertedWith("CarePass: not the credential owner");
  });

});
