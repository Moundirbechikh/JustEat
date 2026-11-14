// URL de ton Apps Script (une fois publié) : VITE_API_URL=https://script.google.com/macros/s/XXXX/exec
const API_URL = import.meta.env.VITE_API_URL;

function safeJsonParse(text) {
  if (!text || typeof text !== "string") return {};
  const trimmed = text.trim();
  if (!trimmed) return {};

  try {
    return JSON.parse(trimmed);
  } catch {
    return { ok: false, error: trimmed };
  }
}

function readRecentOrders() {
  try {
    const raw = localStorage.getItem("jb_recent_orders");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLastOrder() {
  try {
    const raw = localStorage.getItem("jb_last_order");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getRecentOrders() {
  return readRecentOrders();
}

function saveRecentOrders(next) {
  try {
    localStorage.setItem("jb_recent_orders", JSON.stringify(next));
  } catch {
    // ignoré
  }
}

/**
 * Récupère le menu depuis le Google Sheet (via Apps Script).
 * Renvoie { products: [...] }.
 */
export async function fetchMenu() {
  if (!API_URL) throw new Error("VITE_API_URL manquant");
  const res = await fetch(`${API_URL}?action=menu`);
  if (!res.ok) throw new Error("Impossible de charger le menu");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

/**
 * Envoie la commande.
 * - Sans VITE_API_URL : mode test, la commande est simulée (rien n'est enregistré).
 * - Avec VITE_API_URL : POST en text/plain (évite le preflight CORS d'Apps Script).
 *   Le script doit répondre { ok: true, orderId: "#042" } et recalculer le total lui-même.
 */
export async function createOrder(order) {
  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    let n = 1;
    try {
      n = Number(localStorage.getItem("jb_order_counter") || "0") + 1;
      localStorage.setItem("jb_order_counter", String(n));
    } catch {
      // ignoré
    }
    const orderId = `#${String(n).padStart(3, "0")}`;
    saveLastOrder(orderId, order);
    return { ok: true, orderId, simulated: true };
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "createOrder", order }),
    });

    const text = await res.text();
    const data = safeJsonParse(text);

    if (!res.ok || data?.ok === false) {
      const message =
        data?.error || data?.message || text || "Commande refusée";
      throw new Error(message);
    }

    if (!data || data.ok === undefined || !data.orderId) {
      throw new Error(
        "Réponse de commande invalide. Vérifie le déploiement Apps Script.",
      );
    }

    saveLastOrder(data.orderId, order, data);
    return data;
  } catch (error) {
    const msg = error?.message || "Impossible de créer la commande.";
    console.error("[createOrder] erreur", {
      error,
      payload: order,
      apiUrl: API_URL,
    });
    throw new Error(msg);
  }
}

function saveLastOrder(orderId, order, response = {}) {
  const record = {
    orderId,
    createdAt: Date.now(),
    status: response?.status || "reçue",
    source: order?.table ? "table" : "online",
    table: order?.table || null,
    phone: order?.phone || "",
    name: order?.name || "",
  };

  try {
    localStorage.setItem("jb_last_order", JSON.stringify(record));
    const recent = readRecentOrders();
    const next = [
      record,
      ...recent.filter((item) => item.orderId !== record.orderId),
    ].slice(0, 8);
    saveRecentOrders(next);
  } catch {
    // ignoré
  }
}
