"use client";

import { create } from "zustand";

export type ToastTone = "default" | "success" | "warning" | "danger";

export interface ToastMessage {
  id: string;
  message: string;
  tone: ToastTone;
}

interface VaultUiState {
  activeProfileId: string;
  setActiveProfileId: (profileId: string) => void;
  isUploadSheetOpen: boolean;
  setUploadSheetOpen: (isOpen: boolean) => void;
  toasts: ToastMessage[];
  addToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
}

/**
 * Global UI store strictly for active FamilyProfile filter, modal/sheet flags, and toast queue.
 */
export const useVaultStore = create<VaultUiState>((set) => ({
  activeProfileId: "all",
  setActiveProfileId: (profileId) => set({ activeProfileId: profileId }),
  isUploadSheetOpen: false,
  setUploadSheetOpen: (isOpen) => set({ isUploadSheetOpen: isOpen }),
  toasts: [],
  addToast: (message, tone = "default") =>
    set((state) => ({
      toasts: [
        ...state.toasts.slice(-3),
        { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, message, tone },
      ],
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
