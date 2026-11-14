import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Armchair,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  ToggleRight,
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import burger from '../../assets/Logo1.png'

// Les trois outils présentés dans le panneau rouge (desktop)
const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Commandes en direct',
    text: 'Confirmer, préparer et servir sans quitter l’écran.',
  },
  {
    icon: Armchair,
    title: 'Tables',
    text: 'Voir qui attend, qui mange et qui doit payer.',
  },
  {
    icon: ToggleRight,
    title: 'Disponibilités',
    text: 'Une rupture ? Couper le produit en un geste.',
  },
]

// Même logo texte que la Navbar
function Wordmark({ className = '' }) {
  return (
    <span
      className={`font-display font-extrabold leading-none tracking-tighter text-white ${className}`}
    >
      Just{' '}
      <span className="text-black [paint-order:stroke_fill] [stroke-linejoin:round] [-webkit-text-stroke:3px_white] lg:[-webkit-text-stroke:4px_white]">
        Burgers
      </span>
    </span>
  )
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { login } = useAdminAuth()
  const inputRef = useRef(null)

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Titre de l'onglet
  useEffect(() => {
    const previous = document.title
    document.title = 'Espace équipe · Just Burgers'
    return () => {
      document.title = previous
    }
  }, [])

  // Focus automatique seulement sur grand écran (sur mobile, le clavier cacherait la page)
  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      inputRef.current?.focus()
    }
  }, [])

  const trackCapsLock = (event) =>
    setCapsLock(event.getModifierState?.('CapsLock') ?? false)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (loading) return

    if (!password.trim()) {
      setError('Le mot de passe est requis.')
      inputRef.current?.focus()
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(password)
      navigate('/admin/commandes', { replace: true })
    } catch (err) {
      setError(err?.message || 'Connexion impossible.')
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-[#F5F2EE] text-neutral-900 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- Panneau marque (bandeau sur mobile, colonne sur desktop) ---------- */}
      <aside className="relative isolate overflow-hidden rounded-b-[2.5rem] bg-[#C62F1D] px-6 pb-28 pt-8 text-white sm:px-10 sm:pt-10 lg:flex lg:min-h-dvh lg:flex-col lg:justify-between lg:rounded-b-none lg:rounded-r-[3rem] lg:px-14 lg:py-12">
        {/* Décors minimaux sans jaune */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-24 -z-10 h-72 w-72 rounded-full bg-white/10 blur-2xl"
        />
        <img
          src={burger}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute sm:bottom-4 bottom-20 right-4 h-16 w-auto object-contain opacity-90 sm:h-36 lg:h-28"
        />

        {/* Logo */}
        <div>
          <Wordmark className="text-4xl lg:text-5xl" />
          <p className="mt-1 font-display text-lg font-bold text-white/90 lg:hidden">
            Espace équipe
          </p>
        </div>

        {/* Message + outils (desktop) */}
        <div className="hidden -mt-15 lg:block">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 font-display text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <ShieldCheck size={14} />
            Espace équipe
          </span>
          <p className="mt-5 max-w-md font-display text-5xl font-extrabold leading-[1.05] tracking-tighter xl:text-6xl">
            Le service en un coup d’œil.
          </p>

          <ul className="mt-10 max-w-sm space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15">
                  <Icon size={22} />
                </span>
                <div>
                  <p className="font-display text-lg font-bold leading-tight">{title}</p>
                  <p className="mt-0.5 text-sm text-white/80">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="hidden text-sm font-semibold text-white/80 lg:block">
          Just Burgers · Oran
        </p>
      </aside>

      {/* ---------- Carte de connexion ---------- */}
      <section className="relative z-10 -mt-16 px-4 pb-10 sm:px-6 lg:mt-0 lg:flex lg:items-center lg:justify-center lg:px-12 lg:pb-0">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-md rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-2xl shadow-black/10 sm:p-8"
        >
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#C62F1D] text-white shadow-md shadow-[#C62F1D]/30">
              <LockKeyhole size={26} />
            </span>
            <div>
              <h1 className="font-display text-3xl font-extrabold leading-none tracking-tighter">
                Connexion
              </h1>
              <p className="mt-1 text-sm text-neutral-600">Accès réservé au personnel</p>
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate className="mt-8">
            <label htmlFor="admin-password" className="block text-sm font-bold text-neutral-800">
              Mot de passe
            </label>

            <div className="relative mt-2">
              <LockKeyhole
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                id="admin-password"
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (error) setError('')
                }}
                onKeyDown={trackCapsLock}
                onKeyUp={trackCapsLock}
                onBlur={() => setCapsLock(false)}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'admin-login-error' : undefined}
                className={`h-14 w-full rounded-2xl border-2 bg-white pl-11 pr-14 text-base outline-none transition placeholder:text-neutral-300 focus:border-[#C62F1D] ${
                  error ? 'border-[#C62F1D]' : 'border-neutral-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-[#C62F1D] focus-visible:outline-2 focus-visible:outline-[#C62F1D]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {capsLock && (
              <p className="mt-2 text-sm font-semibold text-amber-700">Verr. Maj. activé</p>
            )}

            {error && (
              <motion.p
                key={error}
                id="admin-login-error"
                role="alert"
                animate={reduce ? undefined : { x: [0, -8, 8, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
                className="mt-4 rounded-2xl bg-[#C62F1D]/10 px-4 py-3 text-sm font-semibold text-[#C62F1D]"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#C62F1D] px-6 font-display text-lg font-bold text-white shadow-lg shadow-[#C62F1D]/30 transition hover:bg-neutral-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Connexion…
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-neutral-100 pt-5 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-neutral-500">
              <ShieldCheck size={16} className="text-[#C62F1D]" />
              Zone sécurisée
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-bold text-neutral-700 transition hover:text-[#C62F1D]"
            >
              <ArrowLeft size={16} />
              Retour au site
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  )
}