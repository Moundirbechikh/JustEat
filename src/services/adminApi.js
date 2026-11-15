const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = "jb_admin_token";
const ROLE_KEY = "jb_admin_role";
const DEBUG = false;

function readStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function readStoredRole() {
  try {
    return sessionStorage.getItem(ROLE_KEY) || "";
  } catch {
    return "";
  }
}

export function clearAdminSession() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ROLE_KEY);
  } catch {
    // Ignoré
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("admin-unauthorized"));
  }
}

export function setAdminSession(token, role) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
    if (role) sessionStorage.setItem(ROLE_KEY, role);
    else sessionStorage.removeItem(ROLE_KEY);
  } catch {
    // Ignoré
  }
}

function logDebug(label, payload) {
  if (!DEBUG) return;
  console.log(label, payload);
}

function normalizeResponse(data) {
  if (!data || data.ok === false) {
    const code = data?.code || "BAD_REQUEST";
    const error = data?.error || "Erreur inconnue";
    const err = new Error(error);
    err.code = code;
    throw err;
  }
  return data;
}

function parseJsonResponse(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
}

async function request(action, payload = {}, requireAuth = true) {
  if (!API_URL) throw new Error("VITE_API_URL manquant");

  const body = { action, ...payload };
  if (requireAuth) {
    const token = readStoredToken();
    if (!token) {
      const err = new Error("Jeton manquant");
      err.code = "UNAUTHORIZED";
      throw err;
    }
    body.token = token;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = new Error("Connexion impossible avec l’API admin");
      err.code = "NETWORK";
      throw err;
    }

    const text = await res.text();
    const data = parseJsonResponse(text);

    if (data?.code === "UNAUTHORIZED") {
      clearAdminSession();
    }

    return normalizeResponse(data);
  } catch (error) {
    if (error?.code === "UNAUTHORIZED") {
      clearAdminSession();
    }
    throw error;
  }
}

export async function adminLogin(password) {
  const data = await request("adminLogin", { password }, false);
  setAdminSession(data.token, data.role);
  return data;
}

export async function adminOrders(version) {
  return request(
    "adminOrders",
    version === undefined || version === null ? {} : { version },
  );
}

export async function adminSetOrderStatus(orderId, status) {
  return request("adminSetOrderStatus", { orderId, status });
}

export async function adminSetPaid(orderId, paid) {
  return request("adminSetPaid", { orderId, paid });
}

export async function adminTables() {
  return request("adminTables");
}

export async function adminPayTable(table) {
  return request("adminPayTable", { table });
}

export async function adminSetTableAvailable(table, available) {
  return request("adminSetTableAvailable", { table, available });
}

export async function adminProducts() {
  return request("adminProducts");
}

export async function adminSetAvailability(kind, id, available) {
  return request("adminSetAvailability", { kind, id, available });
}

export async function adminResetAvailability() {
  logDebug("[adminResetAvailability] start", {});
  return request("adminResetAvailability");
}

export async function adminCreateProduct(product) {
  return request("adminCreateProduct", { product });
}

export async function adminConfigGet() {
  logDebug("[adminConfigGet] fetch config", {});
  return request("adminConfigGet");
}

export async function adminConfigSet(key, value) {
  logDebug("[adminConfigSet] start", { key, value });
  return request("adminConfigSet", { key, value });
}

export function getAdminSession() {
  return {
    token: readStoredToken(),
    role: readStoredRole(),
  };
}
