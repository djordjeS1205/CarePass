import { demoProfile, demoUsers } from "../data/mockData";

const CURRENT_USER_KEY = "carepass_current_user";
const USERS_KEY = "carepass_users";
const USERS_VERSION_KEY = "carepass_users_version";
const USERS_VERSION = "2";

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function initializeUsers() {
  const users = readUsers();
  if (localStorage.getItem(USERS_VERSION_KEY) !== USERS_VERSION) {
    for (const demoUser of demoUsers) users[demoUser.id] = demoUser;
    localStorage.setItem(USERS_VERSION_KEY, USERS_VERSION);
  } else {
    for (const demoUser of demoUsers) {
      if (!users[demoUser.id]) users[demoUser.id] = demoUser;
    }
  }
  saveUsers(users);
  return users;
}

function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function login(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = initializeUsers();
  const savedUser = Object.values(users).find(
    (user) => user.email.toLowerCase() === normalizedEmail,
  );

  if (!savedUser) throw new Error("Nalog sa ovom email adresom ne postoji.");
  if (savedUser.password !== password) throw new Error("Uneta lozinka nije ispravna.");
  const { password: _password, ...safeUser } = savedUser;
  saveCurrentUser(safeUser);
  return safeUser;
}

function register({ fullName, email, password }) {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (
    Object.values(users).some(
      (user) => user.email.toLowerCase() === normalizedEmail,
    )
  ) {
    throw new Error("Nalog sa ovom email adresom već postoji.");
  }

  const user = {
    id: crypto.randomUUID(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    profession: "Lekar",
    country: "Srbija",
    role: "candidate",
  };

  users[user.id] = { ...user, password };
  saveUsers(users);
  saveCurrentUser(user);
  return user;
}

function updateProfile(userId, changes) {
  const users = readUsers();
  const existingUser = users[userId] || { ...demoProfile, id: userId };
  const updatedStoredUser = {
    ...existingUser,
    fullName: changes.fullName.trim(),
    email: changes.email.trim().toLowerCase(),
  };

  users[userId] = updatedStoredUser;
  saveUsers(users);

  const { password: _password, ...safeUser } = updatedStoredUser;
  saveCurrentUser(safeUser);
  return safeUser;
}

function changePassword(userId, currentPassword, newPassword) {
  const users = readUsers();
  const existingUser = users[userId];

  if (!existingUser) {
    throw new Error("Korisnički nalog nije pronađen.");
  }

  if (existingUser.password && existingUser.password !== currentPassword) {
    throw new Error("Trenutna lozinka nije ispravna.");
  }

  users[userId] = { ...existingUser, password: newPassword };
  saveUsers(users);
}

function getCurrentUser() {
  initializeUsers();
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
}

function getUserById(userId) {
  const user = initializeUsers()[userId];
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function getUsersByRole(role) {
  return Object.values(initializeUsers())
    .filter((user) => user.role === role)
    .map(({ password: _password, ...user }) => user);
}

function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export default {
  login,
  register,
  updateProfile,
  changePassword,
  getCurrentUser,
  getUserById,
  getUsersByRole,
  logout,
};
