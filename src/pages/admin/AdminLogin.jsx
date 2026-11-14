import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!password.trim()) {
      setError('Saisis le mot de passe du personnel.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(password)
      navigate('/admin/commandes', { replace: true })
    } catch (err) {
      setError(err?.message || 'Connexion impossible.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F2EE] px-4 py-10 text-neutral-900">
      <div className="w-full max-w-md rounded-4xl border border-neutral-200 bg-white p-6 shadow-xl shadow-black/10">
        <div className="flex items-center justify-center gap-3 text-ketchup">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-ketchup/10">
            <LockKeyhole size={24} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Just Burgers</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tighter">Admin</h1>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <ShieldCheck size={16} className="text-ketchup" />
            Zone réservée au personnel
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-neutral-700">Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-2xl border-2 border-neutral-200 bg-white px-4 py-3 text-base outline-none transition focus:border-ketchup"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-full bg-ketchup px-5 py-3.5 text-base font-bold text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  )
}
