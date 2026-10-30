import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import logo from '../assets/Logo1.png'

export default function Footer() {
  return (
    <footer className="bg-[#C62F1D] pt-14 pb-8 text-white border-t border-white/20">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        
        {/* Grille principale en ligne (3 colonnes sur grand écran) */}
        <div className="grid grid-cols-1 items-center gap-10 pb-6  md:grid-cols-3 text-center md:text-left">
          
          {/* 1. Colonne de gauche : Navigation & Bouton Commander */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <nav className="flex flex-wrap justify-center md:justify-start gap-6 font-display text-base font-bold text-white">
              <Link to="/" className="transition-opacity hover:opacity-80">Accueil</Link>
              <Link to="/menu" className="transition-opacity hover:opacity-80">Menu</Link>
              <Link to="/avis" className="transition-opacity hover:opacity-80">Avis</Link>
              <Link to="/suivi" className="transition-opacity hover:opacity-80">Suivi</Link>
            </nav>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-sm font-bold text-[#C62F1D] shadow-md transition-all hover:bg-neutral-900 hover:text-white"
            >
              <ShoppingBag size={16} />
              <span>Commander maintenant</span>
            </Link>
          </div>

          {/* 2. Colonne du milieu : Logo & Slogan */}
          <div className="flex flex-col items-center justify-center">
            <img 
              src={logo} 
              alt="Just Burgers Logo" 
              className="h-24 w-auto object-contain drop-shadow-md"
            />
            <p className="mt-2 text-lg text-white/ font-display">
              Smashé à la minute. Servi tout chaud.
            </p>
          </div>

          {/* 3. Colonne de droite : Concept & Retrouvez-nous */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-4">
            <p className="text-sm text-white/90 max-w-xs leading-relaxed">
              <strong className="text-white">Just Burgers • Oran</strong><br />
              Commande en ligne et paiement directement à la caisse lors du retrait.
            </p>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-white/80">Retrouvez-nous :</span>
              <div className="flex gap-2">
                {/* Instagram */}
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white hover:text-[#C62F1D]"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white hover:text-[#C62F1D]"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.37 14.5 5 15.5 5H18V0h-3.808C10.59 0 9 1.581 9 4.615V8z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>



      </div>
    </footer>
  )
}