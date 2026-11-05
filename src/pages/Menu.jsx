import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, ShoppingBag } from 'lucide-react'
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
  { n: '1', title: 'Choisis ton burger', text: 'Personnalise-le avec tes suppléments.' },
  { n: '2', title: 'Complète ton repas', text: 'Frites, sauces et boisson te sont proposées.' },
  { n: '3', title: 'Paye à la caisse', text: 'Aucun paiement en ligne, aucun compte.' },
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
        {/* ---------- En-tête ---------- */}
        <header className="px-5 pb-10 pt-28 md:pt-36 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-[#C62F1D]/10 px-4 py-1.5 text-sm font-bold text-[#C62F1D]">
                Fraîcheur & fait maison
              </span>
              <h1 className="mt-4 font-display text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl md:text-7xl">
                Notre carte & tarifs
              </h1>
              <p className="mt-4 text-lg text-neutral-600 md:text-xl">
                Choisis tes smash burgers, tes frites et tes boissons. Tu commandes ici, tu paies directement à la caisse.
              </p>
            </div>

            <img
              src={logo}
              alt="Just Burgers"
              className="h-20 w-auto self-start object-contain md:h-32 md:self-end"
            />
          </div>

          {/* Comment ça marche */}
          <ol className="mx-auto mt-8 grid max-w-7xl gap-3 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="flex items-center gap-4 rounded-[1.5rem] border-2 border-black/10 p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#C62F1D] font-display text-2xl font-extrabold text-white">
                  {s.n}
                </span>
                <div>
                  <p className="font-display text-lg font-extrabold leading-tight tracking-tighter text-black">{s.title}</p>
                  <p className="text-sm text-neutral-600">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </header>

        {/* ---------- Barre secondaire (Sans logo, collée à droite, largeur adaptée au texte sur mobile) ---------- */}
        <div className="sticky top-[4.5rem] z-30 pt-2 pb-4 md:top-[5.25rem] pointer-events-none">
          <div className="flex justify-end">
            <div className="pointer-events-auto flex items-center justify-end rounded-l-full bg-white py-3.5 pl-6 pr-0 shadow-xl shadow-black/10 border-y border-l border-neutral-200">
              
              {/* Desktop : Tous les boutons de catégories alignés à droite */}
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

              {/* Mobile : Largeur ajustée exactement au titre de la section active avec écriture plus grande */}
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

        {/* ---------- Burgers (rouge) ---------- */}
        <section
          id="cat-burger"
          className="scroll-mt-32 rounded-t-[2.5rem] bg-[#C62F1D] px-5 pb-20 pt-14 text-white lg:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-4xl font-extrabold tracking-tighter md:text-6xl">
              Nos smash burgers
            </h2>
            <p className="mt-3 flex max-w-2xl items-start gap-2 text-lg text-white/90">
              Après ton burger, on te propose les accompagnements, les sauces et une boisson.
            </p>

            <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-4">
              {byCategory('burger').map((p, i) => (
                <BurgerCard key={p.id} product={p} index={i} onAdd={handleAdd} />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Accompagnements (blanc) ---------- */}
        <section id="cat-side" className="scroll-mt-32 px-5 pt-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-4xl font-extrabold tracking-tighter text-black md:text-5xl">
              Pour accompagner
            </h2>
            <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {byCategory('side').map((p, i) => (
                <ItemRow key={p.id} product={p} index={i} onAdd={handleAdd} />
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Sauces ---------- */}
        <section id="cat-sauce" className="scroll-mt-32 px-5 pb-16 pt-14 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-4xl font-extrabold tracking-tighter text-black md:text-5xl">Sauces</h2>
            <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {byCategory('sauce').map((p, i) => (
                <ItemRow key={p.id} product={p} index={i} onAdd={handleAdd} />
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Boissons ---------- */}
        <section id="cat-drink" className="scroll-mt-32 bg-white border-t border-black/10 px-5 pb-36 pt-16 text-black lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-4xl font-extrabold tracking-tighter md:text-5xl">Boissons</h2>
            <ul className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {byCategory('drink').map((p, i) => (
                <ItemRow key={p.id} product={p} index={i} onAdd={handleAdd} />
              ))}
            </ul>

            {/* Appel à l'action final */}
            <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-[2rem] bg-black p-6 text-white sm:flex-row sm:items-center sm:p-8">
              <div>
                <h3 className="font-display text-3xl font-extrabold tracking-tighter">Prêt à commander ?</h3>
                <p className="mt-1 text-white/80">Vérifie ton panier, valide avec ton prénom, et paye à la caisse.</p>
              </div>
              <button
                type="button"
                onClick={openCart}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#C62F1D] px-7 py-3.5 font-bold text-white transition hover:scale-105 hover:bg-white hover:text-black"
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