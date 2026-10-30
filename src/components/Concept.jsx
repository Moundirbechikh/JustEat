import { motion, useReducedMotion } from 'framer-motion'
import { Flame, Utensils, Clock, HeartHandshake } from 'lucide-react'

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

export default function Concept() {
  const reduce = useReducedMotion()

  return (
    <section className="relative bg-white px-5 py-20 text-neutral-900 md:py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        
        {/* En-tête de section */}
        <div className="max-w-2xl">
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tighter md:text-6xl">
            Pourquoi nos burgers ont ce goût unique ?
          </h2>
          <p className="mt-4 text-lg text-neutral-600 md:text-xl">
            On ne fait pas de la restauration rapide, on fait du bon. Des produits bruts, de la maîtrise et beaucoup d’amour.
          </p>
        </div>

        {/* Grille des valeurs */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col rounded-[2rem] border-2 border-[#C62F1D] p-8 transition-all duration-300 hover:bg-[#C62F1D] hover:text-white hover:shadow-xl hover:shadow-[#C62F1D]/20"
              >
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
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}