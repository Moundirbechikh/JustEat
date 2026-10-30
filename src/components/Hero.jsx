import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import mainBurger from '../assets/MainBurger.png'
import secondBurger from '../assets/SecondBurger.png'
import thirdBurger from '../assets/ThirdBurger.png'
import SauceEdge from './SauceEdge'

const burgers = [
  { src: mainBurger, alt: 'Double smash burger au cheddar fondant' },
  { src: secondBurger, alt: 'Smash burger signature' },
  { src: thirdBurger, alt: 'Burger de la maison' },
]

export default function Hero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    burgers.forEach((b) => {
      const img = new Image()
      img.src = b.src
    })
  }, [])

  useEffect(() => {
    if (reduce) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % burgers.length), 5000)
    return () => clearTimeout(id)
  }, [index, reduce])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 6])

  return (
    <section
      ref={ref}
      className="relative flex h-svh min-h-[560px] flex-col overflow-hidden bg-white text-neutral-900"
    >
      <div className="mx-auto grid min-h-0 w-full max-w-[96rem] flex-1 grid-rows-[auto_1fr] gap-2 px-5 pb-10 pt-20 md:grid-cols-[minmax(0,60fr)_minmax(0,40fr)] md:grid-rows-1 md:items-center md:gap-6 md:pb-14 lg:px-10">

        {/* Texte (60 %) */}
        <div className="@container relative z-10">
          <h1 className="text-[length:min(12.5vw,10vh)] font-extrabold leading-[0.92] tracking-tighter md:text-[length:min(17cqw,13vh)] lg:text-[length:min(11.2cqw,15vh)]">
            <span className="block lg:inline">Smashé </span>
            <span className="block lg:inline">à la minute.</span>
            <br className="hidden lg:block" />
            <span className="block lg:inline"> Servi </span>
            <span className="block lg:inline">tout chaud.</span>
          </h1>

          <p className="mt-5 hidden max-w-xl text-base text-neutral-700 sm:block lg:text-xl">
            Des burgers écrasés sur la plancha, du pain brioche toasté
            et des frites dorées. Commande en ligne, paye à la caisse.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-4 md:mt-7">
            <Link
              to="/menu"
              className="rounded-full bg-[#C62F1D] px-6 py-3 text-base font-bold text-white shadow-lg transition hover:scale-105 hover:bg-neutral-900 md:px-8 md:py-4 md:text-lg"
            >
              Commander maintenant
            </Link>
            <Link
              to="/menu"
              className="font-bold underline underline-offset-4 hover:text-[#C62F1D]"
            >
              Voir le menu
            </Link>
          </div>

          <p className="mt-5 hidden text-sm font-medium text-neutral-600 md:block">
            Paiement sur place. Pas de compte à créer.
          </p>
        </div>

        {/* Visuel (40 %) */}
        <div className="flex h-full min-h-0 flex-col">
          <div className="@container relative flex min-h-0 flex-1 items-center justify-center">
            {/* « Just Burgers » en filigrane, derrière le burger */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center text-center font-display font-extrabold leading-[0.82] tracking-tighter text-neutral-200/80 text-[length:min(26cqw,30vh)]"
            >
              <span>Just</span>
              <span>Burgers</span>
            </div>

            {/* Ombre au sol */}
            <div className="absolute bottom-[5%] h-5 w-1/2 rounded-full bg-black/25 blur-xl" />

            <motion.div
              style={{ y, rotate }}
              className="relative flex h-full w-full items-center justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={index}
                  src={burgers[index].src}
                  alt={burgers[index].alt}
                  fetchPriority="high"
                  className="h-full max-h-full w-auto max-w-full object-contain drop-shadow-2xl"
                  initial={reduce ? false : { y: -100, opacity: 0, rotate: -6 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{
                    y: 60,
                    opacity: 0,
                    rotate: 6,
                    transition: { duration: 0.3 },
                  }}
                  transition={{ type: 'spring', stiffness: 90, damping: 12 }}
                />
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="mt-2 flex justify-center gap-2">
            {burgers.map((b, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Afficher le burger ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? 'w-8 bg-neutral-900' : 'w-2.5 bg-neutral-300 hover:bg-neutral-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Forme rouge avec sauce et fromage qui coulent */}
      <SauceEdge />
    </section>
  )
}