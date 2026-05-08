import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const config = {
  success: {
    icon: CheckCircle2,
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  error: {
    icon: AlertTriangle,
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
}

const Alert = ({ type = 'info', message, onClose, actionLabel, onAction }) => {
  if (!message) return null

  const alertConfig = config[type] || config.info
  const Icon = alertConfig.icon

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-semibold ${alertConfig.className}`}>
      <Icon size={18} className='mt-0.5 shrink-0' />
      <span className='min-w-0 flex-1'>{message}</span>
      {actionLabel && onAction && (
        <button
          type='button'
          onClick={onAction}
          className='shrink-0 rounded-md bg-white/70 px-3 py-1 text-xs font-bold shadow-sm transition hover:bg-white'
        >
          {actionLabel}
        </button>
      )}
      {onClose && (
        <button
          type='button'
          onClick={onClose}
          className='rounded p-0.5 opacity-70 transition hover:opacity-100'
          aria-label='Dismiss alert'
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export default Alert
