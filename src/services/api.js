import { tableNumber } from '../utils/tables'

// URL de ton Apps Script : VITE_API_URL=https://script.google.com/macros/s/XXXX/exec
const API_URL = import.meta.env.VITE_API_URL

// Stockage dans le navigateur du client
const LAST_ORDER_KEY = 'jb_last_order' // dernière commande EN LIGNE
const RECENT_ORDERS_KEY = 'jb_recent_orders' // commandes EN LIGNE récentes
const TABLE_ORDER_KEY = 'jb_table_order' // dernière commande À TABLE (une seule)
const TABLE_ORDER_MAX_AGE_MS = 12 * 60 * 60 * 1000 // 12 h

/* ---------- Helpers ---------- */

function safeJsonParse(text) {
  if (!text || typeof text !== 'string') return {}
  const trimmed = text.trim()
  if (!trimmed) return {}
  try {
    return JSON.parse(trimmed)
  } catch {
    return { ok: false, error: trimmed }
  }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignoré
  }
}

/* ---------- Commandes mémorisées sur cet appareil ---------- */

// Commandes en ligne uniquement : les commandes à table sont rangées à part
export function getRecentOrders() {
  const list = readJson(RECENT_ORDERS_KEY, [])
  return Array.isArray(list) ? list.filter((order) => order?.source !== 'table') : []
}

export function getLastOrder() {
  const order = readJson(LAST_ORDER_KEY, null)
  return order && order.source !== 'table' ? order : null
}

// La commande à table de CET appareil, pour CETTE table, si elle date de moins de 12 h
export function getTableOrder(tableId) {
  const record = readJson(TABLE_ORDER_KEY, null)
  if (!record?.orderId) return null
  if (tableNumber(record.table) !== tableNumber(tableId)) return null
  if (Date.now() - Number(record.createdAt || 0) > TABLE_ORDER_MAX_AGE_MS) return null
  return record
}

function saveOrder(orderId, order, response = {}) {
  const isTable = Boolean(order?.table)
  const record = {
    orderId,
    editToken: response?.editToken || '', // code secret : sert à suivre / modifier SA commande
    createdAt: Date.now(),
    status: response?.status || 'reçue',
    source: isTable ? 'table' : 'online',
    table: isTable ? tableNumber(order.table) : null,
    phone: order?.phone || '',
    name: order?.name || '',
  }

  if (isTable) {
    writeJson(TABLE_ORDER_KEY, record)
    return
  }

  writeJson(LAST_ORDER_KEY, record)
  const recent = getRecentOrders()
  writeJson(
    RECENT_ORDERS_KEY,
    [record, ...recent.filter((item) => item.orderId !== record.orderId)].slice(0, 8)
  )
}

/* ---------- Suivi ---------- */

// Le serveur ne répond que si le code secret correspond à la commande
export async function trackOrder(orderId, editToken) {
  const id = String(orderId ?? '').trim()
  const token = String(editToken ?? '').trim()
  if (!API_URL || !id || !token) return null

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'trackOrder', orderId: id, editToken: token }),
    })
    const data = safeJsonParse(await res.text())
    if (!res.ok || data?.ok !== true || !data.order) return null
    return data.order
  } catch {
    return null
  }
}

export function getOrderById(orderId, editToken) {
  return trackOrder(orderId, editToken)
}

/* ---------- Menu ---------- */

/**
 * Récupère le menu depuis le Google Sheet (via Apps Script).
 * Renvoie { products, options, config }.
 */
export async function fetchMenu() {
  if (!API_URL) throw new Error('VITE_API_URL manquant')
  const res = await fetch(`${API_URL}?action=menu`)
  if (!res.ok) throw new Error('Impossible de charger le menu')
  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}

/* ---------- Commande ---------- */

/**
 * Envoie la commande.
 * - Sans VITE_API_URL : mode test, la commande est simulée (rien n'est enregistré).
 * - Avec VITE_API_URL : POST en text/plain (évite le preflight CORS d'Apps Script).
 *   Le script répond { ok: true, orderId, editToken, status } et recalcule le total lui-même.
 * En cas de refus, l'erreur porte le code du serveur dans error.code (ex. TABLE_BUSY).
 */
export async function createOrder(order) {
  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 700))
    let n = 1
    try {
      n = Number(localStorage.getItem('jb_order_counter') || '0') + 1
      localStorage.setItem('jb_order_counter', String(n))
    } catch {
      // ignoré
    }
    const orderId = `#${String(n).padStart(3, '0')}`
    saveOrder(orderId, order)
    return { ok: true, orderId, simulated: true }
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'createOrder', order }),
    })

    const text = await res.text()
    const data = safeJsonParse(text)

    if (!res.ok || data?.ok === false) {
      const error = new Error(data?.error || data?.message || text || 'Commande refusée')
      error.code = data?.code
      throw error
    }

    if (!data || data.ok === undefined || !data.orderId) {
      throw new Error('Réponse de commande invalide. Vérifie le déploiement Apps Script.')
    }

    saveOrder(data.orderId, order, data)
    return data
  } catch (error) {
    console.error('[createOrder] erreur', error)
    if (error?.code) throw error
    if (error?.name === 'TypeError') {
      throw new Error('Impossible de contacter le serveur. Vérifie ta connexion et réessaie.')
    }
    throw new Error(error?.message || 'Impossible de créer la commande.')
  }
}