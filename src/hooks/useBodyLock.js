import { useEffect } from 'react'

// Bloque le scroll de la page tant qu'un panneau (tiroir, fenêtre) est ouvert
export default function useBodyLock(locked) {
  useEffect(() => {
    if (!locked) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}
