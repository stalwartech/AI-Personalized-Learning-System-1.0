import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Confirmation Popup
// Usage:
//   const [open, setOpen] = useState(false)
//
//   <ConfirmationPopup
//     open={open}
//     onClose={() => setOpen(false)}
//     onConfirm={handleDelete}         // supports async functions / Promises
//     variant="danger"
//     title="Delete Student Record"
//     message="This action cannot be undone."
//     confirmLabel="Yes, Delete"
//     cancelLabel="Cancel"
//   />
//
// Props:
//   open         : boolean (required)
//   onClose      : () => void (required)
//   onConfirm    : () => void | Promise<void> (required)
//   variant      : "danger" | "warning" | "info" | "success"  (default: "danger")
//   title        : string  (default: "Are you sure?")
//   message      : string  (default: "This action cannot be undone.")
//   confirmLabel : string  (default: "Confirm")
//   cancelLabel  : string  (default: "Cancel")
// ─────────────────────────────────────────────────────────────────────────────

const CONFIRM_CONFIG = {
  danger: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-red-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    iconBg:  "bg-red-500/10",
    confirm: "bg-red-600 hover:bg-red-500 text-white",
  },
  warning: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-amber-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    iconBg:  "bg-amber-500/10",
    confirm: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  info: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-sky-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
    iconBg:  "bg-sky-500/10",
    confirm: "bg-sky-600 hover:bg-sky-500 text-white",
  },
  success: {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-emerald-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
    iconBg:  "bg-emerald-500/10",
    confirm: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
};

export function ConfirmationPopup({
  open,
  onClose,
  onConfirm,
  variant = "danger",
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  requirePassword = false,
  passwordLabel = "Password",
  passwordPlaceholder = "Enter your password",
}) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const cfg = CONFIRM_CONFIG[variant] || CONFIRM_CONFIG.danger;

  const handleConfirm = async () => {
    if (requirePassword && !password.trim()) {
      setError("Enter your password to continue.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onConfirm?.(password);
      setPassword("");
      onClose();
    } catch (error) {
      setError(error?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;

    setPassword("");
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/65 backdrop-blur-sm
        animate-[fadeIn_0.15s_ease]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div className="relative w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl shadow-2xl p-6 animate-[popIn_0.22s_cubic-bezier(.34,1.56,.64,1)]">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl ${cfg.iconBg} flex items-center justify-center mx-auto mb-5`}>
          {cfg.icon}
        </div>

        {/* Text */}
        <h3 id="confirm-title" className="text-white font-semibold text-base text-center mb-2">
          {title}
        </h3>
        <p id="confirm-message" className="text-slate-400 text-sm text-center leading-relaxed mb-6">
          {message}
        </p>

        {requirePassword && (
          <label className="block mb-4 text-left">
            <span className="block mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {passwordLabel}
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder={passwordPlaceholder}
              disabled={loading}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        )}

        {error && (
          <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-slate-300
              border border-white/10 hover:bg-white/10 hover:text-white
              transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
              disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]
              flex items-center justify-center gap-2 ${cfg.confirm}`}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn  { from { opacity: 0; transform: scale(.88) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}

export default ConfirmationPopup;
