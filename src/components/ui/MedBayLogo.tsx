import * as React from "react";
import { cn } from "./cn";

export interface MedBayLogoProps {
  className?: string;
  wordmarkClassName?: string;
  taglineClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "mono";
  showWordmark?: boolean;
  showTagline?: boolean;
  tagline?: string;
}

const ICON_SIZES: Record<NonNullable<MedBayLogoProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const WORDMARK_SIZES: Record<NonNullable<MedBayLogoProps["size"]>, string> = {
  sm: "text-[18px]",
  md: "text-[21px]",
  lg: "text-[26px]",
  xl: "text-[34px]",
};

/**
 * Bespoke MedBay vector brand mark:
 * Precision clinical shield enclosing an open medical dossier (book/pages),
 * a centered white medical cross, and subtle AI neural-insight nodes.
 */
export function MedBayLogo({
  className,
  wordmarkClassName,
  taglineClassName,
  size = "md",
  variant = "default",
  showWordmark = true,
  showTagline = false,
  tagline = "Medical AI & Document Hub",
}: MedBayLogoProps) {
  const isLight = variant === "light";
  const isMono = variant === "mono";

  const shieldOuter = isMono ? "#0F172A" : isLight ? "#10B981" : "#064E3B";
  const shieldChamber = isMono ? "#1E293B" : isLight ? "#059669" : "#059669";
  const shieldRim = isMono ? "#334155" : isLight ? "#A7F3D0" : "#10B981";
  const neuralStroke = isMono ? "#94A3B8" : "#A7F3D0";
  const pageLeft = "#FFFFFF";
  const pageRight = isMono ? "#CBD5E1" : "#D1FAE5";
  const crossFill = "#FFFFFF";

  return (
    <span className={cn("inline-flex flex-row items-center gap-2.5 select-none", className)}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={cn("shrink-0", ICON_SIZES[size])}
      >
        {/* Outer Precision Clinical Shield */}
        <path
          d="M24 3L41 9.4V23.2C41 33.7 33.5 41.4 24 44.8C14.5 41.4 7 33.7 7 23.2V9.4L24 3Z"
          fill={shieldOuter}
        />

        {/* Crisp Inner Shield Rim */}
        <path
          d="M24 5.4L38.6 10.9V23.1C38.6 32.1 32.2 38.9 24 42.1C15.8 38.9 9.4 32.1 9.4 23.1V10.9L24 5.4Z"
          stroke={shieldRim}
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Upper Clinical Intelligence Chamber */}
        <path
          d="M24 7.4L36.6 12.1V22.4C36.6 25.1 35.8 27.6 34.4 29.8L24 26.2L13.6 29.8C12.2 27.6 11.4 25.1 11.4 22.4V12.1L24 7.4Z"
          fill={shieldChamber}
        />

        {/* Subtle AI Clinical Insight Nodes & Pathways */}
        <g stroke={neuralStroke} strokeWidth="1.25" strokeLinecap="round" strokeOpacity="0.85">
          <path d="M15.2 15.2L18.8 17.4" />
          <path d="M14.4 21.4L18.4 20.1" />
          <path d="M32.8 15.2L29.2 17.4" />
          <path d="M33.6 21.4L29.6 20.1" />
          <path d="M18.6 12.6L21.2 14.4" />
          <path d="M29.4 12.6L26.8 14.4" />
        </g>
        <g fill={neuralStroke}>
          <circle cx="15" cy="15" r="1.45" />
          <circle cx="14.2" cy="21.5" r="1.35" />
          <circle cx="18.4" cy="12.4" r="1.25" />
          <circle cx="33" cy="15" r="1.45" />
          <circle cx="33.8" cy="21.5" r="1.35" />
          <circle cx="29.6" cy="12.4" r="1.25" />
        </g>

        {/* Centered Crisp Medical Cross */}
        <path
          d="M22.2 12.4C22.2 11.85 22.65 11.4 23.2 11.4H24.8C25.35 11.4 25.8 11.85 25.8 12.4V16.4H29.8C30.35 16.4 30.8 16.85 30.8 17.4V19C30.8 19.55 30.35 20 29.8 20H25.8V24C25.8 24.55 25.35 25 24.8 25H23.2C22.65 25 22.2 24.55 22.2 24V20H18.2C17.65 20 17.2 19.55 17.2 19V17.4C17.2 16.85 17.65 16.4 18.2 16.4H22.2V12.4Z"
          fill={crossFill}
        />

        {/* Open Clinical Record / Book — Left Page */}
        <path
          d="M11.6 26.2C16.2 26.2 20.5 27.6 23.5 30.2V39.2C20.2 36.8 16.1 35.4 11.6 35.1V26.2Z"
          fill={pageLeft}
        />

        {/* Open Clinical Record / Book — Right Page */}
        <path
          d="M36.4 26.2C31.8 26.2 27.5 27.6 24.5 30.2V39.2C27.8 36.8 31.9 35.4 36.4 35.1V26.2Z"
          fill={pageRight}
        />

        {/* Crisp Document Spine Notch */}
        <path
          d="M24 30.2V39.6"
          stroke={shieldOuter}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <span className="flex flex-col">
          <span
            className={cn(
              "font-heading leading-none font-bold tracking-[-0.025em]",
              WORDMARK_SIZES[size],
              isLight ? "text-white" : "text-[#0F172A]",
              wordmarkClassName,
            )}
          >
            Med<span className={isLight ? "text-[#6EE7B7]" : "text-[#059669]"}>Bay</span>
          </span>
          {showTagline && (
            <span
              className={cn(
                "mt-1 font-body text-xs leading-none font-medium tracking-[0.01em]",
                isLight ? "text-[#A7F3D0]" : "text-[#475569]",
                taglineClassName,
              )}
            >
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
