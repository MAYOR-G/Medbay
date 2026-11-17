"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import * as Switch from "@radix-ui/react-switch";
import { BellRing } from "lucide-react";
import { Card } from "@/components/ui";
import { useVaultStore } from "@/stores/use-vault-store";

const emptySubscribe = () => () => {};
function getPushSupportSnapshot(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputBuffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(outputBuffer);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushOptInCard() {
  const addToast = useVaultStore((state) => state.addToast);
  const isSupported = useSyncExternalStore(emptySubscribe, getPushSupportSnapshot, () => false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!isSupported) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setIsSubscribed(Boolean(sub)))
      .catch(() => undefined);
  }, [isSupported]);

  async function handleTogglePush(checked: boolean) {
    if (!isSupported) return;
    setIsBusy(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (checked) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          addToast("Browser notification permission was denied.", "warning");
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          addToast("Push notifications are not configured on this server yet.", "warning");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        const serialized = subscription.toJSON();
        if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys?.auth) {
          throw new Error("Incomplete push subscription keys.");
        }

        const response = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: serialized.endpoint,
            keys: {
              p256dh: serialized.keys.p256dh,
              auth: serialized.keys.auth,
            },
            deviceLabel: navigator.userAgent.slice(0, 100),
          }),
        });

        if (!response.ok) {
          throw new Error("Could not register push subscription.");
        }

        setIsSubscribed(true);
        addToast("Device push notifications enabled.", "success");
      } else {
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: existing.endpoint }),
          });
          await existing.unsubscribe();
        }
        setIsSubscribed(false);
        addToast("Device push notifications disabled.", "success");
      }
    } catch {
      addToast("Could not update push notification settings.", "danger");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent-primary-border bg-accent-primary-tint text-accent-primary">
          <BellRing className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold text-text-primary">
            Device Push Alerts
          </h2>
          <p className="text-[13px] text-text-secondary">
            {isSupported
              ? "Receive instant alerts on this device when MedBay detects lab or clinic emails."
              : "Web Push notifications are not supported in this browser."}
          </p>
        </div>
      </div>

      {isSupported && (
        <div className="flex min-h-[44px] items-center">
          <Switch.Root
            aria-label="Enable device push alerts"
            checked={isSubscribed}
            onCheckedChange={handleTogglePush}
            disabled={isBusy}
            className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border border-border-strong bg-surface-subtle transition-colors data-[state=checked]:border-accent-primary data-[state=checked]:bg-accent-primary"
          >
            <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-surface shadow-elevation-1 transition-transform data-[state=checked]:translate-x-[21px]" />
          </Switch.Root>
        </div>
      )}
    </Card>
  );
}
