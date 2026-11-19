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
  isChatOpen: boolean;
  hasOpenedChat: boolean;
  chatInitialPrompt: string | null;
  setChatOpen: (isOpen: boolean, initialPrompt?: string | null) => void;
  toasts: ToastMessage[];
  addToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
}

/**
 * Global UI store for active FamilyProfile filter, upload/chat overlay flags, and toast queue.
 */
export const useVaultStore = create<VaultUiState>((set) => ({
  activeProfileId: "all",
  setActiveProfileId: (profileId) => set({ activeProfileId: profileId }),
  isUploadSheetOpen: false,
  setUploadSheetOpen: (isOpen) => set({ isUploadSheetOpen: isOpen }),
  isChatOpen: false,
  hasOpenedChat: false,
  chatInitialPrompt: null,
  setChatOpen: (isOpen, initialPrompt = null) =>
    set((state) => ({
      isChatOpen: isOpen,
      hasOpenedChat: state.hasOpenedChat || isOpen,
      chatInitialPrompt: isOpen ? initialPrompt : null,
    })),
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
