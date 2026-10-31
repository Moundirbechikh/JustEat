import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import mainBurger from '../assets/MainBurger.png'
import secondBurger from '../assets/SecondBurger.png'
import thirdBurger from '../assets/ThirdBurger.png'
import logo from '../assets/Logo1.png'

// Exemples à remplacer par tes vrais produits et prix
const burgers = [
  {
    name: 'Double Smash',
    desc: 'Deux steaks écrasés, cheddar fondant, oignons caramélisés, cornichons et sauce maison.',
    price: 900,
    img: mainBurger,
    tag: 'Le préféré de la maison',
  },
  {
    name: 'Crispy Chicken',
    desc: 'Poulet croustillant, cheddar, salade, tomate, oignon rouge et sauce crémeuse.',
    price: 800,
    img: secondBurger,
  },
  {
    name: 'Signature',
    desc: 'La recette de la maison : steak smashé, fromage fondant, salade et sauce signature.',
    price: 950,
    img: thirdBurger,
    tag: 'Nouveau',
  },
]

const sides = [
  { name: 'Frites', price: 250 },
  { name: 'Nuggets (6 pièces)', price: 450 },
  { name: 'Onion rings', price: 350 },
  { name: 'Boissons', price: 150 },
  { name: 'Sauce en plus', price: 50 },
]

export default function MiniMenu() {
  const reduce = useReducedMotion()

  return (
    // pb-28 sur téléphone : laisse la place à la bosse blanche et au burger de la section suivante
    <section className="relative -mt-0.5 bg-[#C62F1D] px-5 pb-28 pt-16 text-white md:pb-24 md:pt-24 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* En-tête : Titre à gauche et Logo/Texte personnalisé à droite */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          
          {/* Titre & Description */}
          <div className="max-w-2xl">
            <h2 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl">
              Notre carte
            </h2>
            <p className="mt-4 text-lg text-white/85 md:text-xl">
              Smashés à la minute, servis tout chauds. Choisis ton burger,
              commande, et paye à la caisse.
            </p>
          </div>

          {/* Logo personnalisé : image seule, conservant la même zone à droite */}
          <div className="flex justify-end">
            <div className="flex w-fit flex-col items-center">
              <img
                src={logo}
                alt="Logo Just Burgers"
                className="h-16 w-auto object-contain drop-shadow-md md:h-30"
              />
            </div>
          </div>

        </div>

        {/* Burgers */}
        <div className="mt-6 grid grid-cols-1 gap-x-6 md:grid-cols-3">
          {burgers.map((b, i) => (
            <motion.article
              key={b.name}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative mt-24 flex flex-col rounded-[2rem] bg-white p-6 pt-0 text-neutral-900 shadow-xl shadow-black/20"
            >
              {b.tag && (
                <span className="absolute right-4 top-4 rounded-full bg-[#F4A507] px-3 py-1 text-xs font-bold text-neutral-900">
                  {b.tag}
                </span>
              )}

              {/* La photo dépasse du haut de la carte */}
              <img
                src={b.img}
                alt={b.name}
                loading="lazy"
                className="relative -mt-20 mx-auto h-44 w-auto object-contain drop-shadow-2xl transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105"
              />

              <div className="mt-4 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl font-extrabold tracking-tighter">
                  {b.name}
                </h3>
                <span className="whitespace-nowrap text-xl font-extrabold text-[#C62F1D]">
                  {b.price} DA
                </span>
              </div>

              <p className="mt-2 text-neutral-600">{b.desc}</p>

              <Link
                to="/menu"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#C62F1D] py-3 pt-3 font-bold text-white transition hover:bg-neutral-900 [&]:mt-5"
              >
                Commander
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Compléments */}
        <div className="mt-16 md:mt-20">
          <h3 className="font-display text-2xl font-extrabold tracking-tighter md:text-3xl">
            Pour accompagner
          </h3>
          <ul className="mt-5 flex flex-wrap gap-3">
            {sides.map((s) => (
              <li
                key={s.name}
                className="rounded-full border-2 border-white/40 px-5 py-2.5 font-semibold transition hover:bg-white/10"
              >
                {s.name}
                <span className="ml-2 font-extrabold text-[#FFD27A]">{s.price} DA</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Appel à l'action */}
        <div className="mt-14 flex justify-center md:mt-16">
          <Link
            to="/menu"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#C62F1D] shadow-lg transition hover:scale-105 hover:bg-neutral-900 hover:text-white"
          >
            Voir tout le menu
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}