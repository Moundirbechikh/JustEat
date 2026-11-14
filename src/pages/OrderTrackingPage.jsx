import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Phone, Search, UtensilsCrossed } from 'lucide-react'
import { getLastOrder, getRecentOrders } from '../services/api'

const STATUS_STEPS = [
  { key: 'reçue', label: 'Commande reçue' },
  { key: 'À confirmer', label: 'À confirmer' },
  { key: 'En préparation', label: 'En préparation' },
  { key: 'Prête', label: 'Prête' },
  { key: 'Servie', label: 'Servie' },
]

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getStatusIndex(status) {
  const normalized = String(status || '').trim()
  const index = STATUS_STEPS.findIndex((step) => step.key === normalized)
  return index >= 0 ? index : 0
}

export default function OrderTrackingPage() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const last = getLastOrder()
    setSelected(last)
  }, [])

  const orders = useMemo(() => {
    const recent = getRecentOrders()
    const merged = [selected, ...recent].filter(Boolean)
    const dedupe = new Map()
    merged.forEach((order) => {
      if (order?.orderId) dedupe.set(order.orderId, order)
    })
    return Array.from(dedupe.values())
  }, [selected])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((order) => {
      const haystack = [order.orderId, order.name, order.table, order.phone].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [orders, search])

  const activeOrder = filtered[0] || selected || null
  const statusIndex = getStatusIndex(activeOrder?.status)

  return (
    <main className="min-h-screen bg-[#F5F2EE] px-5 pb-16 pt-28 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/menu" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700">
            <ArrowLeft size={16} />
            Retour au menu
          </Link>
        </div>

        <div className="rounded-4xl border border-neutral-200 bg-white p-6 shadow-xl shadow-black/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Suivi</p>
              <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tighter">Ma commande</h1>
            </div>

            <label className="flex w-full max-w-md items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
              <Search size={16} className="text-neutral-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Recherche : numéro, nom, table…"
                className="w-full bg-transparent outline-none placeholder:text-neutral-400"
              />
            </label>
          </div>
        </div>

        {!activeOrder ? (
          <div className="mt-8 rounded-4xl border border-dashed border-neutral-300 bg-white p-10 text-center">
            <p className="font-display text-3xl font-extrabold tracking-tighter">Aucune commande récente</p>
            <p className="mt-3 text-neutral-600">Passe une commande pour suivre son statut ici.</p>
            <Link to="/menu" className="mt-6 inline-flex rounded-full bg-ketchup px-5 py-3 font-bold text-white">Commander</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-4xl border border-neutral-200 bg-white p-5 shadow-xl shadow-black/5">
              <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Commande</p>
                  <h2 className="mt-1 font-display text-4xl font-extrabold tracking-tighter">{activeOrder.orderId}</h2>
                </div>
                <span className="inline-flex items-center rounded-full bg-ketchup/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-ketchup">
                  {activeOrder.status || 'reçue'}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {STATUS_STEPS.map((step, index) => {
                  const done = index <= statusIndex
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div className={`mt-0.5 grid h-8 w-8 place-items-center rounded-full border ${done ? 'border-ketchup bg-ketchup text-white' : 'border-neutral-300 bg-neutral-100 text-neutral-500'}`}>
                        {done ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}
                      </div>
                      <div className="flex-1 border-b border-neutral-100 pb-3">
                        <p className={`font-bold ${done ? 'text-neutral-900' : 'text-neutral-500'}`}>{step.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-4xl border border-neutral-200 bg-white p-5 shadow-xl shadow-black/5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Résumé</p>
                <div className="mt-4 space-y-3 text-sm text-neutral-700">
                  <div className="flex items-center gap-2"><UtensilsCrossed size={16} className="text-ketchup" /> <span>{activeOrder.source === 'table' ? `Table ${activeOrder.table || '—'}` : 'Commande en ligne'}</span></div>
                  <div className="flex items-center gap-2"><MapPin size={16} className="text-ketchup" /> <span>{activeOrder.source === 'table' ? 'Commande à table' : 'Retrait / livraison'}</span></div>
                  {activeOrder.phone && <div className="flex items-center gap-2"><Phone size={16} className="text-ketchup" /> <span>{activeOrder.phone}</span></div>}
                  <div className="flex items-center gap-2"><Clock3 size={16} className="text-ketchup" /> <span>{formatDate(activeOrder.createdAt)}</span></div>
                </div>
              </div>

              <div className="rounded-4xl border border-neutral-200 bg-white p-5 shadow-xl shadow-black/5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Historique</p>
                <div className="mt-4 space-y-3">
                  {filtered.length > 1 ? (
                    filtered.map((order) => (
                      <button
                        key={order.orderId}
                        type="button"
                        onClick={() => setSelected(order)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left ${selected?.orderId === order.orderId ? 'border-ketchup bg-ketchup/5' : 'border-neutral-200 bg-neutral-50'}`}
                      >
                        <div>
                          <p className="font-bold text-neutral-900">{order.orderId}</p>
                          <p className="text-xs text-neutral-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-600">{order.status || 'reçue'}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-600">Une seule commande enregistrée.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
