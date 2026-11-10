import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Minus, Package, Plus, ShoppingBag, Store, Trash2, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { createOrder } from '../../services/api'
import useBodyLock from '../../hooks/useBodyLock'
import { formatPrice } from '../../utils/format'

const TABLE_PAYMENT_NOTE = 'On t’apporte ta commande à table. Tu paies à la caisse en partant.'

// Numéros algériens : 05 / 06 / 07 + 8 chiffres (accepte +213 et les espaces)
function normalizePhone(value) {
  let s = value.replace(/[\s.\-()]/g, '')
  if (s.startsWith('+213')) s = `0${s.slice(4)}`
  else if (s.startsWith('00213')) s = `0${s.slice(5)}`
  else if (s.startsWith('213')) s = `0${s.slice(3)}`
  return s
}
const isValidPhone = (value) => /^0[5-7]\d{8}$/.test(normalizePhone(value))

const ORDER_TYPES = [
  { id: 'sur-place', label: 'Sur place', icon: Store },
  { id: 'a-emporter', label: 'À emporter', icon: Package },
]

export default function CartDrawer() {
  const { items, count, total, open, table, closeCart, setQty, removeLine, clear } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState('cart') // cart | form | done
  const [form, setForm] = useState({ name: '', phone: '', type: 'sur-place', note: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [apiError, setApiError] = useState('')
  const [result, setResult] = useState(null)

  useBodyLock(open)

  // Échap pour fermer
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && closeCart()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closeCart])

  // À la fermeture, on repart sur le panier (sauf si la commande est en cours d'envoi)
  useEffect(() => {
    if (!open && !sending) {
      const id = setTimeout(() => {
        setStep((s) => (s === 'done' || s === 'form' ? 'cart' : s))
        setApiError('')
      }, 300)
      return () => clearTimeout(id)
    }
  }, [open, sending])

  useEffect(() => {
    if (!open) return
    if (table) {
      setForm((f) => ({ ...f, type: 'sur-place' }))
    }
  }, [open, table])

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((er) => ({ ...er, [field]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (sending) return

    const found = {}
    if (table) {
      if (form.name.trim() && form.name.trim().length < 2) found.name = 'Entre ton prénom.'
    } else {
      if (form.name.trim().length < 2) found.name = 'Entre ton prénom.'
      if (!isValidPhone(form.phone)) found.phone = 'Numéro invalide (ex. 0555 12 34 56).'
    }
    setErrors(found)
    if (Object.keys(found).length) return

    setSending(true)
    setApiError('')
    try {
      const res = await createOrder({
        name: form.name.trim(),
        phone: table ? '' : normalizePhone(form.phone),
        type: 'sur-place',
        table: table || undefined,
        note: form.note.trim(),
        total,
        items: items.map((i) => ({
          id: i.productId,
          name: i.name,
          variant: i.variant,
          options: i.options.map((o) => o.id),
          qty: i.qty,
        })),
      })
      setResult(res)
      setStep('done')
      clear()
    } catch {
      setApiError('Impossible d’envoyer la commande. Vérifie ta connexion et réessaie.')
    } finally {
      setSending(false)
    }
  }

  const inputClass = (field) =>
    `mt-1.5 w-full rounded-2xl border-2 bg-white px-4 py-3 text-base outline-none transition focus:border-[#C62F1D] ${
      errors[field] ? 'border-[#C62F1D]' : 'border-neutral-200'
    }`

  const isTableMode = Boolean(table)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/50"
          />

          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Mon panier"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed inset-y-0 right-0 z-[61] flex w-[min(100vw,28rem)] flex-col rounded-l-[2rem] bg-white text-neutral-900 shadow-2xl"
          >
            {/* En-tête */}
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 p-5">
              <div className="flex items-center gap-3">
                {step === 'form' && (
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    aria-label="Retour au panier"
                    className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-neutral-100"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h2 className="font-display text-3xl font-extrabold tracking-tighter">
                  {step === 'cart' && 'Mon panier'}
                  {step === 'form' && 'Valider'}
                  {step === 'done' && 'Merci !'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Fermer"
                className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-neutral-100"
              >
                <X size={22} />
              </button>
            </div>

            {/* ---------- Étape 1 : panier ---------- */}
            {step === 'cart' && (
              <>
                {items.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                    <span className="grid h-20 w-20 place-items-center rounded-full bg-[#C62F1D]/10 text-[#C62F1D]">
                      <ShoppingBag size={36} />
                    </span>
                    <p className="font-display text-2xl font-extrabold tracking-tighter">Ton panier est vide</p>
                    <p className="text-neutral-600">Choisis un burger, on te propose les accompagnements ensuite.</p>
                    <button
                      type="button"
                      onClick={closeCart}
                      className="rounded-full bg-[#C62F1D] px-7 py-3 font-bold text-white transition hover:bg-neutral-900"
                    >
                      Voir le menu
                    </button>
                  </div>
                ) : (
                  <>
                    <ul className="flex-1 divide-y divide-neutral-200 overflow-y-auto overscroll-contain px-5">
                      {items.map((i) => (
                        <li key={i.key} className="py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-display text-xl font-extrabold leading-tight tracking-tighter">
                                {i.name}
                              </p>
                              {(i.variant || i.options.length > 0) && (
                                <p className="mt-1 text-sm text-neutral-600">
                                  {[i.variant, ...i.options.map((o) => o.name)].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                            <p className="whitespace-nowrap font-extrabold text-[#C62F1D]">
                              {formatPrice(i.unitPrice * i.qty)}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center gap-1 rounded-full border-2 border-neutral-200 p-1">
                              <button
                                type="button"
                                onClick={() => setQty(i.key, i.qty - 1)}
                                aria-label={`Retirer un ${i.name}`}
                                className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-neutral-100"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="min-w-6 text-center font-bold tabular-nums">{i.qty}</span>
                              <button
                                type="button"
                                onClick={() => setQty(i.key, i.qty + 1)}
                                aria-label={`Ajouter un ${i.name}`}
                                className="grid h-8 w-8 place-items-center rounded-full bg-[#C62F1D] text-white transition hover:bg-neutral-900"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLine(i.key)}
                              aria-label={`Supprimer ${i.name}`}
                              className="grid h-10 w-10 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-[#C62F1D]"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-neutral-200 p-5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-neutral-600">
                          Total ({count} article{count > 1 ? 's' : ''})
                        </span>
                        <span className="font-display text-3xl font-extrabold tracking-tighter">
                          {formatPrice(total)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-neutral-600">Paiement à la caisse, aucun paiement en ligne.</p>
                      <button
                        type="button"
                        onClick={() => setStep('form')}
                        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#C62F1D] py-4 text-lg font-bold text-white transition hover:bg-neutral-900"
                      >
                        Continuer
                        <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ---------- Étape 2 : informations ---------- */}
            {step === 'form' && (
              <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden" noValidate>
                <div className="flex-1 overflow-y-auto overscroll-contain p-5">
                  {!isTableMode && (
                    <label className="block font-bold">
                      Ton prénom
                      <input
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        autoComplete="given-name"
                        autoFocus
                        placeholder="Ex. Yacine"
                        className={inputClass('name')}
                      />
                      {errors.name && <span className="mt-1 block text-sm font-semibold text-[#C62F1D]">{errors.name}</span>}
                    </label>
                  )}

                  {isTableMode && (
                    <label className="block font-bold">
                      Ton prénom (facultatif)
                      <input
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        autoComplete="given-name"
                        autoFocus
                        placeholder="Ex. Yacine"
                        className={inputClass('name')}
                      />
                      {errors.name && <span className="mt-1 block text-sm font-semibold text-[#C62F1D]">{errors.name}</span>}
                    </label>
                  )}

                  {!isTableMode && (
                    <label className="mt-4 block font-bold">
                      Ton numéro de téléphone
                      <input
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={update('phone')}
                        autoComplete="tel"
                        placeholder="0555 12 34 56"
                        className={inputClass('phone')}
                      />
                      {errors.phone && <span className="mt-1 block text-sm font-semibold text-[#C62F1D]">{errors.phone}</span>}
                    </label>
                  )}

                  {!isTableMode && (
                    <fieldset className="mt-4">
                      <legend className="font-bold">Tu manges…</legend>
                      <div className="mt-1.5 grid grid-cols-2 gap-2">
                        {ORDER_TYPES.map(({ id, label, icon: Icon }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, type: id }))}
                            aria-pressed={form.type === id}
                            className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-3 font-bold transition ${
                              form.type === id
                                ? 'border-[#C62F1D] bg-[#C62F1D] text-white'
                                : 'border-neutral-200 hover:border-[#C62F1D]'
                            }`}
                          >
                            <Icon size={18} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}

                  <label className="mt-4 block font-bold">
                    Une remarque ? <span className="font-normal text-neutral-500">(facultatif)</span>
                    <textarea
                      value={form.note}
                      onChange={update('note')}
                      rows={3}
                      maxLength={200}
                      placeholder="Ex. sans cornichons, bien cuit…"
                      className={`${inputClass('note')} resize-none`}
                    />
                  </label>

                  <div className="mt-5 rounded-2xl bg-[#C62F1D]/5 p-4 text-sm text-neutral-700">
                    <p className="font-bold text-[#C62F1D]">{isTableMode ? `Table ${table}` : 'Paiement à la caisse'}</p>
                    <p className="mt-1">
                      {isTableMode ? TABLE_PAYMENT_NOTE : 'Rien à payer en ligne : tu donnes ton numéro de commande et tu paies sur place.'}
                    </p>
                  </div>

                  {apiError && (
                    <p role="alert" className="mt-4 rounded-2xl bg-[#C62F1D] p-4 font-semibold text-white">
                      {apiError}
                    </p>
                  )}
                </div>

                <div className="border-t border-neutral-200 p-5">
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex w-full items-center justify-between gap-3 rounded-full bg-[#C62F1D] px-6 py-4 text-lg font-bold text-white transition hover:bg-neutral-900 disabled:opacity-60"
                  >
                    <span className="flex items-center gap-3">
                      {sending && (
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      )}
                      {sending ? 'Envoi…' : 'Envoyer ma commande'}
                    </span>
                    <span>{formatPrice(total)}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ---------- Étape 3 : confirmation ---------- */}
            {step === 'done' && result && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-[#C62F1D] text-white">
                  <Check size={40} strokeWidth={3} />
                </span>
                <p className="text-lg text-neutral-600">
                  {isTableMode ? `Ta commande arrive à la table ${table}` : 'Ta commande est envoyée. Ton numéro :'}
                </p>
                <p className="font-display text-7xl font-extrabold tracking-tighter text-[#C62F1D]">
                  {result.orderId}
                </p>
                <p className="max-w-xs text-neutral-700">
                  {isTableMode ? 'On t’apporte ta commande. Tu paies à la caisse en partant.' : 'Donne ce numéro à la caisse et paie sur place quand ta commande est prête.'}
                </p>
                {result.simulated && (
                  <p className="max-w-xs rounded-2xl bg-neutral-100 p-3 text-sm text-neutral-600">
                    Mode test : aucune commande n’est enregistrée tant que <code>VITE_API_URL</code> n’est pas configuré.
                  </p>
                )}
                <div className="mt-2 flex w-full flex-col gap-3">
                  {isTableMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        closeCart()
                        navigate(`/table/${table}`)
                      }}
                      className="rounded-full bg-[#C62F1D] py-3.5 font-bold text-white transition hover:bg-neutral-900"
                    >
                      Retour au menu
                    </button>
                  ) : (
                    <>
                      <Link
                        to="/suivi"
                        onClick={closeCart}
                        className="rounded-full bg-[#C62F1D] py-3.5 font-bold text-white transition hover:bg-neutral-900"
                      >
                        Suivre ma commande
                      </Link>
                      <button
                        type="button"
                        onClick={closeCart}
                        className="rounded-full border-2 border-neutral-200 py-3.5 font-bold transition hover:border-[#C62F1D]"
                      >
                        Retour au menu
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
