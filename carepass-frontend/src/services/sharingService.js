const SHARING_PREFIX = "carepass_sharing_";

function storageKey(userId) {
  return `${SHARING_PREFIX}${userId}`;
}

function getGrants(userId) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId))) || [];
  } catch {
    return [];
  }
}

function saveGrants(userId, grants) {
  localStorage.setItem(storageKey(userId), JSON.stringify(grants));
}

function createGrant(userId, data) {
  const grants = getGrants(userId);
  const grant = {
    id: crypto.randomUUID(),
    ...data,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  saveGrants(userId, [grant, ...grants]);
  return grant;
}

function revokeGrant(userId, grantId) {
  const grants = getGrants(userId).map((grant) =>
    grant.id === grantId
      ? { ...grant, status: "revoked", revokedAt: new Date().toISOString() }
      : grant,
  );

  saveGrants(userId, grants);
  return grants;
}

export default { getGrants, createGrant, revokeGrant };
