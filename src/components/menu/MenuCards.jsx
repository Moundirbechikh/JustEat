import { motion, useReducedMotion } from 'framer-motion'
import { CupSoda, Droplet, Drumstick, Plus, Utensils } from 'lucide-react'
import { formatPrice } from '../../utils/format'

const ICONS = { side: Drumstick, sauce: Droplet, drink: CupSoda }

// Petite tuile avec l'icône de la catégorie (accompagnements, sauces, boissons)
export function CategoryIcon({ category, size = 26 }) {
  const Icon = ICONS[category] || Utensils
  return (
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#C62F1D]/10 text-[#C62F1D]">
      <Icon size={size} strokeWidth={2.2} />
    </span>
  )
}

/* ---------- Carte burger : la photo dépasse du haut (comme MiniMenu) ---------- */
export function BurgerCard({ product, index = 0, onAdd }) {
  const reduce = useReducedMotion()

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative mt-24 flex flex-col rounded-[2rem] bg-white p-6 pt-0 text-neutral-900 shadow-xl shadow-black/20"
    >
      {product.tag && (
        <span className="absolute right-4 top-4 rounded-full bg-[#F4A507] px-3 py-1 text-xs font-bold text-neutral-900">
          {product.tag}
        </span>
      )}

      <img
        src={product.img}
        alt={product.name}
        loading="lazy"
        className="relative -mt-20 mx-auto h-40 w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105"
      />

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl font-extrabold tracking-tighter">{product.name}</h3>
        <span className="whitespace-nowrap text-xl font-extrabold text-[#C62F1D]">
          {formatPrice(product.price)}
        </span>
      </div>

      <p className="mt-2 text-neutral-600">{product.desc}</p>

      <p className="mt-3 text-sm font-semibold text-[#C62F1D]">
        Suppléments, accompagnements et boisson au choix
      </p>

      <button
        type="button"
        onClick={() => onAdd(product)}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[#C62F1D] py-3 font-bold text-white transition hover:bg-neutral-900"
      >
        <Plus size={18} />
        Composer mon burger
      </button>
    </motion.article>
  )
}

/* ---------- Ligne compacte : accompagnements, sauces, boissons ---------- */
export function ItemRow({ product, index = 0, onAdd }) {
  const reduce = useReducedMotion()

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group flex items-center gap-4 rounded-[1.5rem] border-2 border-neutral-200 bg-white p-4 text-neutral-900 transition-colors hover:border-[#C62F1D]"
    >
      <CategoryIcon category={product.category} />

      <div className="min-w-0 flex-1">
        <h3 className="font-display text-xl font-extrabold leading-tight tracking-tighter">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-neutral-600">{product.desc}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="whitespace-nowrap font-extrabold text-[#C62F1D]">
          {formatPrice(product.price)}
        </span>
        <button
          type="button"
          onClick={() => onAdd(product)}
          aria-label={`Ajouter ${product.name}`}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#C62F1D] text-white transition hover:scale-110 hover:bg-neutral-900"
        >
          <Plus size={20} />
        </button>
      </div>
    </motion.li>
  )
}
