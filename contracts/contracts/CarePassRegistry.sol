// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CarePassRegistry
/// @notice On-chain proof-of-verification registry for CarePass credentials.
/// The document file itself never touches the chain: only its hash, type,
/// issuer, date and status are recorded. Updating a credential appends a new
/// version instead of overwriting the previous one, so the old record stays
/// in history as evidence.
contract CarePassRegistry {
    enum Status {
        Pending,
        Verified,
        Rejected,
        NeedsUpdate,
        Revoked
    }

    struct CredentialVersion {
        bytes32 documentHash;
        string documentType;
        string issuer;
        Status status;
        address submittedBy;
        address decidedBy;
        uint256 recordedAt;
    }

    address public owner;

    mapping(address => bool) public authorizedInstitutions;
    mapping(string => CredentialVersion[]) private credentialVersions;
    mapping(string => address) public credentialOwner;

    event InstitutionAuthorized(address indexed institution, bool authorized);
    event CredentialRegistered(
        string indexed credentialId,
        uint256 versionIndex,
        bytes32 documentHash,
        string documentType,
        string issuer,
        address indexed submittedBy
    );
    event VerificationStatusUpdated(
        string indexed credentialId,
        uint256 versionIndex,
        Status status,
        address indexed institution
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "CarePass: not contract owner");
        _;
    }

    modifier onlyAuthorizedInstitution() {
        require(authorizedInstitutions[msg.sender], "CarePass: not an authorized institution");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Owner-controlled allowlist of wallets that represent an
    /// authorized issuer/controller and may confirm or reject credentials.
    function setInstitutionAuthorization(address institution, bool authorized) external onlyOwner {
        authorizedInstitutions[institution] = authorized;
        emit InstitutionAuthorized(institution, authorized);
    }

    /// @notice Registers a new credential or a new version of an existing
    /// one. Never overwrites a previous version.
    function registerCredential(
        string calldata credentialId,
        bytes32 documentHash,
        string calldata documentType,
        string calldata issuer
    ) external returns (uint256 versionIndex) {
        CredentialVersion[] storage versions = credentialVersions[credentialId];

        if (versions.length == 0) {
            credentialOwner[credentialId] = msg.sender;
        } else {
            require(credentialOwner[credentialId] == msg.sender, "CarePass: not the credential owner");
        }

        versions.push(
            CredentialVersion({
                documentHash: documentHash,
                documentType: documentType,
                issuer: issuer,
                status: Status.Pending,
                submittedBy: msg.sender,
                decidedBy: address(0),
                recordedAt: block.timestamp
            })
        );

        versionIndex = versions.length - 1;
        emit CredentialRegistered(credentialId, versionIndex, documentHash, documentType, issuer, msg.sender);
    }

    /// @notice Called by an authorized institution to confirm, reject or
    /// request a supplement for one specific version of a credential.
    function recordVerificationStatus(
        string calldata credentialId,
        uint256 versionIndex,
        Status status
    ) external onlyAuthorizedInstitution {
        CredentialVersion[] storage versions = credentialVersions[credentialId];
        require(versionIndex < versions.length, "CarePass: unknown credential version");

        versions[versionIndex].status = status;
        versions[versionIndex].decidedBy = msg.sender;
        emit VerificationStatusUpdated(credentialId, versionIndex, status, msg.sender);
    }

    function getVersionCount(string calldata credentialId) external view returns (uint256) {
        return credentialVersions[credentialId].length;
    }

    function getVersion(string calldata credentialId, uint256 versionIndex)
        external
        view
        returns (
            bytes32 documentHash,
            string memory documentType,
            string memory issuer,
            Status status,
            address submittedBy,
            address decidedBy,
            uint256 recordedAt
        )
    {
        CredentialVersion storage version = credentialVersions[credentialId][versionIndex];
        return (
            version.documentHash,
            version.documentType,
            version.issuer,
            version.status,
            version.submittedBy,
            version.decidedBy,
            version.recordedAt
        );
    }

    function getLatestVersion(string calldata credentialId)
        external
        view
        returns (
            bytes32 documentHash,
            string memory documentType,
            string memory issuer,
            Status status,
            address submittedBy,
            address decidedBy,
            uint256 recordedAt,
            uint256 versionIndex
        )
    {
        CredentialVersion[] storage versions = credentialVersions[credentialId];
        require(versions.length > 0, "CarePass: credential not found");
        versionIndex = versions.length - 1;
        CredentialVersion storage version = versions[versionIndex];
        return (
            version.documentHash,
            version.documentType,
            version.issuer,
            version.status,
            version.submittedBy,
            version.decidedBy,
            version.recordedAt,
            versionIndex
        );
    }
}
