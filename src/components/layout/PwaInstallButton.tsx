"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installedHint, setInstalledHint] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    setInstalledHint(true);
    setTimeout(() => setInstalledHint(false), 3500);
  }

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className="inline-flex h-12 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#F2F6F4] px-6 font-body text-base font-semibold text-[#0F172A] transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#E6F0EC] active:scale-[0.985]"
    >
      {installedHint ? (
        <>
          <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-[#059669]" aria-hidden="true" />
          <span>PWA Ready in Browser Menu</span>
        </>
      ) : (
        <>
          <Download className="h-[18px] w-[18px] shrink-0 text-[#475569]" aria-hidden="true" />
          <span>Install MedBay App</span>
        </>
      )}
    </button>
  );
}
