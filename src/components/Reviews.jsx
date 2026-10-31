import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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
  const [currentIndex, setCurrentIndex] = useState(0)

  // Rotation automatique toutes les 5 secondes pour la version téléphone
  useEffect(() => {
    if (reduce) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviewsData.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [reduce])

  // Sélection des 2 avis à afficher en boucle pour le mobile
  const mobileReview1 = reviewsData[currentIndex]
  const mobileReview2 = reviewsData[(currentIndex + 1) % reviewsData.length]

  return (
    <section className="relative overflow-hidden bg-[#C62F1D] px-5 py-16 text-white md:pt-24 md:pb-8 lg:px-10">
      
      {/* --- Effet Croc Fixe & Ultra-Réaliste --- */}
      <div className="absolute right-0 top-0 z-20 pointer-events-none w-52 sm:w-72 md:w-96 lg:w-[26rem]">
        <svg
          viewBox="0 0 350 210"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto drop-shadow-2xl"
        >
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

        {/* --- VERSION MOBILE : Affichage dynamique de 2 avis en alternance (toutes les 5s) --- */}
        <div className="mt-12 sm:hidden flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {[mobileReview1, mobileReview2].map((review, idx) => (
              <motion.div
                key={`${review.id}-${currentIndex}`}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col justify-between rounded-[2rem] bg-white p-7 text-neutral-900 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-[#F4A507]">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ))}
                    </div>
                    <Quote size={26} className="text-[#C62F1D]/20" />
                  </div>

                  <p className="mt-5 text-base leading-relaxed text-neutral-700">
                    "{review.comment}"
                  </p>
                </div>

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
          </AnimatePresence>

          {/* Indicateurs de pagination mobile */}
          <div className="flex justify-center gap-2 mt-2">
            {reviewsData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
                aria-label={`Aller à l'avis ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* --- VERSION TABLETTE / DESKTOP : Grille classique complète --- */}
        <div className="mt-12 hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-[#F4A507]">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <Quote size={26} className="text-[#C62F1D]/20 transition-colors duration-300 group-hover:text-[#C62F1D]/40" />
                </div>

                <p className="mt-5 text-base leading-relaxed text-neutral-700">
                  "{review.comment}"
                </p>
              </div>

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