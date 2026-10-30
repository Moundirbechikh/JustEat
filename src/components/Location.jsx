import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, Clock, Phone, Navigation, ArrowRight, Store } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Location() {
  const reduce = useReducedMotion()

  return (
    <section className="relative bg-[#C62F1D] px-5 pt-16 pb-20 text-white md:pt-20 md:pb-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        
        {/* Rappel du Concept : Minimaliste & Direct */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start justify-between gap-6 border-b border-t border-white/20 py-12 md:flex-row md:items-center"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 font-display text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              <Store size={14} />
              <span>Paiement sur place uniquement</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tighter text-white sm:text-4xl md:text-5xl">
              Commande en ligne. Règle à la caisse.
            </h2>
            <p className="mt-2 text-base text-white/90 sm:text-lg">
              Pas besoin de carte bancaire ni de création de compte. Tu choisis tes produits, tu valides ta commande et tu paies directement au comptoir lors du retrait.
            </p>
          </div>

          <Link
            to="/menu"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-8 py-4 font-display text-base font-bold text-[#C62F1D] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-neutral-900 hover:text-white"
          >
            <span>Passer commande</span>
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Ligne d'infos pratiques : Liens simples, icônes & texte épuré */}
        <div className="mt-12 grid grid-cols-1 gap-8 text-white sm:grid-cols-3">
          
          {/* Item 1 : Adresse & Maps */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
              <MapPin size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold tracking-tight text-white">
                Notre Adresse
              </h3>
              <p className="mt-1 text-sm text-white/80 leading-relaxed">
                Avenue Arzew (près de la Place d'Armes)<br />
                <strong>Oran, Algérie</strong>
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-display text-xs font-bold text-white/90 hover:text-white hover:underline"
              >
                <Navigation size={13} />
                <span>Itinéraire Google Maps →</span>
              </a>
            </div>
          </div>

          {/* Item 2 : Horaires */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
              <Clock size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold tracking-tight text-white">
                Horaires d'Ouverture
              </h3>
              <p className="mt-1 text-sm text-white/80 leading-relaxed">
                Sam - Jeu : <strong className="text-white">12h00 - 00h00</strong><br />
                Vendredi : <strong className="text-white">16h00 - 00h30</strong>
              </p>
            </div>
          </div>

          {/* Item 3 : Téléphone & Call Direct */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
              <Phone size={22} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold tracking-tight text-white">
                Contact
              </h3>
              <a
                href="tel:+213555123456"
                className="mt-1 block font-display text-xl font-bold text-white hover:underline"
              >
                +213 (0) 555 12 34 56
              </a>
              <span className="mt-1 block text-xs text-white/70">
                Ligne directe du restaurant
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}