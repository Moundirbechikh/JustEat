import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Clock, Flame, Save, Settings2, ShieldCheck, Store, UtensilsCrossed, XCircle } from 'lucide-react'
import logo from '../../assets/Logo1.png'
import { adminConfigGet, adminConfigSet } from '../../services/adminApi'

const DEFAULT_CONFIG = {
  table_orders_open: true,
  online_orders_open: true,
  closed_message: 'Le service est fermé pour le moment.',
  confirm_alert_minutes: 3,
}

export default function SettingsPage() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadConfig = async () => {
    try {
      const data = await adminConfigGet()
      setConfig({ ...DEFAULT_CONFIG, ...(data?.config || data || {}) })
    } catch (err) {
      setError(err?.message || 'Impossible de charger la configuration.')
    }
  }

  useEffect(() => {
    loadConfig().catch(() => {})
  }, [])

  const updateField = (key, value) => {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      for (const [key, value] of Object.entries(config)) {
        await adminConfigSet(key, value)
      }
      setSuccess('Réglages sauvegardés avec succès.')
    } catch (err) {
      setError(err?.message || 'Impossible de sauvegarder les réglages.')
    } finally {
      setSaving(false)
    }
  }

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
              <span>Paramétrage système</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tighter text-neutral-900 sm:text-6xl md:text-7xl">
              Réglages généraux
            </h1>
          </div>

          {/* Description pleine largeur */}
          <div className="mt-4 w-full">
            <p className="w-full text-center text-sm leading-relaxed text-neutral-600 sm:text-left sm:text-base md:text-xl">
              Contrôlez l'ouverture des commandes en ligne, en salle et configurez les seuils d'alerte du restaurant.
            </p>
          </div>
        </div>
      </header>

      {/* ---------- SECTION PRINCIPALE ROUGE PLEIN ÉCRAN ---------- */}
      <section className="relative min-h-[60vh] w-full rounded-t-[2.5rem] bg-[#C62F1D] px-5 pb-24 pt-12 text-white sm:px-6 lg:px-12">
        <div className="relative z-10 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[2rem] border-2 border-white bg-white p-5 text-neutral-900 shadow-2xl shadow-black/20 sm:p-8"
          >
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#C62F1D] text-white shadow-md">
                  <Settings2 size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold tracking-tighter text-neutral-900 sm:text-3xl">
                    Configuration du restaurant
                  </h2>
                  <p className="text-xs font-semibold text-neutral-500 sm:text-sm">
                    Modifications appliquées instantanément sur l'application.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {/* Commande table */}
              <label className="flex items-center justify-between gap-4 rounded-2xl border-2 border-black/10 bg-neutral-50 p-4 transition hover:border-[#C62F1D]/40 hover:bg-white sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#C62F1D]/10 text-[#C62F1D]">
                    <UtensilsCrossed size={20} strokeWidth={2.5} />
                  </span>
                  <div>
                    <span className="font-display text-base font-extrabold text-neutral-900 sm:text-lg">
                      Commandes à table ouvertes
                    </span>
                    <p className="text-xs text-neutral-500 sm:text-sm">
                      Permet aux clients de scanner le QR code et commander depuis leur table.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(config.table_orders_open)}
                  onChange={(event) => updateField('table_orders_open', event.target.checked)}
                  className="h-6 w-6 accent-[#C62F1D] cursor-pointer"
                />
              </label>

              {/* Commande en ligne */}
              <label className="flex items-center justify-between gap-4 rounded-2xl border-2 border-black/10 bg-neutral-50 p-4 transition hover:border-[#C62F1D]/40 hover:bg-white sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#C62F1D]/10 text-[#C62F1D]">
                    <Store size={20} strokeWidth={2.5} />
                  </span>
                  <div>
                    <span className="font-display text-base font-extrabold text-neutral-900 sm:text-lg">
                      Commandes en ligne ouvertes
                    </span>
                    <p className="text-xs text-neutral-500 sm:text-sm">
                      Autorise les commandes à emporter ou en livraison depuis le site web.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(config.online_orders_open)}
                  onChange={(event) => updateField('online_orders_open', event.target.checked)}
                  className="h-6 w-6 accent-[#C62F1D] cursor-pointer"
                />
              </label>

              {/* Message de fermeture */}
              <label className="block rounded-2xl border-2 border-black/10 bg-neutral-50 p-4 sm:p-5">
                <span className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-700 sm:text-base">
                  Message quand le service est fermé
                </span>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Affiché aux clients s'ils tentent de commander en dehors des horaires.
                </p>
                <input
                  type="text"
                  value={config.closed_message || ''}
                  onChange={(event) => updateField('closed_message', event.target.value)}
                  className="mt-3 w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition focus:border-[#C62F1D]"
                />
              </label>

              {/* Alerte confirmation */}
              <label className="block rounded-2xl border-2 border-black/10 bg-neutral-50 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#C62F1D]" strokeWidth={2.5} />
                  <span className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-700 sm:text-base">
                    Alerte de confirmation (minutes)
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Délai maximum avant qu'une commande en attente ne clignote en orange sur le tableau de bord.
                </p>
                <input
                  type="number"
                  min={1}
                  value={Number(config.confirm_alert_minutes || 3)}
                  onChange={(event) => updateField('confirm_alert_minutes', Number(event.target.value) || 3)}
                  className="mt-3 w-full rounded-xl border-2 border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition focus:border-[#C62F1D] sm:max-w-xs"
                />
              </label>
            </div>

            {error && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3.5 text-sm font-bold text-red-700">
                <XCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-bold text-emerald-700">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end border-t border-neutral-200 pt-5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#C62F1D] px-7 py-3.5 font-display text-sm font-extrabold text-white shadow-lg transition hover:scale-105 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} strokeWidth={2.5} />
                <span>{saving ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}