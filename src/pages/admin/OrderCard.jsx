import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChefHat,
  Clock3,
  Flame,
  MessageSquareText,
  Phone,
  Receipt,
  Sparkles,
  Store,
  UserRound,
  Utensils,
  XCircle,
} from 'lucide-react'

const STATUS_META = {
  'À confirmer': {
    badge: 'bg-[#F4A507] text-neutral-900',
    icon: Clock3,
  },
  'En préparation': {
    badge: 'bg-[#C62F1D] text-white',
    icon: Flame,
  },
  'Prête': {
    badge: 'bg-emerald-600 text-white',
    icon: CheckCircle2,
  },
  'Servie': {
    badge: 'bg-neutral-900 text-white',
    icon: ChefHat,
  },
  'Refusée': {
    badge: 'bg-red-700 text-white',
    icon: XCircle,
  },
  'Annulée': {
    badge: 'bg-neutral-500 text-white',
    icon: XCircle,
  },
}

function formatElapsed(createdAt) {
  if (!createdAt) return '—'
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) return `${hours}h ${mins}m`
  return `${minutes} min`
}

export default function OrderCard({
  order,
  onStatusChange,
  onPaidChange,
  onRefuse,
  loadingAction,
  adminRole,
  isNew = false,
}) {
  const total = Number(order.total || 0)
  const isOverdue =
    order.status === 'À confirmer' &&
    order.created_at &&
    Date.now() - new Date(order.created_at).getTime() > 1000 * 60 * Number(order.confirmAlertMinutes || 3)

  const items = Array.isArray(order.items) ? order.items : []
  const isOnline = order.source === 'online'
  const customerLabel = isOnline ? order.name || 'Client en ligne' : `Table ${order.table || '-'}`
  const meta = STATUS_META[order.status] || { badge: 'bg-neutral-200 text-neutral-800', icon: Clock3 }
  const StatusIcon = meta.icon
  const canTogglePaid =
    loadingAction !== `${order.orderId}-paid` && (adminRole === 'staff' || adminRole === 'manager')

  return (
    <article
      className={`group relative flex h-full flex-col justify-between rounded-[1.75rem] sm:rounded-[2rem] border-2 bg-white p-3.5 sm:p-6 text-neutral-900 shadow-xl shadow-black/15 transition-all duration-300 ${
        isOverdue
          ? 'border-[#F4A507] ring-4 ring-[#F4A507]/40'
          : isNew
            ? 'border-[#F4A507] ring-4 ring-white/40'
            : 'border-white hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* ---------- En-tête de la carte ---------- */}
        <div className="flex items-start justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Icône carrée rouge arrondie plus compacte sur mobile */}
            <div className="grid h-11 w-11 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-xl sm:rounded-2xl bg-[#C62F1D] text-white shadow-md">
              {isOnline ? <Store size={22} className="sm:w-[26px] sm:h-[26px]" strokeWidth={2.4} /> : <Utensils size={22} className="sm:w-[26px] sm:h-[26px]" strokeWidth={2.4} />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold leading-none tracking-tighter text-neutral-900">
                  {order.orderId}
                </h3>

                {isNew && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F4A507] px-2 py-0.5 font-display text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-neutral-900">
                    <Sparkles size={10} />
                    Nouveau
                  </span>
                )}

                {order.revision > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-display text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                    Modifiée
                  </span>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-neutral-600 md:text-sm">
                <span className="inline-flex items-center gap-1 text-neutral-900">
                  <UserRound size={12} className="sm:w-3.5 sm:h-3.5 text-[#C62F1D]" strokeWidth={2.5} />
                  {customerLabel}
                </span>

                <span className="text-neutral-300">•</span>

                <span className="inline-flex items-center gap-1 text-neutral-600">
                  <Clock3 size={12} className="sm:w-[13px] sm:h-[13px] text-[#C62F1D]" strokeWidth={2.5} />
                  {formatElapsed(order.created_at)}
                </span>

                {order.phone && (
                  <>
                    <span className="text-neutral-300">•</span>
                    <a
                      href={`tel:${order.phone}`}
                      className="inline-flex items-center gap-1 font-extrabold text-[#C62F1D] underline decoration-[#C62F1D]/40 underline-offset-2 hover:text-neutral-900"
                    >
                      <Phone size={12} strokeWidth={2.5} />
                      {order.phone}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Badge de statut */}
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 sm:px-3.5 sm:py-1.5 font-display text-[11px] sm:text-xs font-extrabold shadow-sm ${meta.badge}`}
          >
            <StatusIcon size={12} className="sm:w-3.5 sm:h-3.5" strokeWidth={2.5} />
            <span>{order.status}</span>
          </span>
        </div>

        {/* Alerte retard de confirmation */}
        {isOverdue && (
          <div className="mt-3 flex items-center gap-2 rounded-xl sm:rounded-2xl bg-[#F4A507]/20 px-3 py-2 sm:px-3.5 sm:py-2.5 text-[11px] sm:text-xs font-extrabold text-neutral-900">
            <AlertTriangle size={14} className="shrink-0 text-[#C62F1D]" strokeWidth={2.5} />
            <span>En attente depuis + de {order.confirmAlertMinutes || 3} min</span>
          </div>
        )}

        {/* ---------- Liste des articles commandés (compacte sur phone) ---------- */}
        <div className="mt-3 sm:mt-5 space-y-2 sm:space-y-2.5">
          {items.map((item, index) => (
            <div
              key={`${order.orderId}-${index}`}
              className="rounded-xl sm:rounded-2xl border border-black/10 bg-neutral-50 p-2.5 sm:p-3.5 transition hover:border-[#C62F1D]/40 hover:bg-white"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <span className="grid h-6 sm:h-7 min-w-6 sm:min-w-7 place-items-center rounded-lg sm:rounded-xl bg-[#C62F1D]/10 px-1 font-display text-xs font-extrabold text-[#C62F1D]">
                    {item.qty}×
                  </span>
                  <p className="font-display text-sm sm:text-base font-extrabold tracking-tight text-neutral-900">
                    {item.name || item.id}
                  </p>
                </div>
                {item.unitPrice ? (
                  <span className="whitespace-nowrap font-display text-xs sm:text-sm font-extrabold text-[#C62F1D]">
                    {item.unitPrice} DA
                  </span>
                ) : null}
              </div>

              {(item.variant || (Array.isArray(item.options) && item.options.length > 0)) && (
                <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1 pl-7 sm:pl-9">
                  {item.variant && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] sm:text-xs font-bold text-neutral-700 ring-1 ring-black/10">
                      {item.variant}
                    </span>
                  )}
                  {Array.isArray(item.options) &&
                    item.options.map((opt, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-[#C62F1D]/10 px-2 py-0.5 text-[11px] sm:text-xs font-bold text-[#C62F1D]"
                      >
                        + {opt}
                      </span>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ---------- Remarque client ---------- */}
        {order.note && (
          <div className="mt-3 sm:mt-4 flex items-start gap-2 rounded-xl sm:rounded-2xl border-2 border-[#F4A507]/60 bg-[#F4A507]/15 p-3 text-xs sm:text-sm text-neutral-900">
            <MessageSquareText size={16} className="mt-0.5 shrink-0 text-[#C62F1D]" strokeWidth={2.4} />
            <div>
              <p className="font-display text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-[#C62F1D]">
                Note du client
              </p>
              <p className="mt-0.5 text-xs sm:text-sm font-medium leading-snug">{order.note}</p>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Pied de carte : Total + Encaissement + Actions ---------- */}
      <div className="mt-3 sm:mt-5 border-t border-neutral-200 pt-3 sm:pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-neutral-500">Total commande</p>
            <p className="font-display text-2xl sm:text-3xl font-extrabold tracking-tighter text-[#C62F1D]">
              {total} DA
            </p>
          </div>

          <button
            type="button"
            disabled={!canTogglePaid}
            onClick={() => onPaidChange(order.orderId, !order.paid)}
            className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 font-display text-[11px] sm:text-xs font-extrabold transition ${
              order.paid
                ? 'bg-emerald-600 text-white shadow-sm'
                : order.status === 'Servie'
                  ? 'bg-[#F4A507] text-neutral-900 shadow-sm hover:scale-105'
                  : 'border-2 border-black/10 bg-neutral-50 text-neutral-700 hover:border-[#C62F1D]'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span
              className={`grid h-4 w-4 sm:h-5 sm:w-5 place-items-center rounded-full ${
                order.paid ? 'bg-white text-emerald-600' : 'bg-black/10 text-neutral-700'
              }`}
            >
              {order.paid ? <Check size={10} className="sm:w-3 sm:h-3" strokeWidth={3} /> : <Receipt size={10} className="sm:w-3 sm:h-3" strokeWidth={2.5} />}
            </span>
            <span>{order.paid ? 'Payée' : 'Non payée'}</span>
          </button>
        </div>

        {/* Boutons d'action principaux */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
          {order.status === 'À confirmer' && (
            <>
              <button
                type="button"
                disabled={loadingAction === `${order.orderId}-confirm`}
                onClick={() => onStatusChange(order.orderId, 'En préparation')}
                className="inline-flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-[#C62F1D] px-4 py-2.5 sm:px-5 sm:py-3 font-display text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:bg-neutral-900 disabled:opacity-60"
              >
                <Flame size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
                <span>Confirmer & lancer</span>
              </button>
              <button
                type="button"
                disabled={loadingAction === `${order.orderId}-refuse`}
                onClick={() => onRefuse(order.orderId)}
                className="inline-flex items-center justify-center gap-1 rounded-full border-2 border-black/10 bg-neutral-50 px-3 py-2.5 sm:px-4 sm:py-3 font-display text-xs sm:text-sm font-extrabold text-neutral-700 transition hover:border-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
              >
                <XCircle size={14} className="sm:w-4 sm:h-4" strokeWidth={2.5} />
                <span>Refuser</span>
              </button>
            </>
          )}

          {order.status === 'En préparation' && (
            <button
              type="button"
              disabled={loadingAction === `${order.orderId}-ready`}
              onClick={() => onStatusChange(order.orderId, 'Prête')}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 sm:px-5 sm:py-3 font-display text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:bg-neutral-900 disabled:opacity-60"
            >
              <CheckCircle2 size={15} strokeWidth={2.5} />
              <span>Marquer prête</span>
            </button>
          )}

          {order.status === 'Prête' && (
            <button
              type="button"
              disabled={loadingAction === `${order.orderId}-served`}
              onClick={() => onStatusChange(order.orderId, 'Servie')}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 sm:px-5 sm:py-3 font-display text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:bg-[#C62F1D] disabled:opacity-60"
            >
              <ChefHat size={15} strokeWidth={2.5} />
              <span>Marquer servie</span>
            </button>
          )}

          {['À confirmer', 'En préparation', 'Prête'].includes(order.status) && (
            <button
              type="button"
              disabled={loadingAction === `${order.orderId}-cancel`}
              onClick={() => onStatusChange(order.orderId, 'Annulée')}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-black/10 bg-neutral-50 px-3.5 py-2.5 sm:px-4 sm:py-3 font-display text-xs sm:text-sm font-bold text-neutral-600 transition hover:border-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </article>
  )
}