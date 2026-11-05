const nf = new Intl.NumberFormat('fr-FR')

// 1250 -> "1 250 DA"
export const formatPrice = (n) => `${nf.format(n)} DA`
