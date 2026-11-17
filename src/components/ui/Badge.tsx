import * as React from "react";
import { cn } from "./cn";

export type BadgeVariant =
  "ready" | "processing" | "attention" | "critical" | "info" | "vault" | "neutral";

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  ready: "bg-status-success-bg border-status-success-border text-status-success-text",
  processing: "bg-accent-primary-tint border-accent-primary-border text-accent-primary",
  attention: "bg-status-warning-bg border-status-warning-border text-status-warning-text",
  critical: "bg-status-danger-bg border-status-danger-border text-status-danger-text",
  info: "bg-status-info-bg border-status-info-border text-status-info-text",
  vault: "bg-accent-primary-tint border-accent-primary-border text-accent-primary",
  neutral: "bg-surface-subtle border-border-hairline text-text-secondary",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-xs font-medium tracking-[0.02em] uppercase",
        BADGE_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

const PROFILE_PALETTE_CLASSES: readonly string[] = [
  "bg-[#E6F0EC] border-[#B7D4C8] text-[#1B5E4B]",
  "bg-[#EEF2FF] border-[#C7D2FE] text-[#3730A3]",
  "bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]",
  "bg-[#FCE7F3] border-[#FBCFE8] text-[#9D174D]",
  "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
  "bg-[#F0F9FF] border-[#BAE6FD] text-[#075985]",
  "bg-[#ECECE4] border-[#DCE2DF] text-[#14211D]",
];

export interface ProfileBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  colorIndex: number;
}

export function ProfileBadge({ name, colorIndex, className, ...props }: ProfileBadgeProps) {
  const paletteClass =
    PROFILE_PALETTE_CLASSES[Math.abs(colorIndex) % PROFILE_PALETTE_CLASSES.length] ??
    PROFILE_PALETTE_CLASSES[0];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-1 font-mono text-xs font-medium",
        paletteClass,
        className,
      )}
      {...props}
    >
      {name}
    </span>
  );
}
