import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
}

const ToastContext = createContext<((t: Omit<Toast, "id">) => void) | null>(null);
const DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = nextId.current++;
    setToasts((ts) => [...ts.slice(-2), { ...t, id }]); // at most 3 on screen
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} dismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);
  const onDismiss = useCallback(() => dismiss(toast.id), [dismiss, toast.id]);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(onDismiss, DURATION_MS);
    return () => clearTimeout(t);
  }, [paused, onDismiss]);

  return (
    // pausing on hover/focus gives people time to reach the Undo button
    <div className="toast" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <span>{toast.message}</span>
      {toast.action && (
        <button
          className="toast__action"
          onClick={() => {
            toast.action!.onClick();
            onDismiss();
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button className="icon-btn icon-btn--sm" aria-label="Dismiss notification" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
