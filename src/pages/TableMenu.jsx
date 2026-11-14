import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, ShoppingBag, Store } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import logo from '../assets/Logo1.png'
import fond1 from '../assets/Fond1.png'
import fond2 from '../assets/Fond2.png'
import { CATEGORIES } from '../data/menu'
import { useMenu } from '../context/MenuContext'
import { useCart } from '../context/CartContext'
import { BurgerCard, ItemRow } from '../components/menu/MenuCards'
import ProductSheet from '../components/menu/ProductSheet'

const TABLE_RE = /^(?:[1-9]|10)$/
const TABLE_STORAGE_KEY = 'jb_table'

function TableAccessScreen({ defaultValue = '', onSubmit }) {
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = value.trim()
    if (!TABLE_RE.test(next)) {
      setError('Numéro de table invalide. Choisis une table de 1 à 10.')
      return
    }
    setError('')
    onSubmit(next)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F2EE] px-5 py-12 text-neutral-900">
      <div className="w-full max-w-md rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-xl shadow-black/10">
        <div className="flex items-center justify-center">
          <img src={logo} alt="Just Burgers" className="h-16 w-auto object-contain" />
        </div>

        <h1 className="mt-6 text-center font-display text-4xl font-extrabold tracking-tighter">
          Just Burgers
        </h1>

        <p className="mt-4 text-center text-base text-neutral-600">
          Saisis le numéro de ta table pour ouvrir le menu.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="block font-bold" htmlFor="table-number">
            Numéro de table
          </label>
          <input
            id="table-number"
            type="number"
            min="1"
            max="10"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ex. 5"
            autoComplete="off"
            className="mt-2 w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3 text-base outline-none transition focus:border-[#C62F1D]"
          />
          {error && <p className="mt-2 text-sm font-semibold text-[#C62F1D]">{error}</p>}

          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C62F1D] px-5 py-3.5 text-base font-bold text-white transition hover:bg-neutral-900"
          >
            Ouvrir la table
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </main>
  )
}

export default function TableMenu() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { setTable, addLines, count } = useCart()
  const { products, options } = useMenu()

  const cleanTableId = tableId?.trim() || ''
  const isValidTable = TABLE_RE.test(cleanTableId)

  useEffect(() => {
    if (isValidTable) {
      sessionStorage.setItem(TABLE_STORAGE_KEY, cleanTableId)
      setTable(cleanTableId)
      return () => setTable(null)
    }
    setTable(null)
    return undefined
  }, [cleanTableId, isValidTable, setTable])

  const byCategory = (id) => products.filter((p) => p.category === id)
  const burgers = byCategory('burger')
  const sides = byCategory('side')
  const sauces = byCategory('sauce')
  const drinks = byCategory('drink')

  const [active, setActive] = useState('burger')
  const [sheet, setSheet] = useState(null)
  const [toast, setToast] = useState(null)
  const tabsRef = useRef(null)

  // États pour la navigation mobile
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
    const sections = CATEGORIES.map((c) => document.getElementById(`table-cat-${c.id}`)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id.replace('table-cat-', ''))
        })
      },
      { rootMargin: '-35% 0px -55% 0px' }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [products])

  const goTo = (id) =>
    document
      .getElementById(`table-cat-${id}`)
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

  const handleScroll = (e, setActiveIndex, widthRatio = 0.85) => {
    const scrollLeft = e.target.scrollLeft
    const cardWidth = e.target.offsetWidth * widthRatio
    const index = Math.round(scrollLeft / cardWidth)
    setActiveIndex(index)
  }

  if (!isValidTable) {
    return <TableAccessScreen defaultValue={cleanTableId} onSubmit={(next) => navigate(`/table/${next}`)} />
  }

  return (
    <>
      <main className="bg-white text-black">
        {/* ---------- HERO SECTION AVEC FORME SVG ROUGE DANS LE COIN ET LOGO GRAND ---------- */}
        <header className="relative overflow-hidden px-5 pb-6 pt-6 sm:pt-8 lg:px-10">
          {/* Forme SVG Rouge du coin supérieur droit */}
          <div className="absolute top-0 right-0 pointer-events-none z-0 w-56 h-44 sm:w-80 sm:h-80 md:w-[40%] md:h-72">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full fill-[#C62F1D]"
              preserveAspectRatio="none"
            >
              <path d="M 200,0 L 200,180 C 120,180 60,120 40,0 Z" />
            </svg>
          </div>

          {/* Logo placé en grand à l'intérieur du badge rouge en haut à droite */}
          <div className="absolute top-3 right-1 sm:top-6 sm:right-6 z-10 pointer-events-none flex items-center justify-center p-2">
            <img
              src={logo}
              alt="Just Burgers"
              className="h-18 sm:h-24 md:h-32 w-auto object-contain brightness-0 invert drop-shadow-md"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            {/* Ligne Titre + Badge Table */}
            <div className="md:pt-10 pr-36 sm:pr-60 md:pr-72">
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tighter sm:text-6xl md:text-7xl">
                Notre carte & tarifs
              </h1>
              <div className="mt-4 inline-block">
                <span className="rounded-full bg-[#C62F1D] px-3.5 py-1.5 font-display text-md font-bold uppercase tracking-wid text-white shadow-sm sm:text-lg">
                  Table {cleanTableId}
                </span>
              </div>
            </div>

            {/* Description prenant tout le width sous l'ensemble */}
            <div className="mt-6 w-full">
              <p className="text-sm text-neutral-600 sm:text-base md:text-xl leading-relaxed w-full max-w-none">
                Choisis ton menu directement ici. Nos serveurs vont ramener ta commande très rapidement à ta table.
              </p>
            </div>
          </div>
        </header>

        {/* ---------- Barre secondaire Sticky ---------- */}
        <div className="sticky top-2 z-30 pt-1 pb-3 pointer-events-none">
          <div className="flex justify-end">
            <div className="pointer-events-auto flex items-center justify-end rounded-l-full bg-white py-3 pl-6 pr-0 shadow-xl shadow-black/10 border-y border-l border-neutral-200">
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
          id="table-cat-burger"
          className="relative overflow-hidden scroll-mt-32 rounded-t-[2.5rem] bg-[#C62F1D] px-5 pb-16 sm:pb-32 pt-10 text-white lg:px-10"
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
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
              className="mt-4 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible sm:pb-0"
            >
              {burgers.map((p, i) => (
                <div key={p.id} className="w-[85vw] shrink-0 snap-center sm:w-full">
                  <BurgerCard product={p} index={i} onAdd={handleAdd} />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-2 sm:hidden">
              {burgers.map((_, idx) => (
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
        <div className="relative z-20 mx-auto max-w-7xl px-5 pointer-events-none -mt-10 mb-1 flex justify-end sm:hidden">
          <img
            src={fond2}
            alt="Accompagnements d'ambiance"
            className="h-20 w-auto object-contain translate-x-3"
          />
        </div>

        {/* ---------- ACCOMPAGNEMENTS ---------- */}
        <section id="table-cat-side" className="relative scroll-mt-32 px-5 pt-2 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="relative z-20 mb-6 sm:mb-0 sm:-mt-24 md:-mt-28 sm:grid sm:grid-cols-2 sm:items-end">
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-tighter text-black sm:text-4xl md:text-5xl">
                  Pour accompagner
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Frites fraîches maison et snacks croustillants.
                </p>
              </div>

              <div className="hidden sm:flex justify-end pointer-events-none">
                <img
                  src={fond2}
                  alt="Accompagnements d'ambiance"
                  className="h-40 md:h-52 lg:h-60 w-auto object-contain translate-x-6"
                />
              </div>
            </div>

            <div
              onScroll={(e) => handleScroll(e, setSideActiveIndex)}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0"
            >
              {sides.map((item) => (
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
                    {item.img && (
                      <img
                        src={item.img}
                        alt={item.name}
                        loading="lazy"
                        className="h-32 w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
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

                  <div className="mt-6 pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => handleAdd(item)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-2.5 font-display text-xs font-bold text-white bg-[#C62F1D] transition-all hover:bg-black"
                    >
                      <ArrowRight size={14} />
                      <span>Commander</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-2 sm:hidden">
              {sides.map((_, idx) => (
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
        <section id="table-cat-sauce" className="scroll-mt-32 px-5 pb-12 pt-10 lg:px-10 bg-neutral-50/50 border-y border-black/5 mt-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
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
              {sauces.map((sauce) => (
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
                    {sauce.img && (
                      <img
                        src={sauce.img}
                        alt={sauce.name}
                        loading="lazy"
                        className="h-32 w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
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

                  <div className="mt-6 pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => handleAdd(sauce)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-2.5 font-display text-xs font-bold text-white bg-[#C62F1D] transition-all hover:bg-black"
                    >
                      <ArrowRight size={14} />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 mt-2 sm:hidden">
              {sauces.map((_, idx) => (
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
        <section id="table-cat-drink" className="scroll-mt-32 bg-white px-5 pb-24 pt-10 text-black lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="font-display text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl">
                Boissons
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Des boissons bien fraîches pour accompagner ton repas.
              </p>
            </div>

            <ul
              onScroll={(e) => handleScroll(e, setDrinkActiveIndex)}
              className="mt-4 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0"
            >
              {drinks.map((p, i) => (
                <li key={p.id} className="w-[85vw] shrink-0 snap-center sm:w-full">
                  <ItemRow product={p} index={i} onAdd={handleAdd} />
                </li>
              ))}
            </ul>

            <div className="flex justify-center gap-1.5 mt-2 sm:hidden">
              {drinks.map((_, idx) => (
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

        {/* ---------- PRÊT À COMMANDER ---------- */}
        <section className="relative rounded-t-[2.5rem] bg-[#C62F1D] px-5 py-12 text-white md:py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start justify-between gap-6 border-t border-white/20 py-8 md:flex-row md:items-center"
            >
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 font-display text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  <Store size={14} />
                  <span>Service à la table {cleanTableId}</span>
                </div>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tighter text-white sm:text-4xl md:text-5xl">
                  Prêt à commander ?
                </h2>
                <p className="mt-2 text-base text-white/90 sm:text-lg">
                  Vérifie ton panier, valide ta commande et nos serveurs vont l'apporter très rapidement à la table {cleanTableId}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {}}
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
            optionsMap={options}
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