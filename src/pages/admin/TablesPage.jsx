import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CheckCircle2,
  Clock3,
  Flame,
  Lock,
  Receipt,
  RefreshCw,
  Unlock,
  Utensils,
  UtensilsCrossed,
  XCircle,
} from 'lucide-react'
import logo from '../../assets/Logo1.png'
import { adminTables, adminSetTableAvailable, adminPayTable } from '../../services/adminApi'
import { useAdminAuth } from '../../context/AdminAuthContext'

const DEFAULT_TABLES = Array.from({ length: 10 }, (_, idx) => ({
  table: `T${idx + 1}`,
  available: true,
  occupied: false,
  paid: false,
  total: 0,
}))

const FILTER_TABS = [
  { id: 'Toutes', label: 'Toutes' },
  { id: 'Libres', label: 'Libres' },
  { id: 'Occupées', label: 'Occupées' },
  { id: 'À encaisser', label: 'À encaisser' },
]

export default function TablesPage() {
  const { role } = useAdminAuth()
  const reduce = useReducedMotion()
  const [tables, setTables] = useState(DEFAULT_TABLES)
  const [filter, setFilter] = useState('Toutes')
  const [loading, setLoading] = useState(false)
  const [busyTable, setBusyTable] = useState('')
  const [error, setError] = useState('')

  const loadTables = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await adminTables()
      const raw = Array.isArray(data?.tables) ? data.tables : []
      const merged = DEFAULT_TABLES.map((fallback) => {
        const found = raw.find((table) => table.table === fallback.table)
        if (!found) return fallback
        return {
          ...fallback,
          ...found,
          occupied: Boolean(found.activeOrder),
          total: found.totalImpaye || found.activeOrder?.total || 0,
          paid: !found.activeOrder && !found.totalImpaye,
        }
      })
      setTables(merged)
    } catch (err) {
      setError(err?.message || 'Impossible de charger les tables.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTables().catch(() => {})
  }, [])

  const summary = useMemo(() => {
    const available = tables.filter((table) => table.available).length
    const occupied = tables.filter((table) => !table.available || table.occupied).length
    const unpaid = tables.filter((table) => !table.paid && Number(table.total || 0) > 0).length
    return { available, occupied, unpaid }
  }, [tables])

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      if (filter === 'Libres') return table.available && !table.occupied
      if (filter === 'Occupées') return !table.available || table.occupied
      if (filter === 'À encaisser') return !table.paid && Number(table.total || 0) > 0
      return true
    })
  }, [tables, filter])

  const getTabCount = (id) => {
    if (id === 'Libres') return tables.filter((t) => t.available && !t.occupied).length
    if (id === 'Occupées') return tables.filter((t) => !t.available || t.occupied).length
    if (id === 'À encaisser') return tables.filter((t) => !t.paid && Number(t.total || 0) > 0).length
    return tables.length
  }

  const toggleAvailability = async (tableName, available) => {
    setBusyTable(`${tableName}-avail`)
    try {
      setTables((current) =>
        current.map((table) => (table.table === tableName ? { ...table, available } : table))
      )
      await adminSetTableAvailable(tableName, available)
    } catch (err) {
      setError(err?.message || 'Impossible de mettre à jour la table.')
      await loadTables()
    } finally {
      setBusyTable('')
    }
  }

  const markPaid = async (tableName) => {
    setBusyTable(`${tableName}-pay`)
    try {
      await adminPayTable(tableName)
      await loadTables()
    } catch (err) {
      setError(err?.message || 'Impossible de clôturer la table.')
      await loadTables()
    } finally {
      setBusyTable('')
    }
  }

  const isManager = role === 'manager'

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

        {/* MOBILE ONLY : Logo blanc dans la courbe gauche */}
        <div className="pointer-events-none absolute left-2 top-3 z-10 flex items-center justify-center p-2 sm:hidden">
          <img
            src={logo}
            alt="Just Burgers"
            className="h-14 w-auto object-contain brightness-0 invert drop-shadow-md"
          />
        </div>

        {/* DESKTOP / TABLET ONLY : Courbe SVG rouge en haut à DROITE */}
        <div className="pointer-events-none absolute right-0 top-0 z-0 hidden h-72 w-80 sm:block md:h-80 md:w-[42%]">
          <svg viewBox="0 0 200 200" className="h-full w-full fill-[#C62F1D]" preserveAspectRatio="none">
            <path d="M 200,0 L 200,180 C 120,180 60,120 40,0 Z" />
          </svg>
        </div>

        {/* DESKTOP / TABLET ONLY : Logo blanc dans l'aplat rouge droit */}
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
              <span>Service en salle & encaissement</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tighter text-neutral-900 sm:text-6xl md:text-7xl">
              Gestion des tables
            </h1>
          </div>

          {/* Description pleine largeur */}
          <div className="mt-4 w-full">
            <p className="w-full text-center text-sm leading-relaxed text-neutral-600 sm:text-left sm:text-base md:text-xl">
              Suis l’occupation des 10 tables en temps réel, libère les places et clôture les additions en un clic.
            </p>
          </div>

          {/* Barre unique : Résumé rapide + Bouton Actualiser compact sur mobile */}
          <div className="mt-7 flex w-full items-center justify-between gap-2.5 sm:mt-8 sm:flex-wrap sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-initial sm:flex-wrap sm:gap-3 sm:overflow-visible sm:py-0">
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-black/10 bg-neutral-50 px-4 py-2 font-display text-xs font-extrabold text-neutral-800 sm:px-5 sm:py-2.5 sm:text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>{summary.available} libres</span>
              </span>

              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-black/10 bg-neutral-50 px-4 py-2 font-display text-xs font-extrabold text-neutral-800 sm:px-5 sm:py-2.5 sm:text-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-[#C62F1D]" />
                <span>{summary.occupied} occupées</span>
              </span>

              {summary.unpaid > 0 && (
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#F4A507] px-4 py-2 font-display text-xs font-extrabold text-neutral-900 shadow-sm sm:px-5 sm:py-2.5 sm:text-sm">
                  <Receipt size={14} strokeWidth={2.5} />
                  <span>{summary.unpaid} à encaisser</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={loadTables}
              aria-label="Rafraîchir les tables"
              title="Rafraîchir"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-black/10 bg-neutral-50 font-display text-sm font-bold text-neutral-800 transition hover:border-[#C62F1D] hover:bg-white hover:text-[#C62F1D] sm:h-auto sm:w-auto sm:px-5 sm:py-3"
            >
              <RefreshCw size={16} strokeWidth={2.5} className={loading ? 'animate-spin text-[#C62F1D]' : ''} />
              <span className="hidden sm:inline">Rafraîchir</span>
            </button>
          </div>

          {error && (
            <div className="mt-5 flex items-center gap-3 rounded-[1.5rem] border-2 border-[#C62F1D] bg-[#C62F1D]/10 px-5 py-3.5 text-sm font-bold text-[#C62F1D]">
              <XCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </header>

      {/* ---------- BARRE STICKY DE FILTRES ---------- */}
      <div className="pointer-events-none sticky top-[4.5rem] z-30 pb-4 pt-1 md:top-[5.25rem]">
        <div className="flex justify-end pr-0">
          <div className="pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto rounded-l-full border-y border-l border-neutral-200 bg-white py-3 pl-6 pr-4 shadow-xl shadow-black/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTER_TABS.map((tab) => {
              const active = filter === tab.id
              const count = getTabCount(tab.id)
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`shrink-0 rounded-full px-5 py-2.5 font-display text-xs font-extrabold uppercase tracking-wider transition-all sm:text-sm sm:normal-case sm:tracking-normal ${
                    active
                      ? 'scale-105 bg-[#C62F1D] text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                      active ? 'bg-white/20 text-white' : 'bg-black/10 text-neutral-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ---------- SECTION PRINCIPALE ROUGE PLEIN ÉCRAN ---------- */}
      <section className="relative min-h-[60vh] w-full rounded-t-[2.5rem] bg-[#C62F1D] px-5 pb-24 pt-12 text-white sm:px-6 lg:px-12">
        <div className="relative z-10 w-full">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 font-display text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                <UtensilsCrossed size={14} />
                <span>
                  {filteredTables.length} table{filteredTables.length > 1 ? 's' : ''} affichée
                  {filteredTables.length > 1 ? 's' : ''}
                </span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tighter sm:text-5xl">
                {filter === 'Toutes' ? 'Plan de salle' : `Tables · ${filter}`}
              </h2>
            </div>

            {summary.unpaid > 0 && (
              <button
                type="button"
                onClick={() => setFilter('À encaisser')}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-[#F4A507] px-6 py-3 font-display text-sm font-extrabold text-neutral-900 shadow-lg transition hover:scale-105"
              >
                <Receipt size={16} strokeWidth={2.5} />
                <span>
                  {summary.unpaid} table{summary.unpaid > 1 ? 's' : ''} à encaisser
                </span>
              </button>
            )}
          </div>

          {filteredTables.length ? (
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTables.map((table, i) => {
                const isFree = table.available && !table.occupied
                const hasUnpaid = !table.paid && Number(table.total || 0) > 0
                const total = Number(table.total || 0)

                return (
                  <motion.article
                    key={table.table}
                    initial={reduce ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.25) }}
                    className={`group relative flex h-full flex-col justify-between rounded-[1.75rem] border-2 bg-white p-3.5 text-neutral-900 shadow-xl shadow-black/15 transition-all duration-300 sm:rounded-[2rem] sm:p-6 ${
                      hasUnpaid
                        ? 'border-[#F4A507] ring-4 ring-[#F4A507]/35'
                        : 'border-white hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      {/* En-tête de la carte Table */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 sm:gap-3.5">
                          <div
                            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-md sm:h-14 sm:w-14 sm:rounded-2xl ${
                              isFree ? 'bg-[#C62F1D]' : 'bg-neutral-900'
                            }`}
                          >
                            <UtensilsCrossed size={22} className="sm:h-[26px] sm:w-[26px]" strokeWidth={2.4} />
                          </div>

                          <div>
                            <h3 className="font-display text-xl font-extrabold leading-none tracking-tighter text-neutral-900 sm:text-3xl">
                              Table {table.table.replace(/^T/i, '')}
                            </h3>
                            <p className="mt-1 font-display text-[11px] font-bold uppercase tracking-wider text-neutral-500 sm:text-xs">
                              Code · {table.table}
                            </p>
                          </div>
                        </div>

                        {/* Badge statut */}
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-display text-[11px] font-extrabold shadow-sm sm:px-3.5 sm:py-1.5 sm:text-xs ${
                            isFree
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#F4A507] text-neutral-900'
                          }`}
                        >
                          {isFree ? (
                            <>
                              <CheckCircle2 size={12} strokeWidth={2.5} />
                              <span>Libre</span>
                            </>
                          ) : (
                            <>
                              <Clock3 size={12} strokeWidth={2.5} />
                              <span>Occupée</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Détails addition & paiement */}
                      <div className="mt-3.5 space-y-2 sm:mt-5 sm:space-y-2.5">
                        <div className="flex items-center justify-between rounded-xl border border-black/10 bg-neutral-50 px-3 py-2.5 sm:rounded-2xl sm:px-3.5 sm:py-3">
                          <span className="text-xs font-bold text-neutral-600 sm:text-sm">Addition en cours</span>
                          <span className="font-display text-lg font-extrabold tracking-tight text-[#C62F1D] sm:text-2xl">
                            {total} DA
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border border-black/10 bg-neutral-50 px-3 py-2 sm:rounded-2xl sm:px-3.5 sm:py-2.5">
                          <span className="text-xs font-bold text-neutral-600 sm:text-sm">Statut règlement</span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-[11px] font-extrabold sm:text-xs ${
                              table.paid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-[#F4A507]/25 text-neutral-900'
                            }`}
                          >
                            {table.paid ? (
                              <>
                                <CheckCircle2 size={12} strokeWidth={2.5} />
                                <span>Payée</span>
                              </>
                            ) : (
                              <>
                                <Receipt size={12} strokeWidth={2.5} />
                                <span>À encaisser</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pied de carte : Actions */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3 sm:mt-5 sm:pt-4">
                      {isManager && (
                        <button
                          type="button"
                          disabled={busyTable === `${table.table}-avail`}
                          onClick={() => toggleAvailability(table.table, !table.available)}
                          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 py-2.5 font-display text-xs font-extrabold transition sm:px-4 sm:py-3 sm:text-sm ${
                            table.available
                              ? 'border-2 border-black/10 bg-neutral-50 text-neutral-800 hover:border-[#C62F1D] hover:bg-white'
                              : 'bg-emerald-600 text-white shadow-md hover:bg-neutral-900'
                          } disabled:opacity-60`}
                        >
                          {table.available ? (
                            <>
                              <Lock size={14} strokeWidth={2.5} />
                              <span>Occuper</span>
                            </>
                          ) : (
                            <>
                              <Unlock size={14} strokeWidth={2.5} />
                              <span>Libérer</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => markPaid(table.table)}
                        disabled={table.paid || busyTable === `${table.table}-pay`}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#C62F1D] px-3.5 py-2.5 font-display text-xs font-extrabold text-white shadow-md transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none sm:px-4 sm:py-3 sm:text-sm"
                      >
                        <Receipt size={14} strokeWidth={2.5} />
                        <span>{table.paid ? 'Soldée' : 'Encaisser'}</span>
                      </button>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[2.5rem] border-2 border-dashed border-white/30 bg-white/10 p-16 text-center backdrop-blur-sm">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-[#C62F1D] shadow-lg">
                <Utensils size={28} strokeWidth={2.5} />
              </div>
              <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-white">
                Aucune table dans ce filtre
              </h3>
              <p className="mt-1 text-sm text-white/85">
                Aucune table ne correspond actuellement à « {filter} ».
              </p>
              <button
                type="button"
                onClick={() => setFilter('Toutes')}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-display text-sm font-extrabold text-[#C62F1D] shadow-md transition hover:bg-neutral-900 hover:text-white"
              >
                <RefreshCw size={15} />
                <span>Afficher toutes les tables</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}