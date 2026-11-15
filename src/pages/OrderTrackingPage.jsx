import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Armchair,
  ArrowLeft,
  ArrowRight,
  Ban,
  BellRing,
  Check,
  ChefHat,
  Clock3,
  Hourglass,
  LifeBuoy,
  MapPin,
  Phone,
  Receipt,
  Search,
  ShoppingBag,
  Store,
  User,
  Utensils,
  WifiOff,
  X,
} from 'lucide-react'
import { getLastOrder, getOrderById, getRecentOrders, getTableOrder } from '../services/api'
import { useCart } from '../context/CartContext'
import { TABLE_RE, tableNumber } from '../utils/tables'
import { formatPrice } from '../utils/format'
import burger from '../assets/Fond1.png'
import logo from '../assets/Logo1.png'

/* ---------- Données et helpers ---------- */

const norm = (value) => String(value ?? '').normalize('NFC').trim().toLowerCase()

const STOPPED = ['refusée', 'annulée']
const FINAL = ['servie', ...STOPPED]
const POLL_MS = 12000

function getSteps(isTable) {
  return isTable
    ? [
        { key: 'à confirmer', label: 'Envoyée à l’équipe', hint: 'Un membre de l’équipe vérifie ta commande.', icon: Hourglass },
        { key: 'en préparation', label: 'En préparation', hint: 'La cuisine s’en occupe.', icon: ChefHat },
        { key: 'prête', label: 'Prête', hint: 'On te l’apporte à ta table.', icon: BellRing },
        { key: 'servie', label: 'Servie', hint: 'Bon appétit !', icon: Utensils },
      ]
    : [
        { key: 'reçue', label: 'Commande reçue', hint: 'Elle est bien enregistrée.', icon: Receipt },
        { key: 'en préparation', label: 'En préparation', hint: 'La cuisine s’en occupe.', icon: ChefHat },
        { key: 'prête', label: 'Prête', hint: 'Elle t’attend au comptoir.', icon: BellRing },
        { key: 'servie', label: 'Servie', hint: 'Bon appétit !', icon: Utensils },
      ]
}

function getStatusInfo(status, isTable) {
  switch (status) {
    case 'à confirmer':
      return { title: 'On vérifie ta commande', text: 'Un membre de l’équipe passe à ta table pour la confirmer.' }
    case 'en préparation':
      return { title: 'C’est en cuisine !', text: 'Ton repas est en cours de préparation.' }
    case 'prête':
      return {
        title: 'C’est prêt !',
        text: isTable ? 'On te l’apporte à ta table.' : 'Passe la récupérer au comptoir.',
      }
    case 'servie':
      return { title: 'Bon appétit !', text: 'Merci d’avoir commandé chez Just Burgers.' }
    case 'refusée':
      return { title: 'Commande non confirmée', text: 'On n’a pas pu valider ta commande. Parles-en à un membre de l’équipe.' }
    case 'annulée':
      return { title: 'Commande annulée', text: 'Cette commande a été annulée.' }
    default:
      return { title: 'Commande bien reçue', text: 'On s’en occupe dès que possible.' }
  }
}

const PILL = {
  'à confirmer': 'bg-amber-100 text-amber-800',
  'en préparation': 'bg-blue-100 text-blue-800',
  prête: 'bg-green-100 text-green-800',
  servie: 'bg-neutral-100 text-neutral-600',
  refusée: 'bg-red-100 text-red-800',
  annulée: 'bg-red-100 text-red-800',
}
const pillClass = (status) => PILL[norm(status)] ?? 'bg-neutral-100 text-neutral-600'
const pillLabel = (status) => String(status ?? '').trim() || 'Reçue'

const MODE_LABEL = { 'sur-place': 'Sur place', 'a-emporter': 'À emporter' }

function formatWhen(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const time = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date)
  if (date.toDateString() === new Date().toDateString()) return `Aujourd’hui à ${time}`
  const day = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(date)
  return `${day} à ${time}`
}

function getItemLines(items) {
  if (!items) return []
  if (typeof items === 'string') {
    return items.split(' · ').map((line) => line.trim()).filter(Boolean)
  }
  if (Array.isArray(items)) {
    return items
      .map((item) => {
        const qty = item?.qty ? `${item.qty}× ` : ''
        const variant = item?.variant ? ` (${item.variant})` : ''
        const extras = (Array.isArray(item?.options) ? item.options : [])
          .map((option) => (typeof option === 'string' ? option : option?.name))
          .filter(Boolean)
        const extra = extras.length ? ` (+ ${extras.join(', ')})` : ''
        return `${qty}${item?.name ?? ''}${variant}${extra}`.trim()
      })
      .filter(Boolean)
  }
  return []
}

function Card({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-[2rem] border-2 border-black/10 bg-white p-6 shadow-xl shadow-black/5 sm:p-7 ${className}`}
    >
      <h3 className="font-display text-xl font-extrabold tracking-tighter">{title}</h3>
      {children}
    </section>
  )
}

function Chip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 backdrop-blur-sm">
      <Icon size={15} />
      {children}
    </span>
  )
}

function OrderView({ order, reduce, menuTo }) {
  const status = norm(order.status)
  const isTable = order.source === 'table' || Boolean(order.table)
  const tableNo = tableNumber(order.table)
  const stopped = STOPPED.includes(status)
  const steps = getSteps(isTable)
  const found = steps.findIndex((step) => step.key === status)
  const statusIndex = found >= 0 ? found : 0
  const info = getStatusInfo(status, isTable)

  const lines = getItemLines(order.items)
  const total = Number(order.total)
  const hasTotal = Number.isFinite(total) && total > 0
  const note = typeof order.note === 'string' ? order.note.trim() : ''
  const hasDetail = lines.length > 0 || hasTotal || Boolean(note)

  const rows = [
    isTable
      ? { icon: Armchair, label: 'Lieu', value: `Table ${tableNo || '—'}` }
      : { icon: ShoppingBag, label: 'Type', value: 'Commande en ligne' },
    !isTable && MODE_LABEL[order.type]
      ? { icon: MapPin, label: 'Mode', value: MODE_LABEL[order.type] }
      : null,
    order.name ? { icon: User, label: 'Nom', value: order.name } : null,
    order.phone ? { icon: Phone, label: 'Téléphone', value: order.phone } : null,
    { icon: Clock3, label: 'Envoyée', value: formatWhen(order.createdAt) },
  ].filter(Boolean)

  return (
    <>
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`relative mt-8 overflow-hidden rounded-[2.5rem] p-6 text-white shadow-xl sm:p-8 lg:p-10 ${
          stopped ? 'bg-neutral-900 shadow-black/20' : 'bg-[#C62F1D] shadow-[#C62F1D]/25'
        }`}
      >
        <img
          src={burger}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute -right-8 -top-4 h-32 w-auto rotate-[18deg] object-contain drop-shadow-2xl sm:-right-4 sm:h-44 lg:-top-8 lg:right-6 lg:h-60 ${
            stopped ? 'opacity-20 grayscale' : 'opacity-95'
          }`}
        />

        <div className="relative">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            Commande
          </p>
          <p className="mt-1 font-display text-6xl font-extrabold leading-none tracking-tighter sm:text-7xl lg:text-8xl">
            {order.orderId}
          </p>

          <div className="mt-6 max-w-xl" aria-live="polite">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <span className={`h-2 w-2 rounded-full ${stopped ? 'bg-[#C62F1D]' : 'bg-[#F4A507]'}`} />
              {pillLabel(order.status)}
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tighter sm:text-4xl">
              {info.title}
            </h2>
            <p className="mt-2 text-base text-white/90 sm:text-lg">{info.text}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
            <Chip icon={isTable ? Armchair : ShoppingBag}>
              {isTable ? `Table ${tableNo || '—'}` : 'En ligne'}
            </Chip>
            <Chip icon={Clock3}>{formatWhen(order.createdAt)}</Chip>
            {!stopped && status !== 'servie' && <Chip icon={Store}>Paiement à la caisse</Chip>}
          </div>
        </div>
      </motion.section>

      {stopped ? (
        <section className="mt-6 flex items-start gap-4 rounded-[2rem] border-2 border-black/10 bg-white p-6 shadow-xl shadow-black/5 sm:p-7">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#C62F1D]/10 text-[#C62F1D]">
            <Ban size={24} />
          </span>
          <div>
            <h3 className="font-display text-xl font-extrabold tracking-tighter">Que faire ?</h3>
            <p className="mt-1 text-neutral-600">
              Si tu es toujours sur place, demande à un membre de l’équipe. Tu peux aussi repasser commande.
            </p>
            <Link
              to={menuTo}
              className="group mt-4 inline-flex items-center gap-2 rounded-full bg-[#C62F1D] px-6 py-3 font-display font-bold text-white transition hover:bg-neutral-900"
            >
              Repasser commande
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      ) : (
        <Card title="Avancement" className="mt-6">
          <ol className="mt-6 flex flex-col md:flex-row">
            {steps.map((step, index) => {
              const done = index < statusIndex
              const current = index === statusIndex
              const Icon = step.icon

              return (
                <li
                  key={step.key}
                  aria-current={current ? 'step' : undefined}
                  className="relative flex gap-4 pb-8 last:pb-0 md:flex-1 md:flex-col md:items-center md:gap-3 md:pb-0 md:text-center"
                >
                  {index < steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0 left-5 top-10 w-0.5 -translate-x-1/2 md:bottom-auto md:left-1/2 md:top-5 md:h-0.5 md:w-full md:translate-x-0 md:-translate-y-1/2 ${
                        done ? 'bg-[#C62F1D]' : 'bg-neutral-200'
                      }`}
                    />
                  )}

                  <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center">
                    {current && (
                      <span className="absolute inset-0 rounded-full bg-[#C62F1D]/30 motion-safe:animate-ping" />
                    )}
                    <span
                      className={`relative grid h-10 w-10 place-items-center rounded-full border-2 ${
                        done || current
                          ? 'border-[#C62F1D] bg-[#C62F1D] text-white'
                          : 'border-neutral-200 bg-white text-neutral-400'
                      } ${current ? 'shadow-lg shadow-[#C62F1D]/40' : ''}`}
                    >
                      {done ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                    </span>
                  </span>

                  <div className="min-w-0 pt-1.5 md:px-2 md:pt-0">
                    <p
                      className={`font-display text-base font-extrabold tracking-tight ${
                        done || current ? 'text-neutral-900' : 'text-neutral-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {current && <p className="mt-0.5 text-sm text-neutral-600">{step.hint}</p>}
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Résumé" className={hasDetail ? '' : 'lg:col-span-2'}>
          <ul className="mt-4 space-y-3">
            {rows.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#C62F1D]/10 text-[#C62F1D]">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</p>
                  <p className="truncate font-semibold text-neutral-900">{value}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {hasDetail && (
          <Card title="Détail">
            {lines.length > 0 && (
              <ul className="mt-4 divide-y divide-neutral-100">
                {lines.map((line, index) => (
                  <li key={`${line}-${index}`} className="py-2.5 text-sm font-semibold text-neutral-800">
                    {line}
                  </li>
                ))}
              </ul>
            )}

            {note && (
              <p className="mt-3 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                <span className="font-bold text-neutral-800">Ta remarque : </span>
                {note}
              </p>
            )}

            {hasTotal && (
              <div className="mt-4 flex items-baseline justify-between border-t border-neutral-200 pt-4">
                <span className="text-sm font-semibold text-neutral-600">Total à payer</span>
                <span className="font-display text-2xl font-extrabold tracking-tighter text-[#C62F1D]">
                  {formatPrice(total)}
                </span>
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  )
}

function TrackingScreen({ tableId }) {
  const reduce = useReducedMotion()
  const { setTable } = useCart()
  const isTableMode = Boolean(tableId)
  const menuTo = isTableMode ? `/table/${tableId}` : '/menu'

  useEffect(() => {
    if (!isTableMode) return undefined
    setTable(tableId)
    return () => setTable(null)
  }, [isTableMode, tableId, setTable])

  const [orders, setOrders] = useState(() => {
    if (isTableMode) {
      const mine = getTableOrder(tableId)
      return mine ? [mine] : []
    }
    const map = new Map()
    ;[getLastOrder(), ...getRecentOrders()].filter(Boolean).forEach((order) => {
      if (order?.orderId) map.set(order.orderId, { ...(map.get(order.orderId) ?? {}), ...order })
    })
    return Array.from(map.values())
  })
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [refreshFailed, setRefreshFailed] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((order) =>
      [order.orderId, order.name, order.table, order.phone].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [orders, search])

  const activeOrder = filtered.find((order) => order.orderId === selectedId) ?? filtered[0] ?? null

  const activeId = activeOrder?.orderId
  const activeToken = activeOrder?.editToken
  const activeFinal = FINAL.includes(norm(activeOrder?.status))

  useEffect(() => {
    if (!activeId || !activeToken || activeFinal) return undefined
    let cancelled = false

    const refresh = async () => {
      if (document.hidden) return
      const fresh = await getOrderById(activeId, activeToken)
      if (cancelled) return
      if (fresh) {
        setRefreshFailed(false)
        setOrders((current) =>
          current.map((order) => (order.orderId === activeId ? { ...order, ...fresh } : order))
        )
      } else {
        setRefreshFailed(true)
      }
    }

    setSyncing(true)
    refresh().finally(() => {
      if (!cancelled) setSyncing(false)
    })
    const interval = window.setInterval(refresh, POLL_MS)
    const onVisible = () => {
      if (!document.hidden) refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [activeId, activeToken, activeFinal])

  const selectOrder = (orderId) => {
    setSelectedId(orderId)
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden bg-white text-neutral-900">
      {/* ----- En-tête Hero plein écran harmonisé avec les autres composants admin/client ----- */}
      <header className="relative w-full overflow-hidden px-5 pb-6 pt-20 sm:px-6 sm:pb-8 md:pt-28 lg:px-12">
        {/* MOBILE ONLY : Courbe SVG rouge inversée en haut à GAUCHE */}
        <div className="pointer-events-none absolute left-0 top-0 z-0 h-32 w-40 sm:hidden">
          <svg viewBox="0 0 200 200" className="h-full w-full fill-[#C62F1D]" preserveAspectRatio="none">
            <path d="M 0,0 L 0,180 C 80,180 140,120 160,0 Z" />
          </svg>
        </div>

        {/* MOBILE ONLY : Logo blanc dans la courbe gauche */}
        <div className="pointer-events-none absolute left-2 top-2 z-10 flex items-center justify-center p-1 sm:hidden">
          <img
            src={logo}
            alt="Just Burgers"
            className="h-12 w-auto object-contain brightness-0 invert drop-shadow-md"
          />
        </div>

        {/* DESKTOP / TABLET ONLY : Courbe SVG rouge en haut à DROITE */}
        <div className="pointer-events-none absolute right-0 top-0 z-0 hidden h-64 w-72 sm:block md:h-72 md:w-[38%]">
          <svg viewBox="0 0 200 200" className="h-full w-full fill-[#C62F1D]" preserveAspectRatio="none">
            <path d="M 200,0 L 200,180 C 120,180 60,120 40,0 Z" />
          </svg>
        </div>

        {/* DESKTOP / TABLET ONLY : Logo blanc dans l'aplat rouge droit */}
        <div className="pointer-events-none absolute right-8 top-12 z-10 hidden items-center justify-center p-2 sm:flex">
          <img
            src={logo}
            alt="Just Burgers"
            className="h-20 w-auto object-contain brightness-0 invert drop-shadow-md md:h-28"
          />
        </div>

        <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-col gap-4">
          {/* Ligne supérieure : Table + Bouton Menu bien positionnés et bien lisibles */}
          <div className="flex items-center justify-end gap-2.5 sm:justify-start sm:pr-48">
            {isTableMode && (
              <span className="rounded-full bg-[#C62F1D] px-4 py-2 font-display text-xs font-extrabold uppercase tracking-wide text-white shadow-md sm:text-sm">
                Table {tableId}
              </span>
            )}
            <Link
              to={menuTo}
              className="inline-flex items-center gap-2 rounded-full border-2 border-black/10 bg-white px-5 py-2 font-display text-xs font-bold text-neutral-800 shadow-sm transition hover:border-[#C62F1D] hover:text-[#C62F1D] sm:text-sm"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              <span>Menu</span>
            </Link>
          </div>

          {/* Titre et sous-titre de la page */}
          <div className="pt-2 sm:pr-48 sm:pt-0">
            <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-[#C62F1D]">
              Suivi de commande
            </p>
            <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tighter text-neutral-900 sm:text-6xl md:text-7xl">
              Ma commande
            </h1>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 px-5 pb-20 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {!isTableMode && orders.length > 1 && (
            <div className="mb-6 flex justify-end">
              <label className="flex h-12 w-full items-center gap-2 rounded-full border-2 border-neutral-200 bg-white px-4 text-sm transition focus-within:border-[#C62F1D] md:max-w-sm">
                <Search size={18} className="shrink-0 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Numéro, nom, table…"
                  aria-label="Rechercher une commande"
                  className="w-full bg-transparent outline-none placeholder:text-neutral-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Effacer la recherche"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-100"
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
            </div>
          )}

          {syncing && orders.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C62F1D]/10 px-3 py-1.5 text-sm font-semibold text-[#C62F1D]">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#C62F1D]" />
              Mise à jour du statut…
            </div>
          )}

          {refreshFailed && activeOrder && !syncing && (
            <div
              role="status"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-semibold text-neutral-700"
            >
              <WifiOff size={16} />
              Connexion perdue : dernier statut connu. On réessaie automatiquement.
            </div>
          )}

          {/* ----- Aucune commande enregistrée ----- */}
          {orders.length === 0 && (
            <section className="mt-8 rounded-[2.5rem] border-2 border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
              <img
                src={burger}
                alt=""
                aria-hidden="true"
                className="mx-auto h-28 w-auto -rotate-12 object-contain opacity-90"
              />
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tighter">
                {isTableMode ? `Aucune commande pour la table ${tableId}` : 'Aucune commande récente'}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-neutral-600">
                {isTableMode
                  ? 'Tu n’as pas encore commandé depuis cet appareil. Si tu as commandé avec un autre téléphone, demande à un serveur.'
                  : 'Passe une commande pour suivre son avancement ici.'}
              </p>
              <Link
                to={menuTo}
                className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[#C62F1D] px-7 py-3.5 font-display font-bold text-white transition hover:bg-neutral-900"
              >
                Voir le menu
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </section>
          )}

          {/* ----- Recherche sans résultat ----- */}
          {orders.length > 0 && !activeOrder && (
            <section className="mt-8 rounded-[2.5rem] border-2 border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
              <h2 className="font-display text-2xl font-extrabold tracking-tighter">
                Aucun résultat pour « {search.trim()} »
              </h2>
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-5 rounded-full bg-[#C62F1D] px-6 py-3 font-display font-bold text-white transition hover:bg-neutral-900"
              >
                Effacer la recherche
              </button>
            </section>
          )}

          {/* ----- Commande affichée ----- */}
          {activeOrder && (
            <>
              <OrderView key={activeOrder.orderId} order={activeOrder} reduce={reduce} menuTo={menuTo} />

              {!isTableMode && orders.length > 1 && (
                <Card title="Mes commandes" className="mt-6">
                  <ul className="mt-4 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
                    {filtered.map((order) => {
                      const isActive = order.orderId === activeOrder.orderId
                      return (
                        <li key={order.orderId}>
                          <button
                            type="button"
                            onClick={() => selectOrder(order.orderId)}
                            aria-pressed={isActive}
                            className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition ${
                              isActive
                                ? 'border-[#C62F1D] bg-[#C62F1D]/5'
                                : 'border-neutral-200 bg-white hover:border-[#C62F1D]/50'
                            }`}
                          >
                            <span>
                              <span className="block font-display text-lg font-extrabold tracking-tight">
                                {order.orderId}
                              </span>
                              <span className="block text-xs text-neutral-500">{formatWhen(order.createdAt)}</span>
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${pillClass(order.status)}`}>
                              {pillLabel(order.status)}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* ---------- BESOIN D'AIDE ---------- */}
      {activeOrder && (
        <section className="relative rounded-t-[2.5rem] bg-[#C62F1D] px-5 py-12 text-white md:py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start justify-between gap-6 border-t border-white/20 py-12 md:flex-row md:items-center"
            >
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 font-display text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  <LifeBuoy size={14} />
                  <span>Besoin d’aide ?</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tighter text-white sm:text-4xl md:text-5xl">
                  Un souci avec ta commande ?
                </h2>
                <p className="mt-2 text-base text-white/90 sm:text-lg">
                  {isTableMode ? (
                    <>
                      Fais signe à un serveur : on est là pour t’aider. Ta commande est la{' '}
                      <strong className="font-extrabold text-white">{activeOrder.orderId}</strong>, table{' '}
                      <strong className="font-extrabold text-white">{tableId}</strong>.
                    </>
                  ) : (
                    <>
                      Demande à un membre de l’équipe : on est là pour t’aider. Donne-lui ton numéro de commande{' '}
                      <strong className="font-extrabold text-white">{activeOrder.orderId}</strong> et on s’en occupe
                      tout de suite.
                    </>
                  )}
                </p>
              </div>

              <Link
                to={menuTo}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-8 py-4 font-display text-base font-bold text-[#C62F1D] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-neutral-900 hover:text-white"
              >
                <ShoppingBag size={18} />
                <span>{isTableMode ? 'Retour au menu' : 'Commander à nouveau'}</span>
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </main>
  )
}

export default function OrderTrackingPage() {
  const { tableId } = useParams()

  if (tableId !== undefined) {
    const clean = tableNumber(tableId)
    if (!TABLE_RE.test(clean)) return <Navigate to="/table" replace />
    return <TrackingScreen key={`table-${clean}`} tableId={clean} />
  }

  return <TrackingScreen key="site" tableId="" />
}