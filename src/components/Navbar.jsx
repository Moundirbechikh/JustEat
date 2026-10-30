import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Menu, Star, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/avis', label: 'Avis', icon: Star },
  { to: '/suivi', label: 'Ma commande' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(null)
  const { pathname } = useLocation()
  const reduce = useReducedMotion()

  // Lien de la page active
  const activeTo = links.find((l) =>
    l.end ? pathname === l.to : pathname.startsWith(l.to)
  )?.to
  // La pastille suit la souris, sinon reste sur la page active
  const pillTo = hovered ?? activeTo

  // Échap pour fermer + blocage du scroll quand le menu est ouvert
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-5 z-50 md:top-6">
      {/* Bande rouge, collée à droite, arrondie à gauche */}
      <div className="pointer-events-auto font-display ml-auto flex h-12 w-fit items-center gap-3 rounded-l-full bg-[#C62F1D] pl-5 pr-2 shadow-lg shadow-black/15 lg:h-14 lg:gap-4 lg:pl-8 lg:pr-8">

        {/* Nom du restaurant, tout à gauche de la bande */}
{/* Nom du restaurant, tout à gauche de la bande */}
<Link
  to="/"
  onClick={() => setOpen(false)}
  className="font-display mr-1 whitespace-nowrap text-xl font-extrabold leading-none tracking-tighter text-white lg:mr-6 lg:text-2xl"
>
  Just{' '}
  <span className="text-black [paint-order:stroke_fill] [stroke-linejoin:round] [-webkit-text-stroke:3px_white] lg:[-webkit-text-stroke:4px_white]">
    Burgers
  </span>
</Link>

        {/* Liens ordinateur */}
        <nav
          className="hidden items-center lg:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onMouseEnter={() => setHovered(to)}
              onFocus={() => setHovered(to)}
              onBlur={() => setHovered(null)}
              className="relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[0.9rem] font-semibold text-white"
            >
              {pillTo === to && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full bg-white/20"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 420, damping: 34 }
                  }
                />
              )}
              <span className="relative">{label}</span>
            </NavLink>
          ))}
        </nav>

        <Link
          to="/menu"
          className="group hidden items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[0.9rem] font-bold text-[#C62F1D] transition hover:bg-neutral-900 hover:text-white lg:inline-flex"
        >
          Commander
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>

        {/* Trois lignes téléphone */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white transition hover:bg-white/15 lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu téléphone */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="pointer-events-auto fixed inset-0 -z-10 bg-black/40 lg:hidden"
            />

            <motion.nav
              key="panel"
              id="mobile-menu"
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 48 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="pointer-events-auto ml-auto mt-3 w-[min(86vw,20rem)] rounded-l-3xl bg-[#C62F1D] p-6 shadow-xl shadow-black/20 lg:hidden font-display"
            >
              <ul className="flex flex-col gap-1">
                {links.map(({ to, label, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 rounded-xl px-3 py-3 text-2xl font-display font-bold text-white tracking-tight transition hover:translate-x-1 hover:bg-white/15 ${
                          isActive ? 'bg-white/15' : ''
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <Link
                to="/menu"
                onClick={() => setOpen(false)}
                className="mt-5 block rounded-full bg-white py-3.5 text-center text-lg font-bold text-[#C62F1D] transition hover:bg-neutral-900 hover:text-white"
              >
                Commander maintenant
              </Link>

              <p className="mt-4 text-center text-sm text-white/80">
                Paiement sur place
              </p>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}