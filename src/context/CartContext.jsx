import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'jb_cart_v2'
const MAX_QTY = 20

const CartContext = createContext(null)

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [open, setOpen] = useState(false)
  const [table, setTable] = useState(null)

  // Le panier survit à un rafraîchissement de la page
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* stockage indisponible : on continue sans */
    }
  }, [items])

  // line = { productId, name, variant, options: [{id, name, price}], basePrice, qty }
  const addLines = useCallback((lines) => {
    setItems((prev) => {
      const next = [...prev]
      for (const line of lines) {
        const options = line.options || []
        const optionIds = options.map((o) => o.id).sort()
        const key = `${line.productId}|${line.variant || ''}|${optionIds.join(',')}`
        const unitPrice = line.basePrice + options.reduce((s, o) => s + o.price, 0)
        const index = next.findIndex((i) => i.key === key)
        if (index >= 0) {
          next[index] = { ...next[index], qty: Math.min(next[index].qty + line.qty, MAX_QTY) }
        } else {
          next.push({
            key,
            productId: line.productId,
            name: line.name,
            variant: line.variant || '',
            options,
            unitPrice,
            qty: Math.min(line.qty, MAX_QTY),
          })
        }
      }
      return next
    })
  }, [])

  const setQty = useCallback((key, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, MAX_QTY) } : i))
    )
  }, [])

  const removeLine = useCallback((key) => {
    setItems((prev) => prev.filter((i) => i.key !== key))
  }, [])

  const clear = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setOpen(true), [])
  const closeCart = useCallback(() => setOpen(false), [])

  const value = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0)
    const total = items.reduce((s, i) => s + i.qty * i.unitPrice, 0)
    return { items, count, total, open, table, setTable, addLines, setQty, removeLine, clear, openCart, closeCart }
  }, [items, open, table, addLines, setQty, removeLine, clear, openCart, closeCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>')
  return ctx
}
