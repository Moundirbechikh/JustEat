import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/format'

// Barre flottante en bas de l'écran : visible dès qu'il y a des articles
export default function CartBar() {
  const { count, total, open, openCart } = useCart()

  return (
    <AnimatePresence>
      {count > 0 && !open && (
        <motion.button
          key="cartbar"
          type="button"
          onClick={openCart}
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-[#C62F1D] px-6 py-4 font-bold text-white shadow-2xl shadow-[#C62F1D]/40 transition hover:bg-neutral-900"
        >
          <span className="flex items-center gap-3">
            <span className="relative">
              <ShoppingBag size={24} />
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#F4A507] px-1 text-xs font-extrabold text-neutral-900">
                {count}
              </span>
            </span>
            Voir mon panier
          </span>
          <span>{formatPrice(total)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
