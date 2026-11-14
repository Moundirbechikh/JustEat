import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { LogOut, Menu, ShieldCheck, Wifi, WifiOff, X } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

const tabs = [
  { to: '/admin/commandes', label: 'Commandes', end: true },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/admin/disponibilites', label: 'Disponibilités' },
  { to: '/admin/parametres', label: 'Réglages' },
]

export default function AdminLayout({ children }) {
  const { role, logout, isAuthenticated } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(null)
  const { pathname } = useLocation()
  const reduce = useReducedMotion()

  const activeTo = tabs.find((t) =>
    t.end ? pathname === t.to : pathname.startsWith(t.to)
  )?.to
  const pillTo = hovered ?? activeTo

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

  const handleLogout = () => {
    setOpen(false)
    logout()
  }

  return (
    <div className="min-h-screen w-full bg-[#F4EFEA] text-neutral-900 overflow-x-hidden">
      {/* ---------- Navbar Flottante collée au bord droit ---------- */}
      <header className="pointer-events-none fixed inset-x-0 top-5 z-50 md:top-6">
        <div className="pointer-events-auto font-display ml-auto flex h-12 w-fit items-center gap-2.5 rounded-l-full bg-[#C62F1D] pl-5 pr-2 shadow-lg shadow-black/15 lg:h-14 lg:gap-4 lg:pl-8 lg:pr-6">
          {/* Logo typographique Just Burgers + Badge Admin */}
          <Link
            to="/admin/commandes"
            onClick={() => setOpen(false)}
            className="mr-1 flex items-center gap-2.5 whitespace-nowrap lg:mr-4"
          >
            <span className="font-display text-xl font-extrabold leading-none tracking-tighter text-white lg:text-2xl">
              Just{' '}
              <span className="text-black [paint-order:stroke_fill] [stroke-linejoin:round] [-webkit-text-stroke:3px_white] lg:[-webkit-text-stroke:4px_white]">
                Burgers
              </span>
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-black/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white sm:inline-flex">
              <ShieldCheck size={12} className="text-[#F4A507]" />
              Admin
            </span>
          </Link>

          {/* Liens de navigation Ordinateur */}
          <nav
            className="hidden items-center lg:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {tabs.map(({ to, label, end }) => (
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
                    layoutId="admin-nav-pill"
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

          {/* Statut & Rôle (Desktop) */}
          <div className="hidden items-center gap-2 border-l border-white/20 pl-3 lg:flex">
            <span
              title={isAuthenticated ? 'Connecté en temps réel' : 'Déconnecté'}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                isAuthenticated
                  ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-300/40'
                  : 'bg-black/30 text-white/70'
              }`}
            >
              {isAuthenticated ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span className="hidden xl:inline">
                {isAuthenticated ? 'En ligne' : 'Hors ligne'}
              </span>
            </span>

            <span className="rounded-full bg-[#F4A507] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-neutral-900">
              {role || 'Admin'}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              title="Se déconnecter"
              className="group inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[0.85rem] font-bold text-[#C62F1D] transition hover:bg-neutral-900 hover:text-white"
            >
              <LogOut size={15} />
              <span className="hidden xl:inline">Déconnexion</span>
            </button>
          </div>

          {/* Indicateur statut rapide + Bouton Burger sur Mobile/Tablette */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <span
              aria-label={isAuthenticated ? 'Connecté' : 'Déconnecté'}
              className={`grid h-7 w-7 place-items-center rounded-full ${
                isAuthenticated
                  ? 'bg-emerald-500/25 text-emerald-200'
                  : 'bg-black/30 text-white/60'
              }`}
            >
              {isAuthenticated ? <Wifi size={14} /> : <WifiOff size={14} />}
            </span>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Fermer le menu admin' : 'Ouvrir le menu admin'}
              aria-expanded={open}
              aria-controls="admin-mobile-menu"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white transition hover:bg-white/15"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ---------- Menu Tiroir Mobile & Tablette ---------- */}
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="admin-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="pointer-events-auto fixed inset-0 -z-10 bg-black/40 backdrop-blur-[2px] lg:hidden"
              />
              <motion.nav
                key="admin-panel"
                id="admin-mobile-menu"
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 48 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="pointer-events-auto ml-auto mt-3 w-[min(86vw,21rem)] rounded-l-3xl bg-[#C62F1D] p-6 shadow-2xl shadow-black/25 lg:hidden font-display"
              >
                {/* En-tête du tiroir mobile : Rôle & Statut */}
                <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4A507] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                    <ShieldCheck size={14} />
                    {role || 'Admin'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      isAuthenticated
                        ? 'bg-emerald-500/20 text-emerald-100'
                        : 'bg-black/30 text-white/75'
                    }`}
                  >
                    {isAuthenticated ? <Wifi size={13} /> : <WifiOff size={13} />}
                    {isAuthenticated ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>

                {/* Liste des onglets */}
                <ul className="flex flex-col gap-1">
                  {tabs.map(({ to, label, end }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={end}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between rounded-xl px-3 py-3 text-2xl font-display font-bold tracking-tight text-white transition hover:translate-x-1 hover:bg-white/15 ${
                            isActive ? 'bg-white/20' : ''
                          }`
                        }
                      >
                        <span>{label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>

                {/* Bouton Déconnexion */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-base font-bold text-[#C62F1D] shadow-md transition hover:bg-neutral-900 hover:text-white"
                >
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* ---------- Contenu Principal (Plein écran sans marges contraintes) ---------- */}
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}