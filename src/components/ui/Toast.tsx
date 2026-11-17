"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useVaultStore, type ToastTone } from "@/stores/use-vault-store";

function ToastIcon({ tone }: { tone: ToastTone }) {
  if (tone === "success") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-[#A7F3D0]" aria-hidden="true" />;
  }
  if (tone === "danger" || tone === "warning") {
    return <AlertCircle className="h-4 w-4 shrink-0 text-[#FDE68A]" aria-hidden="true" />;
  }
  return <Info className="h-4 w-4 shrink-0 text-[#BAE6FD]" aria-hidden="true" />;
}

export function ToastViewport() {
  const toasts = useVaultStore((state) => state.toasts);
  const dismissToast = useVaultStore((state) => state.dismissToast);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dismissToast(toast.id);
      }, 4000),
    );
    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, [toasts, dismissToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[84px] z-50 flex flex-col items-center gap-2 md:top-5 md:bottom-auto"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-[420px] items-center justify-between gap-3 rounded-md bg-text-primary px-4 py-3 text-[14px] text-text-inverted shadow-elevation-3"
        >
          <div className="flex items-center gap-2.5">
            <ToastIcon tone={toast.tone} />
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-white/75 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
