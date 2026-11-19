"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "./cn";

export interface ModalOrSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: "default" | "wide";
  children: React.ReactNode;
}

/**
 * Accessible modal primitive adapting cleanly between a mobile bottom sheet (< 768px)
 * and a centered desktop dialog (>= 768px).
 */
export function ModalOrSheet({
  open,
  onOpenChange,
  title,
  description,
  size = "default",
  children,
}: ModalOrSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-overlay backdrop-blur-[2px] transition-opacity duration-200" />
        <Dialog.Content
          className={cn(
            "fixed z-50 w-full border border-[#E2E8F0] bg-white p-5 shadow-elevation-3 focus:outline-none",
            "inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl",
            "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:p-6",
            size === "wide" ? "md:max-w-[560px]" : "md:max-w-[480px]",
          )}
        >
          {/* Mobile Drag Handle */}
          <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[#CBD5E1] md:hidden" />

          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="font-heading text-xl font-bold tracking-[-0.015em] text-[#0F172A]">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-[15px] text-[#475569]">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close Modal"
              className="inline-flex h-10 w-10 shrink-0 flex-row items-center justify-center rounded-[10px] text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              <X className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
