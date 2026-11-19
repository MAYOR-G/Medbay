import * as React from "react";
import { cn } from "./cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_1px_2px_rgba(15,23,42,0.03)] md:p-6",
          interactive &&
            "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";
