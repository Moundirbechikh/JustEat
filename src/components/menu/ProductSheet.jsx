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

function normalizeVariantText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function resolveVariantValue(product, candidate) {
  const items = Array.isArray(product?.variants?.items)
    ? product.variants.items
    : (typeof product?.variants === 'string'
        ? String(product.variants).split('|').map((v) => v.trim()).filter(Boolean)
        : [])

  if (!items.length) return ''

  const raw = String(candidate ?? '').trim()
  const exact = items.find((item) => String(item).trim() === raw)

  // Important : on garde la variante exacte du choix, jamais le nom du produit.
  // Ex. : Coca-Cola / Fanta / Sprite / Hamoud Boualem
  if (exact) return exact
  if (raw && items.some((item) => normalizeVariantText(item) === normalizeVariantText(raw))) {
    return items.find((item) => normalizeVariantText(item) === normalizeVariantText(raw))
  }

  return items[0] || ''
}

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
  const isDrinkChoice = variants?.label?.toLowerCase().includes('boisson') || variants?.items?.length <= 6

  return (
    <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-neutral-500">
        {variants.label || 'Choix'}
      </p>

      <div className={`flex flex-wrap gap-2 ${isDrinkChoice ? 'gap-2.5' : ''}`}>
        {variants.items.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={value === v}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
              value === v
                ? 'border-[#C62F1D] bg-[#C62F1D] text-white shadow-sm shadow-[#C62F1D]/20'
                : 'border-neutral-200 bg-white text-neutral-900 hover:border-[#C62F1D]'
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
  const isDrink = product.category === 'drink'
  const [qty, setQty] = useState(1)
  const [picked, setPicked] = useState([])
  const allowedVariants = product?.variants?.items || []
  const [variant, setVariant] = useState(allowedVariants[0] || '')
  // extras = { [idProduit]: { qty, variant } }
  const [extras, setExtras] = useState({})

  useEffect(() => {
    if (!allowedVariants.length) return
    setVariant((current) => (allowedVariants.includes(current) ? current : allowedVariants[0]))
  }, [allowedVariants])

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
    const resolvedVariant = product.variants ? resolveVariantValue(product, variant) : ''

    const lines = [
      {
        productId: product.id,
        name: product.name,
        variant: resolvedVariant,
        options: chosenOptions,
        basePrice: product.price,
        qty,
      },
    ]
    for (const p of products) {
      const e = extras[p.id]
      if (e?.qty) {
        const resolvedExtraVariant = p.variants ? resolveVariantValue(p, e.variant) : ''
        lines.push({
          productId: p.id,
          name: p.name,
          variant: resolvedExtraVariant,
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
          {product.variants && (
            <div className={isDrink ? 'mb-4' : ''}>
              <VariantChips variants={product.variants} value={variant} onChange={setVariant} />
            </div>
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
                            className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
                              on ? 'border-[#C62F1D] bg-[#C62F1D]' : 'border-neutral-300 bg-white'
                            }`}
                          >
                            {on && <Check size={12} className="text-white" />}
                          </span>
                          {o.name}
                        </span>
                        <span className="font-bold text-[#C62F1D]">{formatPrice(o.price)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {isBurger && groups.length > 0 && (
            <div className="mt-5 space-y-4">
              {groups.map((group) => (
                <div key={group.category} className="space-y-3 rounded-2xl bg-neutral-50 p-3">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-neutral-500">{group.title}</p>
                    <p className="text-xs text-neutral-500">{group.hint}</p>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((p) => {
                      const extra = extras[p.id]
                      const chosenVariant = p.variants?.items?.[0] || ''
                      const variantValue = extra?.variant || chosenVariant

                      return (
                        <div key={p.id} className="rounded-2xl border border-neutral-200 bg-white p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-neutral-900">{p.name}</p>
                              <p className="text-xs text-neutral-500">{formatPrice(p.price)}</p>
                            </div>
                            <Stepper
                              value={extra?.qty || 0}
                              onChange={(next) => setExtraQty(p, next)}
                              label={p.name}
                            />
                          </div>

                          {p.variants && (
                            <div className="mt-3">
                              <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-neutral-500">
                                {p.variants.label}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {p.variants.items.map((v) => (
                                  <button
                                    key={`${p.id}-${v}`}
                                    type="button"
                                    onClick={() => setExtraVariant(p, v)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                                      variantValue === v ? 'border-[#C62F1D] bg-[#C62F1D] text-white' : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                                    }`}
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pied / CTA */}
        <div className="border-t border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Quantité</p>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-tighter text-neutral-900">
                {qty}
              </p>
            </div>
            <Stepper value={qty} onChange={setQty} label={product.name} />
          </div>

          <div className="mb-4 flex items-center justify-between text-sm text-neutral-700">
            <span>{extrasCount ? `${extrasCount} ajout${extrasCount > 1 ? 's' : ''}` : 'Aucun ajout'}</span>
            <span className="text-lg font-extrabold text-[#C62F1D]">{formatPrice(total)}</span>
          </div>

          <button
            type="button"
            onClick={confirm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C62F1D] px-5 py-3.5 text-base font-bold text-white transition hover:bg-neutral-900"
          >
            <Sparkles size={18} />
            Ajouter au panier
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
