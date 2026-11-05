import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, ShoppingBag, Flame, Utensils, CreditCard } from 'lucide-react'
import Navbar from '../components/Navbar'
import logo from '../assets/Logo1.png'
import { CATEGORIES, OPTIONS, PRODUCTS } from '../data/menu'
import { useCart } from '../context/CartContext'
import { BurgerCard, ItemRow } from '../components/menu/MenuCards'
import ProductSheet from '../components/menu/ProductSheet'
import CartDrawer from '../components/menu/CartDrawer'
import CartBar from '../components/menu/CartBar'

const products = PRODUCTS.filter((p) => p.available !== false)
const byCategory = (id) => products.filter((p) => p.category === id)

const steps = [
  { n: '1', title: 'Choisis ton burger', text: 'Personnalise-le avec tes suppléments.', icon: Flame },
  { n: '2', title: 'Complète ton repas', text: 'Frites, sauces et boisson te sont proposées.', icon: Utensils },
  { n: '3', title: 'Paye à la caisse', text: 'Aucun paiement en ligne, aucun compte.', icon: CreditCard },
]

export default function Menu() {
  const reduce = useReducedMotion()
  const { addLines, openCart } = useCart()

  const [active, setActive] = useState('burger')
  const [sheet, setSheet] = useState(null)
  const [toast, setToast] = useState(null)
  const tabsRef = useRef(null)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(id)
  }, [toast])

  // L'onglet actif suit la section visible à l'écran
  useEffect(() => {
    const sections = CATEGORIES.map((c) => document.getElementById(`cat-${c.id}`)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id.replace('cat-', ''))
        })
      },
      { rootMargin: '-35% 0px -55% 0px' }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const goTo = (id) =>
    document
      .getElementById(`cat-${id}`)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })

  const handleAdd = (product) => {
    if (product.category === 'burger' || product.variants || product.options?.length) {
      setSheet(product)
      return
    }
    addLines([
      { productId: product.id, name: product.name, variant: '', options: [], basePrice: product.price, qty: 1 },
    ])
    setToast(`${product.name} ajouté`)
  }

  const handleConfirm = (lines) => {
    addLines(lines)
    setSheet(null)
    const extra = lines.length - 1
    setToast(`${lines[0].name}${extra > 0 ? ` + ${extra} complément${extra > 1 ? 's' : ''}` : ''} ajouté`)
  }

  const activeCategoryLabel = CATEGORIES.find((c) => c.id === active)?.label || 'Menu'

  return (
    <>
      <Navbar />

      <main className="bg-white text-black">
        {/* ---------- En-tête Principal ---------- */}
        <header className="px-5 pb-8 pt-20 md:pt-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tighter sm:text-6xl md:text-7xl">
                Notre carte & tarifs
              </h1>
              <p className="mt-3 text-sm text-neutral-600 sm:text-base md:text-xl leading-relaxed">
                Choisis tes smash burgers, tes frites et tes boissons. Tu commandes directement ici et tu paies à la caisse.
              </p>
            </div>
          </div>

          {/* Cartes d'étapes (Responsive Desktop & Phone) */}
          <ol className="mx-auto mt-8 grid max-w-7xl gap-4 sm:grid-cols-3">
            {steps.map((s) => {
              const IconComp = s.icon
              return (
                <li
                  key={s.n}
                  className="group flex items-center gap-4 sm:gap-5 rounded-[2rem] border-2 border-black/10 bg-neutral-50 p-4 sm:p-6 shadow-sm transition hover:border-[#C62F1D] hover:bg-white hover:shadow-md"
                >
                  <span className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-[#C62F1D] font-display text-xl sm:text-2xl font-extrabold text-white shadow-md">
                    {s.n}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display text-base sm:text-lg font-extrabold leading-tight tracking-tight text-black">
                        {s.title}
                      </p>
                      <IconComp size={16} className="text-[#C62F1D] shrink-0" />
                    </div>
                    <p className="mt-1 text-xs text-neutral-600 sm:text-sm">{s.text}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </header>

        {/* ---------- Barre secondaire Sticky (Collée à droite) ---------- */}
        <div className="sticky top-[4.5rem] z-30 pt-2 pb-4 md:top-[5.25rem] pointer-events-none">
          <div className="flex justify-end">
            <div className="pointer-events-auto flex items-center justify-end rounded-l-full bg-white py-3.5 pl-6 pr-0 shadow-xl shadow-black/10 border-y border-l border-neutral-200">
              
              {/* Desktop : Tous les onglets alignés à droite */}
              <div
                ref={tabsRef}
                className="hidden md:flex items-center gap-2 pr-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    data-tab={c.id}
                    onClick={() => goTo(c.id)}
                    aria-current={active === c.id ? 'true' : undefined}
                    className={`shrink-0 rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                      active === c.id
                        ? 'bg-[#C62F1D] text-white shadow-md scale-105'
                        : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Mobile : Section active */}
              <div className="flex md:hidden items-center pr-4">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={active}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block rounded-full bg-[#C62F1D] px-6 py-2.5 text-sm font-extrabold text-white shadow-sm"
                  >
                    {activeCategoryLabel}
                  </motion.span>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

        {/* ---------- SECTION BURGERS (Rouge) avec Logo placé à droite ---------- */}
        <section
          id="cat-burger"
          className="scroll-mt-32 rounded-t-[2.5rem] bg-[#C62F1D] px-5 pb-20 pt-12 text-white lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            
            {/* Header de la section avec Titre à gauche et Logo à droite */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl">
                  Nos smash burgers
                </h2>
                <p className="mt-2 text-sm text-white/90 sm:text-base md:text-lg">
                  Après ton burger, on te propose les accompagnements, les sauces et une boisson.
                </p>
              </div>

              {/* Logo positionné dans l'encadré supérieur droit de la section rouge */}
              <div className="shrink-0 self-start sm:self-center">
                <img
                  src={logo}
                  alt="Just Burgers"
                  className="h-16 w-auto object-contain sm:h-20 md:h-24 drop-shadow-md"
                />
              </div>
            </div>

            {/* Carrousel 1 par 1 sur Mobile / Grille sur Desktop */}
            <div className="mt-6 flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:pb-0">
              {byCategory('burger').map((p, i) => (
                <div key={p.id} className="w-[85vw] shrink-0 snap-center sm:w-full">
                  <BurgerCard product={p} index={i} onAdd={handleAdd} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Accompagnements ---------- */}
        <section id="cat-side" className="scroll-mt-32 px-5 pt-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tighter text-black sm:text-4xl md:text-5xl">
              Pour accompagner
            </h2>
            <ul className="mt-6 flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
              {byCategory('side').map((p, i) => (
                <li key={p.id} className="w-[85vw] shrink-0 snap-center sm:w-full">
                  <ItemRow product={p} index={i} onAdd={handleAdd} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Sauces ---------- */}
        <section id="cat-sauce" className="scroll-mt-32 px-5 pb-16 pt-14 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tighter text-black sm:text-4xl md:text-5xl">Sauces</h2>
            <ul className="mt-6 flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
              {byCategory('sauce').map((p, i) => (
                <li key={p.id} className="w-[85vw] shrink-0 snap-center sm:w-full">
                  <ItemRow product={p} index={i} onAdd={handleAdd} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Boissons ---------- */}
        <section id="cat-drink" className="scroll-mt-32 bg-white border-t border-black/10 px-5 pb-36 pt-16 text-black lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl">Boissons</h2>
            <ul className="mt-6 flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
              {byCategory('drink').map((p, i) => (
                <li key={p.id} className="w-[85vw] shrink-0 snap-center sm:w-full">
                  <ItemRow product={p} index={i} onAdd={handleAdd} />
                </li>
              ))}
            </ul>

            {/* Appel à l'action final */}
            <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-black p-6 text-white sm:flex-row sm:items-center sm:p-8">
              <div>
                <h3 className="font-display text-2xl font-extrabold tracking-tighter sm:text-3xl">Prêt à commander ?</h3>
                <p className="mt-1 text-xs text-white/80 sm:text-sm">Vérifie ton panier, valide avec ton prénom, et paye à la caisse.</p>
              </div>
              <button
                type="button"
                onClick={openCart}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#C62F1D] px-7 py-3.5 font-bold text-white transition hover:scale-105 hover:bg-white hover:text-black text-sm"
              >
                <ShoppingBag size={20} />
                Voir mon panier
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Éléments flottants ---------- */}
      <CartBar />
      <CartDrawer />

      <AnimatePresence>
        {sheet && (
          <ProductSheet
            key={sheet.id}
            product={sheet}
            products={products}
            optionsMap={OPTIONS}
            onClose={() => setSheet(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-4 bottom-24 z-[55] mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full bg-black px-5 py-3 font-bold text-white shadow-xl"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#C62F1D] text-white">
              <Check size={14} strokeWidth={3} />
            </span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}