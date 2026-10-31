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

/* ---------- Téléphone : bosse blanche derrière le burger ---------- */
const BUMP_R = 86
const BUMP_F = 18
const bumpXf = Math.sqrt(BUMP_R * BUMP_R + 2 * BUMP_R * BUMP_F)
const bumpTx = (BUMP_R * bumpXf) / (BUMP_R + BUMP_F)
const bumpTy = (BUMP_R * BUMP_F) / (BUMP_R + BUMP_F)
const BUMP_PATH =
  `M ${-bumpXf} 10 V 0 ` +
  `A ${BUMP_F} ${BUMP_F} 0 0 0 ${-bumpTx} ${-bumpTy} ` +
  `A ${BUMP_R} ${BUMP_R} 0 0 1 ${bumpTx} ${-bumpTy} ` +
  `A ${BUMP_F} ${BUMP_F} 0 0 0 ${bumpXf} 0 V 10 Z`

/* ---------- Ordinateur : Vapeur rééquilibrée (plus haute et moins à droite) ---------- */
const PLUME_A =
  'M -18 12 C -28 -10, 0 -35, -12 -70 C -24 -105, 5 -130, -8 -165 C -2 -140, -20 -115, -6 -80 C 8 -45, -15 -20, -2 12 Z'
const PLUME_B =
  'M -15 12 C 5 -15, -20 -40, -2 -80 C 15 -115, -15 -145, 0 -185 C 8 -155, -8 -125, 2 -85 C 12 -45, -10 -20, 2 12 Z'
const PLUME_C =
  'M -16 10 C -5 -12, 18 -35, 2 -75 C -12 -110, 12 -135, 5 -170 C 8 -140, -5 -115, 8 -75 C 20 -35, -2 -15, 4 10 Z'

// Positions recentrées vers le milieu/droite du steak (moins extrêmes à droite) et hauteur augmentée
const plumes = [
  { d: PLUME_A, left: '60%', scale: 1.0, dur: 5.0, delay: 0 },
  { d: PLUME_B, left: '72%', scale: 1.15, dur: 5.8, delay: -1.6 },
  { d: PLUME_C, left: '83%', scale: 0.95, dur: 4.5, delay: -2.8 },
]

function SteamPlumes() {
  return (
    <div aria-hidden="true" className="pointer-events-none">
      <style>{`
        .jb-plume {
          transform-box: fill-box;
          transform-origin: 50% 100%;
          animation: jb-plume var(--dur) ease-in-out var(--delay) infinite alternate;
        }
        @keyframes jb-plume {
          0% { transform: scale(0.92, 0.9) translateY(0px) rotate(0deg); opacity: 0.85; }
          50% { transform: scale(1.08, 1.15) translateY(-14px) rotate(1.5deg); opacity: 0.95; }
          100% { transform: scale(0.98, 1.05) translateY(-26px) rotate(-1.5deg); opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          .jb-plume { animation: none; }
        }
      `}</style>

      {/* Dégradé blanc net et fondu en haut */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="jb-mist" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="0.8" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Position de départ ajustée */}
      <div className="absolute top-2 right-6 left-0 h-0">
        {plumes.map((p, idx) => (
          <div key={idx} className="absolute h-0 w-0" style={{ left: p.left }}>
            <svg width="1" height="1" className="absolute left-0 top-0 overflow-visible">
              <g transform={`scale(${p.scale})`}>
                <path
                  className="jb-plume"
                  d={p.d}
                  fill="url(#jb-mist)"
                  style={{ '--dur': `${p.dur}s`, '--delay': `${p.delay}s` }}
                />
              </g>
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Une carte ---------- */
function FeatureCard({ item }) {
  const Icon = item.icon
  return (
    <div className="group relative flex h-full flex-col rounded-[2rem] border-2 border-[#C62F1D] p-8 transition-all duration-300 hover:bg-[#C62F1D] hover:text-white hover:shadow-xl hover:shadow-[#C62F1D]/20">
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

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => {
      const el = scroller.current
      if (!el || !el.clientWidth) return
      if (Date.now() - lastTouch.current < 7000) return
      goTo(Math.round(el.scrollLeft / el.clientWidth) + 1)
    }, 4500)
    return () => clearInterval(id)
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

      {/* Téléphone : bosse blanche + burger Why1 */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 z-20 h-48 overflow-hidden md:hidden">
        <div className="absolute right-1 top-24 w-[8.5rem]">
          <svg width="1" height="1" className="absolute left-1/2 top-0 overflow-visible">
            <path d={BUMP_PATH} fill="#fff" />
          </svg>

          <motion.img
            src={why1}
            alt="Burger gourmet déconstruit en lévitation"
            className="absolute left-0 top-0 block h-auto w-full -translate-y-1/2 drop-shadow-xl"
            initial={reduce ? false : { y: -24, opacity: 0, rotate: -6 }}
            whileInView={{ y: 0, opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 90, damping: 12 }}
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* Ordinateur : Why2 fixe en haut à droite + vapeur réajustée */}
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
          <SteamPlumes />
        </div>

        {/* En-tête de section */}
        <div className="max-w-2xl">
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tighter md:text-6xl">
            Pourquoi nos burgers ont ce goût unique ?
          </h2>
          <p className="mt-4 text-lg text-neutral-600 md:text-xl">
            On ne fait pas de la restauration rapide, on fait du bon. Des produits bruts, de la maîtrise et beaucoup d’amour.
          </p>
        </div>

        {/* Téléphone */}
        <div className="mt-12 sm:hidden">
          <FeatureCarousel items={features} reduce={reduce} />
        </div>

        {/* Grille des valeurs */}
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