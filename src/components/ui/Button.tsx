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
    "bg-accent-primary text-text-inverted hover:bg-accent-primary-hover active:bg-accent-primary-active disabled:bg-border-hairline disabled:text-text-muted",
  secondary:
    "bg-accent-primary-tint text-accent-primary border border-accent-primary-border hover:bg-[#D6E7E0] hover:border-accent-primary active:bg-[#C6DDD4] disabled:bg-surface-subtle disabled:text-text-muted disabled:border-border-hairline",
  outline:
    "bg-surface text-text-primary border border-border-strong hover:bg-surface-hover hover:border-text-primary active:bg-surface-subtle disabled:bg-canvas disabled:text-text-muted disabled:border-border-hairline",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary active:bg-border-hairline disabled:text-text-muted disabled:opacity-60",
  destructive:
    "bg-status-danger-bg text-status-danger-text border border-status-danger-border hover:bg-status-danger-text hover:text-text-inverted hover:border-status-danger-text active:bg-[#7F1D1D] active:text-text-inverted focus-visible:outline-status-danger-text disabled:bg-surface-subtle disabled:text-text-muted disabled:border-border-hairline",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: "min-h-[44px] px-4",
  compact: "min-h-[44px] md:min-h-[40px] px-3.5",
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
          "inline-flex items-center justify-center gap-2 rounded-md font-body text-[15px] font-semibold transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.985] disabled:cursor-not-allowed disabled:active:scale-100",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        <span>{isLoading && loadingLabel ? loadingLabel : children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";
