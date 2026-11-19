import * as React from "react";
import { cn } from "./cn";

export type EmptyStateVariant = "vault" | "timeline" | "notifications" | "chat";

export interface EmptyStateIllustrationProps {
  variant?: EmptyStateVariant;
  className?: string;
}

/**
 * Bespoke 112px x 112px multi-tone clinical vector illustrations for empty states
 * across Dashboard, Vault, Timeline, Notifications, and AI Chat.
 */
export function EmptyStateIllustration({
  variant = "vault",
  className,
}: EmptyStateIllustrationProps) {
  return (
    <svg
      viewBox="0 0 112 112"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-28 w-28 shrink-0 select-none", className)}
    >
      {/* Soft Emerald Backdrop Circle & Ring */}
      <circle cx="56" cy="56" r="50" fill="#ECFDF5" />
      <circle cx="56" cy="56" r="49.5" stroke="#A7F3D0" strokeOpacity="0.85" />
      <circle cx="56" cy="56" r="38" fill="#D1FAE5" fillOpacity="0.45" />

      {variant === "vault" && (
        <>
          {/* Back Layered Clinical Sheet */}
          <rect
            x="30"
            y="24"
            width="44"
            height="56"
            rx="7"
            transform="rotate(-6 30 24)"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          {/* Foreground Encrypted Document Card */}
          <rect
            x="36"
            y="24"
            width="46"
            height="58"
            rx="8"
            fill="#FFFFFF"
            stroke="#059669"
            strokeWidth="2"
          />
          {/* Medical Cross Badge Inside Sheet */}
          <rect x="44" y="33" width="14" height="14" rx="4" fill="#ECFDF5" stroke="#A7F3D0" />
          <path
            d="M51 37V43M48 40H54"
            stroke="#059669"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Document Lines */}
          <line
            x1="63"
            y1="37"
            x2="74"
            y2="37"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="63"
            y1="43"
            x2="70"
            y2="43"
            stroke="#94A3B8"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <line
            x1="44"
            y1="55"
            x2="74"
            y2="55"
            stroke="#94A3B8"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <line
            x1="44"
            y1="62"
            x2="68"
            y2="62"
            stroke="#94A3B8"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <line
            x1="44"
            y1="69"
            x2="58"
            y2="69"
            stroke="#CBD5E1"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Floating Emerald Shield Lock Badge */}
          <circle cx="77" cy="75" r="13" fill="#059669" stroke="#FFFFFF" strokeWidth="2.5" />
          <path
            d="M73.5 75.2L76 77.7L81 72.5"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {variant === "timeline" && (
        <>
          {/* Vertical Timeline Spine */}
          <line
            x1="38"
            y1="26"
            x2="38"
            y2="86"
            stroke="#059669"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          {/* First Event Card */}
          <circle cx="38" cy="36" r="5" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
          <rect
            x="48"
            y="27"
            width="38"
            height="18"
            rx="5"
            fill="#FFFFFF"
            stroke="#059669"
            strokeWidth="1.75"
          />
          <line
            x1="54"
            y1="34"
            x2="78"
            y2="34"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="54"
            y1="39"
            x2="68"
            y2="39"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Second Event Card */}
          <circle cx="38" cy="58" r="4.5" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
          <rect
            x="48"
            y="49"
            width="38"
            height="18"
            rx="5"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          <line
            x1="54"
            y1="56"
            x2="74"
            y2="56"
            stroke="#64748B"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <line
            x1="54"
            y1="61"
            x2="65"
            y2="61"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Clock Badge Overlay */}
          <circle cx="74" cy="76" r="14" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
          <path
            d="M74 69.5V76L78.5 78.5"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {variant === "notifications" && (
        <>
          {/* Envelope / Medical Notice Card */}
          <rect
            x="26"
            y="36"
            width="52"
            height="40"
            rx="7"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.75"
          />
          <path
            d="M29 40L52 56L75 40"
            stroke="#94A3B8"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Foreground Bell Emblem */}
          <circle cx="72" cy="42" r="17" fill="#FFFFFF" stroke="#059669" strokeWidth="2" />
          <path
            d="M72 33C68.6863 33 66 35.6863 66 39V43.5L64 46.5H80L78 43.5V39C78 35.6863 75.3137 33 72 33Z"
            fill="#ECFDF5"
            stroke="#059669"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M70 49C70.4 50.2 71.1 51 72 51C72.9 51 73.6 50.2 74 49"
            stroke="#059669"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Active Pulse Dot */}
          <circle cx="82" cy="30" r="5" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
        </>
      )}

      {variant === "chat" && (
        <>
          {/* Clinical Document Base */}
          <rect
            x="26"
            y="30"
            width="42"
            height="50"
            rx="7"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
          <line
            x1="34"
            y1="41"
            x2="58"
            y2="41"
            stroke="#94A3B8"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <line
            x1="34"
            y1="48"
            x2="52"
            y2="48"
            stroke="#CBD5E1"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* AI Consultation Bubble */}
          <rect
            x="42"
            y="44"
            width="46"
            height="36"
            rx="9"
            fill="#FFFFFF"
            stroke="#059669"
            strokeWidth="2"
          />
          <path
            d="M52 57H78M52 64H70"
            stroke="#059669"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Sparkle Emblem */}
          <circle cx="80" cy="38" r="11" fill="#059669" stroke="#FFFFFF" strokeWidth="2" />
          <path
            d="M80 32.5L81.4 36.6L85.5 38L81.4 39.4L80 43.5L78.6 39.4L74.5 38L78.6 36.6L80 32.5Z"
            fill="#FFFFFF"
          />
        </>
      )}
    </svg>
  );
}
