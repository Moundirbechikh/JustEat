import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Flame, Utensils, Clock, HeartHandshake } from 'lucide-react'
import why1 from '../assets/Why1.webp'
import why2 from '../assets/Why2.png'

const features = [
  {
    icon: Flame,
    title: 'Smashés à la minute',
    desc: 'Nos steaks de bœuf frais sont écrasés sur une plancha brûlante pour une croûte croustillante et un cœur ultra juteux.',
  },
  {
    icon: Utensils,
    title: 'Fait maison & Frais',
    desc: 'Du pain brioché moelleux aux sauces exclusives, chaque ingrédient est sélectionné rigoureusement chaque jour.',
  },
  {
    icon: Clock,
    title: 'Servi tout chaud',
    desc: 'Préparé à la commande à la vitesse de l’éclair. Zéro attente inutile, juste du plaisir immédiat à déguster.',
  },
  {
    icon: HeartHandshake,
    title: 'Simple & Transparent',
    desc: 'Pas de compte à créer ni de prise de tête : tu choisis, tu commandes en ligne, et tu paies directement sur place à la caisse.',
  },
]

/* ---------- Une carte (identique à ton design actuel) ---------- */
function FeatureCard({ item }) {
  const Icon = item.icon
  return (
    <div className="group relative flex h-full flex-col rounded-[2rem] border-2 border-[#C62F1D] p-8 transition-all duration-300 hover:bg-[#C62F1D] hover:text-white hover:shadow-xl hover:shadow-[#C62F1D]/20">
      {/* Icône avec fond dynamique */}
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C62F1D]/10 text-[#C62F1D] transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">
        <Icon size={28} strokeWidth={2.5} />
      </div>

      <h3 className="font-display text-2xl font-extrabold tracking-tighter">
        {item.title}
      </h3>

      <p className="mt-3 text-neutral-600 transition-colors duration-300 group-hover:text-white/90">
        {item.desc}
      </p>
    </div>
  )
}

/* ---------- Carrousel en boucle (téléphone) ---------- */
function FeatureCarousel({ items, reduce }) {
  const scroller = useRef(null)
  const lastTouch = useRef(0)
  const [active, setActive] = useState(0)
  const n = items.length
  // On ajoute une copie de la 1re carte à la fin pour boucler sans retour visible
  const slides = [...items, items[0]]

  const goTo = (i) => {
    const el = scroller.current
    if (!el || !el.clientWidth) return
    el.scrollTo({ left: i * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' })
  }

  const onScroll = () => {
    const el = scroller.current
    const w = el?.clientWidth
    if (!w) return
    // Arrivé sur la copie : on revient sur la vraie première carte, sans animation
    if (el.scrollLeft >= n * w - 2) {
      el.scrollTo({ left: 0, behavior: 'auto' })
      setActive(0)
      return
    }
    setActive(Math.round(el.scrollLeft / w) % n)
  }

  const markTouch = () => {
    lastTouch.current = Date.now()
  }

  // Défilement automatique (en pause 7 s après un geste de l'utilisateur)
  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => {
      const el = scroller.current
      if (!el || !el.clientWidth) return
      if (Date.now() - lastTouch.current < 7000) return
      goTo(Math.round(el.scrollLeft / el.clientWidth) + 1)
    }, 4500)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  return (
    <div>
      <div
        ref={scroller}
        onScroll={onScroll}
        onPointerDown={markTouch}
        onTouchStart={markTouch}
        onWheel={markTouch}
        className="flex snap-x snap-mandatory items-stretch overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((item, i) => (
          <div
            key={i}
            aria-hidden={i === n ? 'true' : undefined}
            className="w-full shrink-0 snap-center snap-always"
          >
            <FeatureCard item={item} />
          </div>
        ))}
      </div>

      {/* Points */}
      <div className="mt-5 flex justify-center gap-2">
        {items.map((item, i) => (
          <button
            key={item.title}
            type="button"
            onClick={() => {
              markTouch()
              goTo(i)
            }}
            aria-label={`Afficher : ${item.title}`}
            className={`h-2.5 rounded-full transition-all ${
              i === active ? 'w-8 bg-[#C62F1D]' : 'w-2.5 bg-neutral-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/* ---------- Section ---------- */
export default function Concept() {
  const reduce = useReducedMotion()

  return (
    <section className="relative bg-white px-5 py-20 text-neutral-900 md:py-24 lg:px-10">
      <div className="relative mx-auto max-w-7xl">

        {/* Ordinateur : Why2, fixe, en haut à droite */}
        <div className="pointer-events-none absolute -top-16 right-0 hidden h-[19rem] w-[calc(100%_-_43.5rem)] max-w-[34rem] items-center justify-center lg:flex">
          <div className="absolute bottom-3 h-4 w-1/2 rounded-full bg-black/20 blur-xl" />
          <motion.img
            src={why2}
            alt="Burger smashé tout juste servi"
            className="relative h-full max-h-full w-auto max-w-full object-contain drop-shadow-2xl"
            initial={reduce ? false : { y: -60, opacity: 0, rotate: -4 }}
            whileInView={{ y: 0, opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 90, damping: 12 }}
          />
        </div>

        {/* En-tête de section */}
        <div className="max-w-2xl">
          {/* Téléphone : Why1, petit, en haut à droite à côté du titre (le texte s'enroule autour) */}
          <motion.img
            src={why1}
            alt="Burger gourmet déconstruit en lévitation"
            className="float-right -mt-11 ml-2 h-[8.75rem] w-auto object-contain drop-shadow-xl md:hidden"
            initial={reduce ? false : { y: -20, opacity: 0, rotate: -6 }}
            whileInView={{ y: 0, opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 90, damping: 12 }}
          />

          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tighter md:text-6xl">
            Pourquoi nos burgers ont ce goût unique ?
          </h2>
          <p className="mt-4 text-lg text-neutral-600 md:text-xl">
            On ne fait pas de la restauration rapide, on fait du bon. Des produits bruts, de la maîtrise et beaucoup d’amour.
          </p>
        </div>

        {/* Téléphone : une seule carte à la fois, en boucle */}
        <div className="mt-12 sm:hidden">
          <FeatureCarousel items={features} reduce={reduce} />
        </div>

        {/* À partir de 640 px : grille des valeurs */}
        <div className="mt-12 hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, i) => (
            <motion.div
              key={item.title}
              initial={reduce ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <FeatureCard item={item} />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}