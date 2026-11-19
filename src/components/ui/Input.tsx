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
          className="flex items-center gap-1.5 text-[14px] font-semibold text-[#0F172A]"
        >
          <span>{label}</span>
          {required && (
            <span className="text-[#991B1B]" aria-hidden="true">
              *
            </span>
          )}
          {optionalTag && <span className="font-normal text-[#64748B]">(Optional)</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-11 w-full rounded-[10px] border bg-white px-3.5 font-body text-[15px] text-[#0F172A] placeholder:text-[#64748B] shadow-2xs transition-colors",
            error
              ? "border-[#991B1B] focus-visible:outline-[#991B1B]"
              : "border-[#CBD5E1] focus:border-[#059669]",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="flex items-center gap-1.5 text-[13px] text-[#991B1B]">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[13px] text-[#64748B]">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
