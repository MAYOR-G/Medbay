import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "./cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
  optionalTag?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, helperText, error, optionalTag, required, className, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="flex items-center gap-1.5 text-[14px] font-semibold text-text-primary"
        >
          <span>{label}</span>
          {required && (
            <span className="text-status-danger-text" aria-hidden="true">
              *
            </span>
          )}
          {optionalTag && <span className="font-normal text-text-muted">(Optional)</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-[44px] w-full rounded-md border bg-surface px-3 font-body text-[15px] text-text-primary placeholder:text-text-muted transition-colors",
            error
              ? "border-status-danger-text focus-visible:outline-status-danger-text"
              : "border-border-strong focus:border-border-focus",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="flex items-center gap-1 text-[13px] text-status-danger-text">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[13px] text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
