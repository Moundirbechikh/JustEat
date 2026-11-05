// URL de ton Apps Script (une fois publié) : VITE_API_URL=https://script.google.com/macros/s/XXXX/exec
const API_URL = import.meta.env.VITE_API_URL

/**
 * Envoie la commande.
 * - Sans VITE_API_URL : mode test, la commande est simulée (rien n'est enregistré).
 * - Avec VITE_API_URL : POST en text/plain (évite le preflight CORS d'Apps Script).
 *   Le script doit répondre { ok: true, orderId: "#042" } et recalculer le total lui-même.
 */
export async function createOrder(order) {
  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 700))
    let n = 1
    try {
      n = Number(localStorage.getItem('jb_order_counter') || '0') + 1
      localStorage.setItem('jb_order_counter', String(n))
    } catch {
      /* ignoré */
    }
    const orderId = `#${String(n).padStart(3, '0')}`
    saveLastOrder(orderId)
    return { ok: true, orderId, simulated: true }
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'createOrder', order }),
  })
  if (!res.ok) throw new Error('Erreur réseau')
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'Commande refusée')
  saveLastOrder(data.orderId)
  return data
}

// Mémorise la dernière commande pour la future page /suivi
function saveLastOrder(orderId) {
  try {
    localStorage.setItem('jb_last_order', JSON.stringify({ orderId, createdAt: Date.now() }))
  } catch {
    /* ignoré */
  }
}
