import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Bell,
  BellOff,
  Flame,
  RefreshCw,
  ShoppingBag,
  Utensils,
  XCircle,
} from 'lucide-react'
import logo from '../../assets/Logo1.png'
import usePolling from '../../hooks/usePolling'
import { adminOrders, adminSetOrderStatus, adminSetPaid } from '../../services/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'
import OrderCard from './OrderCard'

const FILTERS = [
  { id: 'Toutes', label: 'Toutes' },
  { id: 'Tables', label: 'En salle (Tables)' },
  { id: 'En ligne', label: 'En ligne' },
]

const STATUS_OPTIONS = ['Tous', 'À confirmer', 'En préparation', 'Prête', 'Servie', 'Refusée', 'Annulée']

function getStatusCount(orders, status) {
  return orders.filter((order) => order.status === status).length
}

function getLoadingKey(orderId, status) {
  const map = {
    'En préparation': 'confirm',
    'Prête': 'ready',
    'Servie': 'served',
    'Refusée': 'refuse',
    'Annulée': 'cancel',
  }
  return `${orderId}-${map[status] || 'status'}`
}

export default function OrdersPage() {
  const { role } = useAdminAuth()
  const reduce = useReducedMotion()
  const [orders, setOrders] = useState([])
  const [sourceFilter, setSourceFilter] = useState('Toutes')
  const [statusFilter, setStatusFilter] = useState('Tous')
  const [version, setVersion] = useState(null)
  const [loadingAction, setLoadingAction] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [newOrderIds, setNewOrderIds] = useState(new Set())
  const [connectionLost, setConnectionLost] = useState(false)
  const previousIdsRef = useRef(new Set())

  const fetchOrders = async () => {
    const data = await adminOrders(version ?? undefined)
    if (data.unchanged) return { unchanged: true, version }
    const nextOrders = Array.isArray(data.orders) ? data.orders : []
    const prevIds = previousIdsRef.current
    const newIds = nextOrders.filter((order) => !prevIds.has(order.orderId)).map((order) => order.orderId)
    previousIdsRef.current = new Set(nextOrders.map((order) => order.orderId))
    setVersion(data.version ?? version)
    setOrders(nextOrders)
    if (newIds.length > 0) {
      setNewOrderIds((current) => new Set([...current, ...newIds]))
      if (soundEnabled) {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext
          if (AudioCtx) {
            const ctx = new AudioCtx()
            const oscillator = ctx.createOscillator()
            const gain = ctx.createGain()
            oscillator.type = 'triangle'
            oscillator.frequency.value = 660
            gain.gain.value = 0.05
            oscillator.connect(gain)
            gain.connect(ctx.destination)
            oscillator.start()
            oscillator.stop(ctx.currentTime + 0.12)
          }
        } catch {
          // Ignoré
        }
      }
    }
    return data
  }

  const { error, refresh } = usePolling(fetchOrders, { interval: 10000, enabled: true })

  useEffect(() => {
    if (error) setConnectionLost(true)
    else setConnectionLost(false)
  }, [error])

  useEffect(() => {
    if (!newOrderIds.size) return undefined
    const timer = window.setTimeout(() => setNewOrderIds(new Set()), 2500)
    return () => clearTimeout(timer)
  }, [newOrderIds])

  useEffect(() => {
    if (!orders.length) return
    const count = orders.filter((o) => newOrderIds.has(o.orderId)).length
    if (!count) return
    document.title = `Just Burgers (${count})`
    return () => {
      document.title = 'Just Burgers'
    }
  }, [orders, newOrderIds])

  const filteredOrders = useMemo(() => {
    return [...orders]
      .filter((order) => {
        const sourceMatch =
          sourceFilter === 'Toutes' ||
          (sourceFilter === 'Tables' ? order.source === 'table' : order.source === 'online')
        const statusMatch = statusFilter === 'Tous' || order.status === statusFilter
        return sourceMatch && statusMatch
      })
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
  }, [orders, sourceFilter, statusFilter])

  const handleStatusChange = async (orderId, status) => {
    setLoadingAction(getLoadingKey(orderId, status))
    const previous = orders.find((order) => order.orderId === orderId)
    try {
      setOrders((current) => current.map((order) => (order.orderId === orderId ? { ...order, status } : order)))
      await adminSetOrderStatus(orderId, status)
      await refresh()
    } catch (err) {
      if (previous) {
        setOrders((current) =>
          current.map((order) => (order.orderId === orderId ? { ...order, status: previous.status } : order))
        )
      }
      alert(err?.message || 'Impossible de modifier la commande.')
    } finally {
      setLoadingAction('')
    }
  }

  const handlePaidChange = async (orderId, paid) => {
    setLoadingAction(`${orderId}-paid`)
    const previous = orders.find((order) => order.orderId === orderId)
    try {
      setOrders((current) => current.map((order) => (order.orderId === orderId ? { ...order, paid } : order)))
      await adminSetPaid(orderId, paid)
      await refresh()
    } catch (err) {
      if (previous) {
        setOrders((current) =>
          current.map((order) => (order.orderId === orderId ? { ...order, paid: previous.paid } : order))
        )
      }
      alert(err?.message || 'Impossible de mettre à jour le paiement.')
    } finally {
      setLoadingAction('')
    }
  }

  const handleRefuse = async (orderId) => {
    if (!window.confirm('Refuser cette commande ?')) return
    await handleStatusChange(orderId, 'Refusée')
  }

  const pendingCount = getStatusCount(orders, 'À confirmer')

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-white text-neutral-900">
      {/* ---------- EN-TÊTE HERO PLEIN ÉCRAN ---------- */}
      <header className="relative w-full overflow-hidden px-5 pb-8 pt-24 sm:px-6 sm:pb-10 md:pt-28 lg:px-12">
        {/* MOBILE ONLY : Courbe SVG rouge inversée en haut à GAUCHE */}
        <div className="pointer-events-none absolute left-0 top-0 z-0 h-36 w-44 sm:hidden">
          <svg viewBox="0 0 200 200" className="h-full w-full fill-[#C62F1D]" preserveAspectRatio="none">
            <path d="M 0,0 L 0,180 C 80,180 140,120 160,0 Z" />
          </svg>
        </div>

        {/* MOBILE ONLY : Logo blanc à l'intérieur de la courbe gauche */}
        <div className="pointer-events-none absolute left-2 top-3 z-10 flex items-center justify-center p-2 sm:hidden">
          <img
            src={logo}
            alt="Just Burgers"
            className="h-14 w-auto object-contain brightness-0 invert drop-shadow-md"
          />
        </div>

        {/* DESKTOP / TABLET ONLY : Courbe SVG rouge en haut à DROITE (inchangée) */}
        <div className="pointer-events-none absolute right-0 top-0 z-0 hidden h-72 w-80 sm:block md:h-80 md:w-[42%]">
          <svg viewBox="0 0 200 200" className="h-full w-full fill-[#C62F1D]" preserveAspectRatio="none">
            <path d="M 200,0 L 200,180 C 120,180 60,120 40,0 Z" />
          </svg>
        </div>

        {/* DESKTOP / TABLET ONLY : Logo blanc dans l'aplat rouge droit (inchangé) */}
        <div className="pointer-events-none absolute right-10 top-20 z-10 hidden items-center justify-center p-2 sm:flex">
          <img
            src={logo}
            alt="Just Burgers"
            className="h-24 w-auto object-contain brightness-0 invert drop-shadow-md md:h-32"
          />
        </div>

        <div className="relative z-10 w-full">
          {/* Badge (Desktop uniquement) + Titre centré sur mobile / à gauche sur desktop */}
          <div className="pt-8 text-center sm:pr-60 sm:pt-0 sm:text-left md:pr-72">
            <div className="mb-3 hidden items-center gap-2 rounded-full bg-[#C62F1D]/10 px-4 py-1.5 font-display text-xs font-extrabold uppercase tracking-wider text-[#C62F1D] sm:inline-flex">
              <Flame size={14} strokeWidth={2.5} />
              <span>Cuisine & Comptoir en direct</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tighter text-neutral-900 sm:text-6xl md:text-7xl">
              Suivi des commandes
            </h1>
          </div>

          {/* Description pleine largeur */}
          <div className="mt-4 w-full">
            <p className="w-full text-center text-sm leading-relaxed text-neutral-600 sm:text-left sm:text-base md:text-xl">
              Gère les commandes sur place et en ligne en temps réel. Confirme, lance en cuisine et encaisse en un clic.
            </p>
          </div>

          {/* Barre unique : Filtres source scrollables sur mobile + Boutons icônes compacts */}
          <div className="mt-7 flex w-full items-center justify-between gap-2.5 sm:mt-8 sm:flex-wrap sm:gap-4">
            {/* Filtres source : scroll horizontal sur mobile, wrap normal sur desktop */}
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-initial sm:flex-wrap sm:gap-2.5 sm:overflow-visible sm:py-0">
              {FILTERS.map((f) => {
                const active = sourceFilter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSourceFilter(f.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 font-display text-xs font-extrabold transition sm:px-6 sm:py-3 sm:text-sm ${
                      active
                        ? 'bg-[#C62F1D] text-white shadow-lg shadow-[#C62F1D]/25'
                        : 'border-2 border-black/10 bg-neutral-50 text-neutral-800 hover:border-[#C62F1D] hover:bg-white'
                    }`}
                  >
                    <span>{f.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Boutons Actualiser & Son : icône seule sur mobile, icône + texte sur desktop */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => refresh()}
                aria-label="Actualiser les commandes"
                title="Actualiser"
                className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full border-2 border-black/10 bg-neutral-50 font-display text-sm font-bold text-neutral-800 transition hover:border-[#C62F1D] hover:bg-white hover:text-[#C62F1D] sm:h-auto sm:w-auto sm:px-5 sm:py-3"
              >
                <RefreshCw size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                aria-label={soundEnabled ? 'Couper le son' : 'Activer le son'}
                title={soundEnabled ? 'Alerte sonore ON' : 'Son coupé'}
                className={`inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full font-display text-sm font-bold transition sm:h-auto sm:w-auto sm:px-5 sm:py-3 ${
                  soundEnabled
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'border-2 border-black/10 bg-neutral-50 text-neutral-800 hover:border-[#C62F1D] hover:bg-white'
                }`}
              >
                {soundEnabled ? (
                  <Bell size={16} className="text-[#F4A507]" strokeWidth={2.5} />
                ) : (
                  <BellOff size={16} strokeWidth={2.5} />
                )}
                <span className="hidden sm:inline">{soundEnabled ? 'Alerte sonore ON' : 'Son coupé'}</span>
              </button>
            </div>
          </div>

          {connectionLost && (
            <div className="mt-5 flex items-center gap-3 rounded-[1.5rem] border-2 border-[#C62F1D] bg-[#C62F1D]/10 px-5 py-3.5 text-sm font-bold text-[#C62F1D]">
              <XCircle size={18} className="shrink-0" />
              <span>Connexion au serveur interrompue. Nouvelle tentative automatique en cours…</span>
            </div>
          )}
        </div>
      </header>

      {/* ---------- BARRE STICKY DE FILTRES STATUTS ---------- */}
      <div className="pointer-events-none sticky top-[4.5rem] z-30 pb-4 pt-1 md:top-[5.25rem]">
        <div className="flex justify-end pr-0">
          <div className="pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto rounded-l-full border-y border-l border-neutral-200 bg-white py-3 pl-6 pr-4 shadow-xl shadow-black/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STATUS_OPTIONS.map((status) => {
              const active = statusFilter === status
              const count = status !== 'Tous' ? getStatusCount(orders, status) : orders.length
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`shrink-0 rounded-full px-5 py-2.5 font-display text-xs font-extrabold uppercase tracking-wider transition-all sm:text-sm sm:normal-case sm:tracking-normal ${
                    active
                      ? 'scale-105 bg-[#C62F1D] text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }`}
                >
                  <span>{status}</span>
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-black/10 text-neutral-600'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ---------- SECTION PRINCIPALE ROUGE PLEIN ÉCRAN ---------- */}
      <section className="relative w-full min-h-[60vh] rounded-t-[2.5rem] bg-[#C62F1D] px-5 pb-24 pt-12 text-white sm:px-6 lg:px-12">
        <div className="relative z-10 w-full">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 font-display text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                <ShoppingBag size={14} />
                <span>
                  {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} affichée
                  {filteredOrders.length > 1 ? 's' : ''}
                </span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tighter sm:text-5xl">
                {statusFilter === 'Tous' ? 'Toutes les commandes' : `Commandes · ${statusFilter}`}
              </h2>
            </div>

            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('À confirmer')}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#F4A507] px-6 py-3 font-display text-sm font-extrabold text-neutral-900 shadow-lg transition hover:scale-105"
              >
                <Bell size={16} strokeWidth={2.5} />
                <span>{pendingCount} commande{pendingCount > 1 ? 's' : ''} à confirmer</span>
              </button>
            )}
          </div>

          {filteredOrders.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredOrders.map((order, i) => (
                <motion.div
                  key={order.orderId}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.25) }}
                  className="h-full"
                >
                  <OrderCard
                    order={order}
                    onStatusChange={handleStatusChange}
                    onPaidChange={handlePaidChange}
                    onRefuse={handleRefuse}
                    loadingAction={loadingAction}
                    adminRole={role}
                    isNew={newOrderIds.has(order.orderId)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-[2.5rem] border-2 border-dashed border-white/30 bg-white/10 p-16 text-center backdrop-blur-sm">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-[#C62F1D] shadow-lg">
                <Utensils size={28} strokeWidth={2.5} />
              </div>
              <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-white">
                Aucune commande ici
              </h3>
              <p className="mt-1 text-sm text-white/85">
                Il n’y a aucune commande correspondant à ces filtres pour le moment.
              </p>
              {(sourceFilter !== 'Toutes' || statusFilter !== 'Tous') && (
                <button
                  type="button"
                  onClick={() => {
                    setSourceFilter('Toutes')
                    setStatusFilter('Tous')
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-display text-sm font-extrabold text-[#C62F1D] shadow-md transition hover:bg-neutral-900 hover:text-white"
                >
                  <RefreshCw size={15} />
                  <span>Réinitialiser les filtres</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}