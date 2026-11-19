import * as React from "react";
import { cn } from "./cn";

export type BadgeVariant =
  | "ready"
  | "processing"
  | "attention"
  | "critical"
  | "info"
  | "vault"
  | "neutral";

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  ready: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
  processing: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
  attention: "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]",
  critical: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]",
  info: "bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]",
  vault: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
  neutral: "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-row items-center gap-1.5 whitespace-nowrap rounded-[6px] border px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums",
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
  "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
  "bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]",
  "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]",
  "bg-[#FDF2F8] border-[#FBCFE8] text-[#9D174D]",
  "bg-[#EEF2FF] border-[#C7D2FE] text-[#3730A3]",
  "bg-[#F0F9FF] border-[#BAE6FD] text-[#075985]",
  "bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]",
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
        "inline-flex flex-row items-center whitespace-nowrap rounded-[6px] border px-2.5 py-0.5 font-mono text-xs font-medium",
        paletteClass,
        className,
      )}
      {...props}
    >
      {name}
    </span>
  );
}
