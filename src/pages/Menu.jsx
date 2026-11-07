import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, ShoppingBag, Flame, Utensils, CreditCard, Star, Plus, Store } from 'lucide-react'
import fond1 from '../assets/Fond1.png'
import fond2 from '../assets/Fond3.png'
import fritesImg from '../assets/Frites.png'
import nuggetsImg from '../assets/Nuggets.png'
import sauce1 from '../assets/Sauce1.png'
import sauce2 from '../assets/Sauce2.png'
import sauce3 from '../assets/Sauce3.png'
import sauce4 from '../assets/Sauce4.png'
import sauce5 from '../assets/Sauce5.png'
import Ognions from '../assets/Ognions.png'
import { CATEGORIES, OPTIONS, PRODUCTS } from '../data/menu'
import { useCart } from '../context/CartContext'
import { BurgerCard, ItemRow } from '../components/menu/MenuCards'
import ProductSheet from '../components/menu/ProductSheet'

const products = PRODUCTS.filter((p) => p.available !== false)
const byCategory = (id) => products.filter((p) => p.category === id)

const steps = [
  { n: '1', title: 'Choisis ton burger', text: 'Personnalise-le avec tes suppléments.', icon: Flame },
  { n: '2', title: 'Complète ton repas', text: 'Frites, sauces et boisson te sont proposées.', icon: Utensils },
  { n: '3', title: 'Paye à la caisse', text: 'Aucun paiement en ligne, aucun compte.', icon: CreditCard },
]

const sidesList = [
  {
    id: 'frites',
    name: 'Frites Maison Dorées',
    desc: 'Frites fraîches coupées sur place, croustillantes et fondantes.',
    price: 250,
    img: fritesImg,
    tag: 'Fait maison',
    rating: 4.7,
  },
  {
    id: 'nuggets',
    name: 'Nuggets (6 pièces)',
    desc: 'Morceaux de poulet tendre enrobés d’une panure croustillante.',
    price: 450,
    img: nuggetsImg,
    rating: 4.6,
  },
  {
    id: 'onion-rings',
    name: 'Onion Rings (8 pièces)',
    desc: 'Ronds d’oignons doux frits à la perfection.',
    price: 350,
    img: Ognions,
    rating: 4.8,
  },
]

const saucesList = [
  { id: 'sc1', name: 'Sauce Algérienne', price: 50, desc: 'Épicée et onctueuse', img: sauce4, tag: 'Populaire' },
  { id: 'sc2', name: 'Sauce Cheddar Fondu', price: 80, desc: 'Fromage chaud fondant', img: sauce3, tag: 'Gourmand' },
  { id: 'sc3', name: 'Sauce Blanche', price: 50, desc: 'Aillée et fraîche', img: sauce5 },
  { id: 'sc4', name: 'Sauce Barbecue', price: 50, desc: 'Fumée et sucrée', img: sauce2 },
  { id: 'sc5', name: 'Sauce Ketchup', price: 40, desc: 'Fraîche et savoureuse', img: sauce1 },
]

export default function Menu() {
  const reduce = useReducedMotion()
  const { addLines, openCart, count } = useCart()

  const [active, setActive] = useState('burger')
  const [sheet, setSheet] = useState(null)
  const [toast, setToast] = useState(null)
  const tabsRef = useRef(null)

  // États pour les points de pagination mobiles
  const [stepsActiveIndex, setStepsActiveIndex] = useState(0)
  const [burgerActiveIndex, setBurgerActiveIndex] = useState(0)
  const [sideActiveIndex, setSideActiveIndex] = useState(0)
  const [sauceActiveIndex, setSauceActiveIndex] = useState(0)
  const [drinkActiveIndex, setDrinkActiveIndex] = useState(0)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(id)
  }, [toast])

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

  const handleCustomAdd = (item) => {
    addLines([
      { productId: item.id, name: item.name, variant: '', options: [], basePrice: item.price, qty: 1 },
    ])
    setToast(`${item.name} ajouté`)
  }

  const handleConfirm = (lines) => {
    addLines(lines)
    setSheet(null)
    const extra = lines.length - 1
    setToast(`${lines[0].name}${extra > 0 ? ` + ${extra} complément${extra > 1 ? 's' : ''}` : ''} ajouté`)
  }

  const activeCategoryLabel = CATEGORIES.find((c) => c.id === active)?.label || 'Menu'

  const handleScroll = (e, setActiveIndex, widthRatio = 0.85) => {
    const scrollLeft = e.target.scrollLeft
    const cardWidth = e.target.offsetWidth * widthRatio
    const index = Math.round(scrollLeft / cardWidth)
    setActiveIndex(index)
  }

  return (
    <>
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

          {/* Cartes d'étapes : Carrousel aperçu sur mobile, grille sur desktop */}
          <div className="mx-auto max-w-7xl mt-8">
            <ol
              onScroll={(e) => handleScroll(e, setStepsActiveIndex, 0.75)}
              className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0"
            >
              {steps.map((s) => {
                const IconComp = s.icon
                return (
                  <li
                    key={s.n}
                    className="w-[78vw] sm:w-auto shrink-0 snap-center group flex items-center gap-4 sm:gap-5 rounded-[2rem] border-2 border-black/10 bg-neutral-50 p-4 sm:p-6 shadow-sm transition hover:border-[#C62F1D] hover:bg-white hover:shadow-md"
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

            {/* Points de pagination Mobile pour les étapes */}
            <div className="flex justify-center gap-1.5 mt-2 sm:hidden">
              {steps.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    stepsActiveIndex === idx ? 'w-6 bg-[#C62F1D]' : 'w-1.5 bg-black/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        {/* ---------- Barre secondaire Sticky ---------- */}
        <div className="sticky top-[4.5rem] z-30 pt-2 pb-4 md:top-[5.25rem] pointer-events-none">
          <div className="flex justify-end">
            <div className="pointer-events-auto flex items-center justify-end rounded-l-full bg-white py-3.5 pl-6 pr-0 shadow-xl shadow-black/10 border-y border-l border-neutral-200">
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

        {/* ---------- SECTION BURGERS (Rouge) ---------- */}
        <section
          id="cat-burger"
          className="relative overflow-hidden scroll-mt-32 rounded-t-[2.5rem] bg-[#C62F1D] px-5 pb-16 sm:pb-36 pt-12 text-white lg:px-10"
        >
          {/* Image Fond1.png inclinée en haut à droite (desktop) */}
          <div className="hidden sm:block absolute -top-8 right-8 md:right-25 pointer-events-none z-0">
            <img
              src={fond1}
              alt="Burger d'ambiance"
              className="h-44 md:h-60 lg:h-60 w-auto object-contain scale-125 md:scale-140 rotate-[22deg] -translate-y-4 md:-translate-y-6 translate-x-4 md:translate-x-6 opacity-95 drop-shadow-2xl"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div className="max-w-2xl">
                <h2 className="font-display text-3xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl">
                  Nos smash burgers
                </h2>
                <p className="mt-2 text-sm text-white/90 sm:text-base md:text-lg">
                  Après ton burger, on te propose les accompagnements, les sauces et une boisson.
                </p>
              </div>
            </div>

            <div
              onScroll={(e) => handleScroll(e, setBurgerActiveIndex)}
              className="mt-6 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:pb-0"
            >
              {byCategory('burger').map((p, i) => (
                <div key={p.id} className="w-[85vw] shrink-0 snap-center sm:w-full">
                  <BurgerCard product={p} index={i} onAdd={handleAdd} />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
              {byCategory('burger').map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    burgerActiveIndex === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- IMAGE DE TRANSITION POUR MOBILE ONLY ---------- */}
        <div className="relative z-20 mx-auto max-w-7xl px-5 pointer-events-none -mt-12 mb-2 flex justify-end sm:hidden">
          <img
            src={fond2}
            alt="Accompagnements d'ambiance"
            className="h-24 w-auto object-contain drop-shadow-xl translate-x-3"
          />
        </div>

        {/* ---------- ACCOMPAGNEMENTS ---------- */}
        <section id="cat-side" className="relative scroll-mt-32 px-5 pt-4 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {/* Zone Titre : normal sur mobile, remonté + grille 2 colonnes avec Fond3.png sur desktop */}
            <div className="relative z-20 mb-8 sm:mb-0 sm:-mt-24 md:-mt-32 sm:grid sm:grid-cols-2 sm:items-end">
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-tighter text-black sm:text-4xl md:text-5xl">
                  Pour accompagner
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Frites fraîches maison et snacks croustillants.
                </p>
              </div>

              {/* Image Fond3.png cachée sur mobile, visible uniquement sur desktop */}
              <div className="hidden sm:flex justify-end pointer-events-none">
                <img
                  src={fond2}
                  alt="Accompagnements d'ambiance"
                  className="h-44 md:h-56 lg:h-64 w-auto object-contain drop-shadow-xl translate-x-6"
                />
              </div>
            </div>

            {/* Cartes d'accompagnements */}
            <div
              onScroll={(e) => handleScroll(e, setSideActiveIndex)}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0"
            >
              {sidesList.map((item) => (
                <div
                  key={item.id}
                  className="w-[85vw] shrink-0 snap-center sm:w-full group relative mt-12 flex flex-col justify-between rounded-[2rem] bg-white p-6 pt-0 text-neutral-900 shadow-xl shadow-black/10 border border-neutral-100"
                >
                  {item.tag && (
                    <span className="absolute right-4 top-4 rounded-full bg-[#F4A507] px-3 py-1 font-display text-xs font-bold text-neutral-900 shadow-sm z-10">
                      {item.tag}
                    </span>
                  )}

                  <div className="relative -mt-12 mx-auto flex h-36 items-center justify-center">
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                      className="h-32 w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div>
                    <div className="mt-2 flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-xl font-extrabold tracking-tighter text-black">
                        {item.name}
                      </h3>
                      <span className="whitespace-nowrap text-lg font-extrabold text-[#C62F1D]">
                        {item.price} DA
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span>{item.rating}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCustomAdd(item)}
                      className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 font-display text-xs font-bold text-white bg-[#C62F1D] transition-all hover:bg-black"
                    >
                      <Plus size={14} />
                      <span>Commander</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
              {sidesList.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    sideActiveIndex === idx ? 'w-6 bg-[#C62F1D]' : 'w-1.5 bg-black/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- SAUCES ---------- */}
        <section id="cat-sauce" className="scroll-mt-32 px-5 pb-16 pt-14 lg:px-10 bg-neutral-50/50 border-y border-black/5 mt-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h2 className="font-display text-3xl font-extrabold tracking-tighter text-black sm:text-4xl md:text-5xl">
                Sauces
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Choisis tes pots de sauces en supplément pour tremper tes frites et nuggets.
              </p>
            </div>

            <div
              onScroll={(e) => handleScroll(e, setSauceActiveIndex)}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0"
            >
              {saucesList.map((sauce) => (
                <div
                  key={sauce.id}
                  className="w-[85vw] shrink-0 snap-center sm:w-full group relative mt-12 flex flex-col justify-between rounded-[2rem] bg-white p-6 pt-0 text-neutral-900 shadow-xl shadow-black/10 border border-neutral-100"
                >
                  {sauce.tag && (
                    <span className="absolute right-4 top-4 rounded-full bg-[#F4A507] px-3 py-1 font-display text-xs font-bold text-neutral-900 shadow-sm z-10">
                      {sauce.tag}
                    </span>
                  )}

                  <div className="relative -mt-12 mx-auto flex h-36 items-center justify-center">
                    <img
                      src={sauce.img}
                      alt={sauce.name}
                      loading="lazy"
                      className="h-32 w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div>
                    <div className="mt-2 flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-lg font-extrabold tracking-tighter text-black">
                        {sauce.name}
                      </h3>
                      <span className="whitespace-nowrap text-base font-extrabold text-[#C62F1D]">
                        +{sauce.price} DA
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-600 leading-relaxed">{sauce.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span>4.9</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCustomAdd(sauce)}
                      className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 font-display text-xs font-bold text-white bg-[#C62F1D] transition-all hover:bg-black"
                    >
                      <Plus size={14} />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
              {saucesList.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    sauceActiveIndex === idx ? 'w-6 bg-[#C62F1D]' : 'w-1.5 bg-black/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- BOISSONS ---------- */}
        <section id="cat-drink" className="scroll-mt-32 bg-white px-5 pb-16 pt-16 text-black lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl">Boissons</h2>
            <ul
              onScroll={(e) => handleScroll(e, setDrinkActiveIndex)}
              className="mt-6 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0"
            >
              {byCategory('drink').map((p, i) => (
                <li key={p.id} className="w-[85vw] shrink-0 snap-center sm:w-full">
                  <ItemRow product={p} index={i} onAdd={handleAdd} />
                </li>
              ))}
            </ul>

            <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
              {byCategory('drink').map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    drinkActiveIndex === idx ? 'w-6 bg-[#C62F1D]' : 'w-1.5 bg-black/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- PRÊT À COMMANDER (même design que « Commande en ligne » de l'accueil) ---------- */}
        <section className="relative rounded-t-[2.5rem] bg-[#C62F1D] px-5 py-12 text-white md:py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start justify-between gap-6  border-t border-white/20 py-12 md:flex-row md:items-center"
            >
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 font-display text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  <Store size={14} />
                  <span>Paiement sur place uniquement</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tighter text-white sm:text-4xl md:text-5xl">
                  Prêt à commander ? Règle à la caisse.
                </h2>
                <p className="mt-2 text-base text-white/90 sm:text-lg">
                  Vérifie ton panier, valide avec ton prénom et ton numéro, puis paie directement au comptoir lors du retrait. Pas de carte bancaire, pas de compte.
                </p>
              </div>

              <button
                type="button"
                onClick={openCart}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-8 py-4 font-display text-base font-bold text-[#C62F1D] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-neutral-900 hover:text-white"
              >
                <ShoppingBag size={18} />
                <span>Voir mon panier</span>
                {count > 0 && (
                  <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[#F4A507] px-1.5 text-xs font-extrabold text-neutral-900">
                    {count}
                  </span>
                )}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

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