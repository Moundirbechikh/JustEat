// Les 10 tables du restaurant sont numérotées de 1 à 10
export const TABLE_RE = /^(?:[1-9]|10)$/

// Le script Google renvoie « T3 » : on utilise « 3 » dans les URLs et à l'écran
export function tableNumber(value) {
  return String(value ?? '')
    .trim()
    .replace(/^table\s*/i, '')
    .replace(/^T/i, '')
}