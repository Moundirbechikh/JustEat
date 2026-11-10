import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchMenu } from '../services/api'
import { FALLBACK_MENU, normalizeMenu } from '../data/menu'

const CACHE_KEY = 'jb_menu_cache'
const MenuContext = createContext(null)

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function MenuProvider({ children }) {
  // Affichage immédiat : dernier menu connu (cache), sinon menu de secours
  const [state, setState] = useState(() => {
    const cached = readCache()
    return cached
      ? { raw: cached, source: 'cache' }
      : { raw: FALLBACK_MENU, source: 'fallback' }
  })
  const [status, setStatus] = useState('loading') // loading | ready | offline

  useEffect(() => {
    let cancelled = false
    fetchMenu()
      .then((data) => {
        if (cancelled) return
        console.info('[Menu] Données lues depuis le Google Sheet', data)
        setState({ raw: data, source: 'sheet' })
        setStatus('ready')
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data))
        } catch {
          /* ignoré */
        }
      })
      .catch((err) => {
        console.warn('[Menu] Sheet injoignable, affichage actuel conservé.', err)
        if (!cancelled) setStatus('offline')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(() => {
    const { products, options } = normalizeMenu(state.raw)
    return {
      products: products.filter((p) => p.available),
      options,
      status,
      source: state.source, // 'sheet' | 'cache' | 'fallback'
    }
  }, [state, status])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu() {
  const ctx = useContext(MenuContext)
  if (!ctx) throw new Error('useMenu doit être utilisé dans <MenuProvider>')
  return ctx
}