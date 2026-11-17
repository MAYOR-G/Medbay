"use client";

import { create } from "zustand";

interface VaultUiState {
  activeProfileId: string;
  setActiveProfileId: (profileId: string) => void;
}

/**
 * Lightweight global client store for active FamilyProfile filter state.
 */
export const useVaultStore = create<VaultUiState>((set) => ({
  activeProfileId: "all",
  setActiveProfileId: (profileId) => set({ activeProfileId: profileId }),
}));
