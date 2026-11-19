import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "default" | "compact";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#059669] text-white border border-transparent hover:bg-[#047857] active:bg-[#065F46] shadow-xs disabled:bg-[#E2E8F0] disabled:text-[#64748B]",
  secondary:
    "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] hover:bg-[#D1FAE5] hover:border-[#059669] active:bg-[#A7F3D0] disabled:bg-[#F8FAFC] disabled:text-[#64748B] disabled:border-[#E2E8F0]",
  outline:
    "bg-white text-[#0F172A] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8] active:bg-[#F1F5F9] shadow-2xs disabled:bg-[#F8FAFC] disabled:text-[#64748B] disabled:border-[#E2E8F0]",
  ghost:
    "bg-transparent text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] active:bg-[#F1F5F9] disabled:text-[#64748B] disabled:opacity-60",
  destructive:
    "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] hover:bg-[#991B1B] hover:text-white hover:border-[#991B1B] active:bg-[#7F1D1D] active:text-white focus-visible:outline-[#991B1B] disabled:bg-[#F8FAFC] disabled:text-[#64748B] disabled:border-[#E2E8F0]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: "h-11 min-h-[44px] px-4",
  compact: "h-10 min-h-[40px] px-3.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isLoading = false,
      loadingLabel,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-body text-[15px] font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.985] disabled:cursor-not-allowed disabled:active:scale-100 [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:shrink-0",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin" aria-hidden="true" />}
        {isLoading && loadingLabel ? <span>{loadingLabel}</span> : children}
      </button>
    );
  },
);

Button.displayName = "Button";
