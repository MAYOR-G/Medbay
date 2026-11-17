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
          "rounded-lg border border-border-hairline bg-surface p-4 shadow-elevation-1 md:p-5",
          interactive &&
            "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:border-border-strong hover:bg-surface-hover",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";
