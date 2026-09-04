const AUDIT_KEY = "carepass_audit_events";

function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_KEY)) || [];
  } catch {
    return [];
  }
}

function record(actor, action, subject, result, details = "") {
  const event = {
    id: crypto.randomUUID(),
    actorId: actor.id,
    actorRole: actor.role,
    actorName: actor.fullName,
    action,
    subject,
    result,
    details,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(AUDIT_KEY, JSON.stringify([event, ...getEvents()]));
  return event;
}

export default { getEvents, record };
