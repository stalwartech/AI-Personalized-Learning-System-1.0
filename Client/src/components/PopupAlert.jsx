import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const POPUP_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-500/10',
    iconClass: 'text-emerald-400',
    button: 'bg-emerald-600 hover:bg-emerald-500',
  },
  error: {
    icon: XCircle,
    iconBg: 'bg-red-500/10',
    iconClass: 'text-red-400',
    button: 'bg-red-600 hover:bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-500/10',
    iconClass: 'text-amber-400',
    button: 'bg-amber-600 hover:bg-amber-500',
  },
  info: {
    icon: Info,
    iconBg: 'bg-sky-500/10',
    iconClass: 'text-sky-400',
    button: 'bg-sky-600 hover:bg-sky-500',
  },
};

const PopupAlert = ({
  open,
  onClose,
  title = 'Notice',
  message,
  variant = 'info',
  buttonLabel = 'OK',
}) => {
  if (!open || !message) return null;

  const config = POPUP_CONFIG[variant] || POPUP_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      onClick={(event) => event.target === event.currentTarget && onClose?.()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconBg}`}>
          <Icon className={`h-7 w-7 ${config.iconClass}`} />
        </div>

        <h3 className="mb-2 text-center text-base font-semibold text-white">{title}</h3>
        <p className="mb-6 text-center text-sm leading-relaxed text-slate-400">{message}</p>

        <button
          type="button"
          onClick={onClose}
          className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] ${config.button}`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default PopupAlert;
