import { motion, useReducedMotion } from 'framer-motion'
import { Star, MessageSquarePlus, Quote } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '../assets/Logo1.png'

const reviewsData = [
  {
    id: 1,
    name: 'Mehdi K.',
    city: 'Oran',
    rating: 5,
    comment: "Franchement le meilleur smash burger de la ville ! La croûte sur la viande est incroyable et le pain brioché est hyper moelleux. En plus c'est prêt super vite.",
    date: 'Il y a 3 jours',
  },
  {
    id: 2,
    name: 'Amine Z.',
    city: 'Bir El Djir',
    rating: 5,
    comment: "Le concept de commander en ligne et de payer sur place est top, zéro prise de tête. Le double smash est une tuerie absolue, je recommande à 100% !",
    date: 'Il y a une semaine',
  },
  {
    id: 3,
    name: 'Yasmine B.',
    city: 'Oran',
    rating: 5,
    comment: "Super accueil à la caisse et burgers ultra chauds servis à la minute. Les frites dorées et les onion rings croustillants, un régal. Bravo l'équipe !",
    date: 'Il y a 2 semaines',
  },
]

export default function Reviews() {
  const reduce = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-[#C62F1D] px-5 py-16 text-white md:pt-24 md:pb-8 lg:px-10">
      
      {/* --- Effet Croc Fixe & Ultra-Réaliste (Sans transition, affiché directement) --- */}
      <div className="absolute right-0 top-0 z-20 pointer-events-none w-52 sm:w-72 md:w-96 lg:w-[26rem]">
        <svg
          viewBox="0 0 350 210"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto drop-shadow-2xl"
        >
          {/* Forme de morsure principale (creux profonds et réalistes) */}
          <path
            d="M 350 0 
               L 90 0 
               C 98 14, 110 25, 122 38 
               C 134 50, 130 68, 146 82 
               C 158 92, 156 112, 175 124 
               C 190 134, 204 142, 225 148 
               C 242 153, 260 166, 282 158 
               C 300 151, 318 168, 342 158 
               C 347 156, 350 145, 350 135 
               Z"
            fill="#FFFFFF"
          />
          {/* Traces de dents marquées et ciselées pour un réalisme absolu */}
          <path
            d="M 96 2 
               C 105 22, 116 32, 122 38 
               M 130 46 
               C 138 58, 142 72, 148 78 
               M 156 88 
               C 166 98, 176 110, 188 118 
               M 200 128 
               C 214 136, 226 144, 240 148 
               M 256 153, 274 158"
            stroke="#24160F"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.18"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* En-tête de section */}
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-extrabold tracking-tighter text-white sm:text-5xl md:text-6xl">
            Ce qu'en disent les gourmands
          </h2>
          <p className="mt-4 text-base text-white/90 sm:text-lg md:text-xl">
            Goûté, validé et adoré. Voici les retours de nos clients après un passage chez Just Burgers.
          </p>
        </div>

        {/* Grille des cartes d'avis */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviewsData.map((review, i) => (
            <motion.div
              key={review.id}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.4,
                delay: i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative flex flex-col justify-between rounded-[2rem] bg-white p-7 text-neutral-900 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div>
                {/* Étoiles dorées + Icône guillemet */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-[#F4A507]">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <Quote size={26} className="text-[#C62F1D]/20 transition-colors duration-300 group-hover:text-[#C62F1D]/40" />
                </div>

                {/* Commentaire */}
                <p className="mt-5 text-base leading-relaxed text-neutral-700">
                  "{review.comment}"
                </p>
              </div>

              {/* Pied de carte */}
              <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-4">
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight text-neutral-900">
                    {review.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Client à {review.city}
                  </p>
                </div>
                <span className="text-xs font-medium text-neutral-400">
                  {review.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bouton d'action centré */}
        <div className="mt-12 flex justify-center">
          <Link
            to="/avis"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-display text-base font-bold tracking-tight text-[#C62F1D] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-neutral-900 hover:text-white"
          >
            <MessageSquarePlus size={20} />
            <span>Donner mon avis</span>
          </Link>
        </div>

      </div>

      {/* --- Logo positionné en bas à droite de la section rouge --- */}
      <div className="absolute bottom-0 right-9 z-20 w-16 sm:w-20 md:w-36 opacity-90 pointer-events-none drop-shadow-md">
        <img 
          src={logo} 
          alt="Just Burgers Logo" 
          className="w-full h-auto object-contain"
        />
      </div>

    </section>
  )
}