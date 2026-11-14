import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  CupSoda,
  Droplets,
  Flame,
  Info,
  Layers,
  RefreshCcw,
  Search,
  Utensils,
  X,
  XCircle,
} from 'lucide-react'
import logo from '../../assets/Logo1.png'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { adminProducts, adminResetAvailability, adminSetAvailability } from '../../services/adminApi'

const CATEGORIES = [
  { id: 'burger', label: 'Burgers', icon: Flame },
  { id: 'side', label: 'Accompagnements', icon: Utensils },
  { id: 'sauce', label: 'Sauces', icon: Droplets },
  { id: 'drink', label: 'Boissons', icon: CupSoda },
]

export default function AvailabilityPage() {
  const { role } = useAdminAuth()
  const reduce = useReducedMotion()
  const [items, setItems] = useState([])
  const [options, setOptions] = useState([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await adminProducts()
      setItems(data.products || [])
      setOptions(data.options || [])
    } catch (err) {
      setError(err?.message || 'Impossible de charger les disponibilités.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim()
    return items.filter((item) => {
      if (!q) return true
      return [item.name, item.description, item.category].some((value) =>
        String(value || '').toLowerCase().includes(q)
      )
    })
  }, [items, search])

  const filteredOptions = useMemo(() => {
    const q = search.toLowerCase().trim()
    return options.filter((option) => {
      if (!q) return true
      return [option.name].some((value) => String(value || '').toLowerCase().includes(q))
    })
  }, [options, search])

  const summary = useMemo(() => {
    const all = [...items, ...options]
    const availableCount = all.filter((entry) => Boolean(entry.available)).length
    const unavailableCount = all.length - availableCount
    return { availableCount, unavailableCount, total: all.length }
  }, [items, options])

  const toggleAvailability = async (kind, id, currentValue) => {
    const previous = [...items, ...options]
    const target = previous.find((entry) => entry.id === id)
    setSavingId(id)
    setItems((currentItems) =>
      currentItems.map((entry) =>
        entry.id === id ? { ...entry, available: !currentValue } : entry
      )
    )
    setOptions((currentOptions) =>
      currentOptions.map((entry) =>
        entry.id === id ? { ...entry, available: !currentValue } : entry
      )
    )
    try {
      await adminSetAvailability(kind, id, !currentValue)
      setError('')
    } catch (err) {
      setError(err?.message || 'La mise à jour a échoué.')
      if (target) {
        if (kind === 'product') {
          setItems((currentItems) =>
            currentItems.map((entry) => (entry.id === id ? { ...entry, available: currentValue } : entry))
          )
        } else {
          setOptions((currentOptions) =>
            currentOptions.map((entry) => (entry.id === id ? { ...entry, available: currentValue } : entry))
          )
        }
      }
    } finally {
      setSavingId(null)
    }
  }

  const resetAvailability = async () => {
    if (!window.confirm('Rétablir tous les produits et suppléments comme disponibles ?')) return
    try {
      setResetting(true)
      await adminResetAvailability()
      await fetchData()
    } catch (err) {
      setError(err?.message || 'La remise à zéro a échoué.')
    } finally {
      setResetting(false)
    }
  }

  const groupedProducts = CATEGORIES.map((category) => ({
    ...category,
    items: filteredProducts.filter((item) => item.category === category.id),
  }))

  const visibleGroups =
    activeTab === 'all'
      ? groupedProducts
      : activeTab === 'options'
        ? []
        : groupedProducts.filter((g) => g.id === activeTab)

  const showOptions = activeTab === 'all' || activeTab === 'options'

  const tabs = [
    { id: 'all', label: 'Tout', count: filteredProducts.length + filteredOptions.length },
    ...groupedProducts.map((g) => ({ id: g.id, label: g.label, count: g.items.length })),
    { id: 'options', label: 'Suppléments', count: filteredOptions.length },
  ]

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
              <span>Stock & carte en direct</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tighter text-neutral-900 sm:text-6xl md:text-7xl">
              Gestion des articles
            </h1>
          </div>

          {/* Description pleine largeur */}
          <div className="mt-4 w-full">
            <p className="w-full text-center text-sm leading-relaxed text-neutral-600 sm:text-left sm:text-base md:text-xl">
              Active ou masque instantanément un burger, un accompagnement ou un supplément sur le menu client.
            </p>
          </div>

          {/* Barre de recherche + Réinitialisation */}
          <div className="mt-7 flex w-full items-center gap-2.5 sm:mt-8 sm:gap-4">
            <div className="relative flex flex-1 items-center rounded-full border-2 border-black/10 bg-neutral-50 px-4 py-2.5 transition focus-within:border-[#C62F1D] focus-within:bg-white sm:px-5 sm:py-3">
              <Search size={18} className="shrink-0 text-[#C62F1D]" strokeWidth={2.5} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un produit ou supplément..."
                className="ml-2.5 w-full border-0 bg-transparent text-xs font-semibold text-neutral-900 outline-none placeholder:text-neutral-500 sm:text-sm"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Effacer la recherche"
                  className="ml-2 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-black/10 text-neutral-700 hover:bg-[#C62F1D] hover:text-white"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {role === 'manager' && (
              <button
                type="button"
                onClick={resetAvailability}
                disabled={resetting}
                aria-label="Tout remettre disponible"
                title="Tout remettre disponible"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-black/10 bg-neutral-50 font-display text-sm font-extrabold text-neutral-800 transition hover:border-[#C62F1D] hover:bg-white hover:text-[#C62F1D] disabled:opacity-60 sm:h-auto sm:w-auto sm:px-5 sm:py-3"
              >
                <RefreshCcw size={16} strokeWidth={2.5} className={resetting ? 'animate-spin text-[#C62F1D]' : ''} />
                <span className="hidden sm:inline">Tout remettre disponible</span>
              </button>
            )}
          </div>

          {/* Compteurs rapides + Info synchronisation */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 font-display text-xs font-extrabold text-emerald-800 ring-1 ring-emerald-200">
                <CheckCircle2 size={13} strokeWidth={2.5} />
                <span>{summary.availableCount} disponibles</span>
              </span>

              {summary.unavailableCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4A507]/20 px-3.5 py-1.5 font-display text-xs font-extrabold text-neutral-900 ring-1 ring-[#F4A507]/50">
                  <AlertTriangle size={13} className="text-[#C62F1D]" strokeWidth={2.5} />
                  <span>{summary.unavailableCount} en rupture</span>
                </span>
              )}
            </div>

            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
              <Info size={14} className="shrink-0 text-[#C62F1D]" strokeWidth={2.5} />
              <span>Visible par les clients au prochain chargement du menu.</span>
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-3 rounded-[1.5rem] border-2 border-[#C62F1D] bg-[#C62F1D]/10 px-5 py-3.5 text-sm font-bold text-[#C62F1D]">
              <XCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </header>

      {/* ---------- BARRE STICKY DE CATÉGORIES ---------- */}
      <div className="pointer-events-none sticky top-[4.5rem] z-30 pb-4 pt-1 md:top-[5.25rem]">
        <div className="flex justify-end pr-0">
          <div className="pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto rounded-l-full border-y border-l border-neutral-200 bg-white py-3 pl-6 pr-4 shadow-xl shadow-black/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
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
                    {tab.count}
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
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-[1.75rem] bg-white/15 sm:h-40 sm:rounded-[2rem]"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {visibleGroups.map((group) => {
                const GroupIcon = group.icon
                return (
                  <div key={group.id}>
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#C62F1D] shadow-md sm:h-12 sm:w-12">
                          <GroupIcon size={20} strokeWidth={2.5} />
                        </span>
                        <div>
                          <h2 className="font-display text-2xl font-extrabold tracking-tighter sm:text-4xl">
                            {group.label}
                          </h2>
                          <p className="text-xs font-semibold text-white/80 sm:text-sm">
                            {group.items.length} article{group.items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {group.items.length ? (
                      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                        {group.items.map((item, idx) => {
                          const isAvail = Boolean(item.available)
                          const isSaving = savingId === item.id
                          return (
                            <motion.div
                              key={item.id}
                              initial={reduce ? false : { opacity: 0, y: 14 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}
                              className={`flex items-center justify-between gap-3 rounded-[1.5rem] border-2 bg-white p-3.5 text-neutral-900 shadow-lg shadow-black/10 transition sm:rounded-[2rem] sm:p-5 ${
                                isAvail ? 'border-white' : 'border-white/50 opacity-80'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                                      isAvail ? 'bg-emerald-500' : 'bg-[#C62F1D]'
                                    }`}
                                  />
                                  <p className="truncate font-display text-base font-extrabold tracking-tight text-neutral-900 sm:text-lg">
                                    {item.name}
                                  </p>
                                </div>
                                <p className="mt-1 line-clamp-2 text-xs text-neutral-500 sm:text-sm">
                                  {item.description || (isAvail ? 'Disponible au menu' : 'Masqué temporairement')}
                                </p>
                              </div>

                              <div className="flex shrink-0 flex-col items-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => toggleAvailability('product', item.id, isAvail)}
                                  disabled={isSaving}
                                  aria-label={`Changer la disponibilité de ${item.name}`}
                                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
                                    isAvail ? 'bg-[#C62F1D]' : 'bg-neutral-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                      isAvail ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                                <span
                                  className={`font-display text-[10px] font-extrabold uppercase tracking-wider ${
                                    isAvail ? 'text-emerald-700' : 'text-[#C62F1D]'
                                  }`}
                                >
                                  {isAvail ? 'En stock' : 'Rupture'}
                                </span>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="rounded-[1.75rem] border-2 border-dashed border-white/25 bg-white/10 p-8 text-center text-sm font-semibold text-white/85">
                        Aucun élément dans cette catégorie.
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Section Suppléments */}
              {showOptions && (
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#C62F1D] shadow-md sm:h-12 sm:w-12">
                      <Layers size={20} strokeWidth={2.5} />
                    </span>
                    <div>
                      <h2 className="font-display text-2xl font-extrabold tracking-tighter sm:text-4xl">
                        Suppléments
                      </h2>
                      <p className="text-xs font-semibold text-white/80 sm:text-sm">
                        {filteredOptions.length} option{filteredOptions.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {filteredOptions.length ? (
                    <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredOptions.map((option, idx) => {
                        const isAvail = Boolean(option.available)
                        const isSaving = savingId === option.id
                        return (
                          <motion.div
                            key={option.id}
                            initial={reduce ? false : { opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.2) }}
                            className={`flex items-center justify-between gap-3 rounded-[1.5rem] border-2 bg-white p-3.5 text-neutral-900 shadow-lg shadow-black/10 transition sm:rounded-[2rem] sm:p-5 ${
                              isAvail ? 'border-white' : 'border-white/50 opacity-80'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                                    isAvail ? 'bg-emerald-500' : 'bg-[#C62F1D]'
                                  }`}
                                />
                                <p className="truncate font-display text-base font-extrabold tracking-tight text-neutral-900 sm:text-lg">
                                  {option.name}
                                </p>
                              </div>
                              <p className="mt-1 text-xs text-neutral-500">
                                {isAvail ? 'Proposé en supplément' : 'Supplément indisponible'}
                              </p>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleAvailability('option', option.id, isAvail)}
                                disabled={isSaving}
                                aria-label={`Changer la disponibilité de ${option.name}`}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
                                  isAvail ? 'bg-[#C62F1D]' : 'bg-neutral-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                    isAvail ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span
                                className={`font-display text-[10px] font-extrabold uppercase tracking-wider ${
                                  isAvail ? 'text-emerald-700' : 'text-[#C62F1D]'
                                }`}
                              >
                                {isAvail ? 'En stock' : 'Rupture'}
                              </span>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-[1.75rem] border-2 border-dashed border-white/25 bg-white/10 p-8 text-center text-sm font-semibold text-white/85">
                      Aucun supplément trouvé.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}