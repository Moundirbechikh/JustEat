import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Minus, Plus, Sparkles, X } from 'lucide-react'
import useBodyLock from '../../hooks/useBodyLock'
import { formatPrice } from '../../utils/format'
import { CategoryIcon } from './MenuCards'

// Les « compléments » proposés quand on commande un burger
const EXTRA_GROUPS = [
  { category: 'side', title: 'Accompagnements', hint: 'Les frites, c’est le bon réflexe.' },
  { category: 'sauce', title: 'Sauces', hint: 'Pour tremper frites et nuggets.' },
  { category: 'drink', title: 'Boissons', hint: 'Bien fraîche avec un burger chaud.' },
]

function Stepper({ value, onChange, min = 0, max = 20, label }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border-2 border-neutral-200 p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Retirer ${label}`}
        className="grid h-8 w-8 place-items-center rounded-full text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-30"
      >
        <Minus size={16} />
      </button>
      <span className="min-w-6 text-center font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Ajouter ${label}`}
        className="grid h-8 w-8 place-items-center rounded-full bg-[#C62F1D] text-white transition hover:bg-neutral-900 disabled:opacity-30"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

function VariantChips({ variants, value, onChange }) {
  return (
    <div className="mt-3">
      <p className="mb-2 text-sm font-semibold text-neutral-600">{variants.label}</p>
      <div className="flex flex-wrap gap-2">
        {variants.items.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition ${
              value === v
                ? 'border-[#C62F1D] bg-[#C62F1D] text-white'
                : 'border-neutral-200 text-neutral-900 hover:border-[#C62F1D]'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ProductSheet({ product, products, optionsMap, onClose, onConfirm }) {
  useBodyLock(true)

  const isBurger = product.category === 'burger'
  const [qty, setQty] = useState(1)
  const [picked, setPicked] = useState([])
  const [variant, setVariant] = useState(product.variants?.items?.[0] || '')
  // extras = { [idProduit]: { qty, variant } }
  const [extras, setExtras] = useState({})

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const options = (product.options || []).map((id) => optionsMap[id]).filter(Boolean)
  const chosenOptions = options.filter((o) => picked.includes(o.id))
  const unitPrice = product.price + chosenOptions.reduce((s, o) => s + o.price, 0)

  const groups = useMemo(
    () =>
      isBurger
        ? EXTRA_GROUPS.map((g) => ({
            ...g,
            items: products.filter((p) => p.category === g.category && p.available !== false),
          })).filter((g) => g.items.length)
        : [],
    [isBurger, products]
  )

  const extrasTotal = products.reduce((s, p) => s + (extras[p.id]?.qty || 0) * p.price, 0)
  const extrasCount = Object.values(extras).reduce((s, e) => s + e.qty, 0)
  const total = unitPrice * qty + extrasTotal

  const toggleOption = (id) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const setExtraQty = (p, nextQty) =>
    setExtras((prev) => {
      const q = Math.max(0, Math.min(20, nextQty))
      if (q === 0) {
        const copy = { ...prev }
        delete copy[p.id]
        return copy
      }
      const current = prev[p.id] || { variant: p.variants?.items?.[0] || '' }
      return { ...prev, [p.id]: { ...current, qty: q } }
    })

  const setExtraVariant = (p, v) =>
    setExtras((prev) => (prev[p.id] ? { ...prev, [p.id]: { ...prev[p.id], variant: v } } : prev))

  const confirm = () => {
    const lines = [
      {
        productId: product.id,
        name: product.name,
        variant: product.variants ? variant : '',
        options: chosenOptions,
        basePrice: product.price,
        qty,
      },
    ]
    for (const p of products) {
      const e = extras[p.id]
      if (e?.qty) {
        lines.push({
          productId: p.id,
          name: p.name,
          variant: p.variants ? e.variant : '',
          options: [],
          basePrice: p.price,
          qty: e.qty,
        })
      }
    }
    onConfirm(lines)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="relative flex max-h-[92svh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] bg-white text-neutral-900 shadow-2xl sm:rounded-[2rem]"
      >
        {/* En-tête */}
        <div className="flex items-start gap-4 border-b border-neutral-200 p-5">
          {product.img ? (
            <img src={product.img} alt="" className="h-20 w-auto shrink-0 object-contain drop-shadow-lg" />
          ) : (
            <CategoryIcon category={product.category} />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-3xl font-extrabold leading-none tracking-tighter">
              {product.name}
            </h2>
            <p className="mt-2 text-sm text-neutral-600">{product.desc}</p>
            <p className="mt-2 font-extrabold text-[#C62F1D]">{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:bg-neutral-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* Contenu défilant */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          {/* Choix obligatoire du produit principal (boisson, sauce...) */}
          {product.variants && (
            <VariantChips variants={product.variants} value={variant} onChange={setVariant} />
          )}

          {/* Suppléments du burger */}
          {options.length > 0 && (
            <section>
              <h3 className="font-display text-xl font-extrabold tracking-tighter">
                Personnalise ton burger
              </h3>
              <ul className="mt-3 grid gap-2">
                {options.map((o) => {
                  const on = picked.includes(o.id)
                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => toggleOption(o.id)}
                        className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-3 text-left transition ${
                          on ? 'border-[#C62F1D] bg-[#C62F1D]/5' : 'border-neutral-200 hover:border-[#C62F1D]/50'
                        }`}
                      >
                        <span className="flex items-center gap-3 font-semibold">
                          <span
                            className={`grid h-6 w-6 place-items-center rounded-md border-2 transition ${
                              on ? 'border-[#C62F1D] bg-[#C62F1D] text-white' : 'border-neutral-300'
                            }`}
                          >
                            {on && <Check size={16} strokeWidth={3} />}
                          </span>
                          {o.name}
                        </span>
                        <span className="text-sm font-bold text-neutral-600">
                          {o.price > 0 ? `+ ${formatPrice(o.price)}` : 'Gratuit'}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* Recommandations : accompagnements, sauces, boissons */}
          {groups.length > 0 && (
            <section className={options.length ? 'mt-8' : ''}>
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-[#C62F1D]" />
                <h3 className="font-display text-xl font-extrabold tracking-tighter">
                  Complète ton repas
                </h3>
              </div>

              {groups.map((g) => (
                <div key={g.category} className="mt-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="font-bold">{g.title}</h4>
                    <p className="text-sm text-neutral-500">{g.hint}</p>
                  </div>

                  <ul className="mt-2 grid gap-2">
                    {g.items.map((p) => {
                      const e = extras[p.id]
                      return (
                        <li
                          key={p.id}
                          className={`rounded-2xl border-2 p-3 transition ${
                            e ? 'border-[#C62F1D] bg-[#C62F1D]/5' : 'border-neutral-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="flex flex-wrap items-center gap-2 font-semibold leading-tight">
                                {p.name}
                                {p.recommend && (
                                  <span className="rounded-full bg-[#F4A507] px-2 py-0.5 text-[0.7rem] font-bold text-neutral-900">
                                    Conseillé
                                  </span>
                                )}
                              </p>
                              <p className="text-sm font-bold text-[#C62F1D]">{formatPrice(p.price)}</p>
                            </div>
                            <Stepper
                              value={e?.qty || 0}
                              onChange={(q) => setExtraQty(p, q)}
                              label={p.name}
                            />
                          </div>

                          {e && p.variants && (
                            <VariantChips
                              variants={p.variants}
                              value={e.variant}
                              onChange={(v) => setExtraVariant(p, v)}
                            />
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Pied : quantité + validation */}
        <div className="flex items-center gap-3 border-t border-neutral-200 bg-white p-4">
          <Stepper value={qty} onChange={setQty} min={1} label={product.name} />
          <button
            type="button"
            onClick={confirm}
            className="flex flex-1 items-center justify-between gap-3 rounded-full bg-[#C62F1D] px-6 py-3.5 font-bold text-white transition hover:bg-neutral-900"
          >
            <span>
              Ajouter au panier
              {extrasCount > 0 && (
                <span className="ml-2 text-sm font-semibold text-white/80">
                  + {extrasCount} complément{extrasCount > 1 ? 's' : ''}
                </span>
              )}
            </span>
            <span className="whitespace-nowrap">{formatPrice(total)}</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
