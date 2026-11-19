import * as React from "react";
import { cn } from "./cn";

export interface MedBayLogoProps {
  className?: string;
  wordmarkClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
  showWordmark?: boolean;
}

const ICON_SIZES: Record<NonNullable<MedBayLogoProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

/**
 * Bespoke MedBay brand mark: rounded clinical emerald shield/vault with a clean
 * white medical cross and integrated ECG pulse waveform, paired with the Outfit wordmark.
 */
export function MedBayLogo({
  className,
  wordmarkClassName,
  size = "md",
  variant = "default",
  showWordmark = true,
}: MedBayLogoProps) {
  const gradientId = React.useId();
  const isLight = variant === "light";

  return (
    <span className={cn("inline-flex flex-row items-center gap-2.5 select-none", className)}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={cn("shrink-0", ICON_SIZES[size])}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isLight ? "#10B981" : "#059669"} />
            <stop offset="100%" stopColor={isLight ? "#059669" : "#047857"} />
          </linearGradient>
        </defs>

        {/* Outer Rounded Vault Squircle */}
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="10"
          fill={`url(#${gradientId})`}
          stroke={isLight ? "rgba(255,255,255,0.28)" : "#047857"}
          strokeWidth="1"
        />

        {/* Subtle Inner Shield Contour */}
        <path
          d="M18 5.5L28 9.2V17.4C28 23.6 23.75 28.85 18 30.6C12.25 28.85 8 23.6 8 17.4V9.2L18 5.5Z"
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(255,255,255,0.24)"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Crisp Medical Cross Backdrop */}
        <path
          d="M16 10.5C16 9.94772 16.4477 9.5 17 9.5H19C19.5523 9.5 20 9.94772 20 10.5V15.5H25C25.5523 15.5 26 15.9477 26 16.5V18.5C26 19.0523 25.5523 19.5 25 19.5H20V24.5C20 25.0523 19.5523 25.5 19 25.5H17C16.4477 25.5 16 25.0523 16 24.5V19.5H11C10.4477 19.5 10 19.0523 10 18.5V16.5C10 15.9477 10.4477 15.5 11 15.5H16V10.5Z"
          fill="#FFFFFF"
          fillOpacity="0.96"
        />

        {/* Integrated Emerald ECG Heartbeat Pulse Line */}
        <path
          d="M11.2 17.5H14.6L16.1 14.5L18.1 20.6L19.8 16.2L21.1 17.5H24.8"
          stroke="#047857"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showWordmark && (
        <span
          className={cn(
            "font-heading text-[20px] leading-none font-bold tracking-[-0.02em]",
            isLight ? "text-white" : "text-[#0F172A]",
            wordmarkClassName,
          )}
        >
          MedBay
        </span>
      )}
    </span>
  );
}
