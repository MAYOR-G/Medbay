"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { MedBayLogo, cn } from "@/components/ui";
import { useVaultStore } from "@/stores/use-vault-store";
import type { ChatThreadDto, FamilyProfileDto } from "@/types/domain.types";
import { ChatWorkspace } from "./ChatWorkspace";

export interface FloatingAiChatProps {
  profiles: FamilyProfileDto[];
  initialThreads: ChatThreadDto[];
}

export function FloatingAiChat({ profiles, initialThreads }: FloatingAiChatProps) {
  const pathname = usePathname();
  const isChatOpen = useVaultStore((state) => state.isChatOpen);
  const hasOpenedChat = useVaultStore((state) => state.hasOpenedChat);
  const chatInitialPrompt = useVaultStore((state) => state.chatInitialPrompt);
  const setChatOpen = useVaultStore((state) => state.setChatOpen);
  const activeProfileId = useVaultStore((state) => state.activeProfileId);
  const setActiveProfileId = useVaultStore((state) => state.setActiveProfileId);

  const handleConsumeInitialPrompt = useCallback(() => {
    setChatOpen(true, null);
  }, [setChatOpen]);

  const isOnDedicatedChatRoute = pathname === "/chat" || pathname.startsWith("/chat/");

  // Lock background scroll and allow Escape to close full-screen AI chat
  useEffect(() => {
    if (!isChatOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setChatOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isChatOpen, setChatOpen]);

  return (
    <>
      {!isChatOpen && !isOnDedicatedChatRoute && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          aria-label="Ask MedBay AI"
          className="fixed right-6 bottom-[84px] z-40 inline-flex h-12 flex-row items-center justify-center gap-2.5 whitespace-nowrap rounded-full bg-[#059669] px-5 font-body text-[15px] font-semibold text-white shadow-lg transition-[background-color,transform,box-shadow] duration-150 hover:bg-[#047857] active:bg-[#065F46] active:scale-[0.98] md:bottom-6"
        >
          <Sparkles className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>Ask MedBay AI</span>
        </button>
      )}

      {hasOpenedChat && (
        <div
          role="dialog"
          aria-modal={isChatOpen}
          aria-hidden={!isChatOpen}
          aria-label="MedBay Clinical AI Chat"
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-white text-[#0F172A]",
            !isChatOpen && "pointer-events-none hidden",
          )}
        >
          {/* Full-screen AI Chat Header */}
          <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white px-6 py-3">
            <div className="flex items-center gap-3.5">
              <MedBayLogo size="sm" showWordmark={false} />
              <div>
                <h1 className="font-heading text-[18px] font-bold tracking-[-0.015em] text-[#0F172A]">
                  MedBay Clinical AI
                </h1>
                <p className="text-[13px] text-[#475569]">
                  Streaming consultation grounded in your family vault
                </p>
              </div>
            </div>

            {/* Inline Family Scope Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                role="tablist"
                aria-label="Chat patient scope"
                className="hidden items-center gap-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1 md:flex"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeProfileId === "all"}
                  onClick={() => setActiveProfileId("all")}
                  className={cn(
                    "inline-flex h-8 flex-row items-center whitespace-nowrap rounded-lg px-3 text-[13px] font-semibold transition-colors",
                    activeProfileId === "all"
                      ? "border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] shadow-2xs"
                      : "text-[#475569] hover:text-[#0F172A]",
                  )}
                >
                  All Family
                </button>
                {profiles.map((profile) => {
                  const selected = activeProfileId === profile.id;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveProfileId(profile.id)}
                      className={cn(
                        "inline-flex h-8 flex-row items-center whitespace-nowrap rounded-lg px-3 text-[13px] font-semibold transition-colors",
                        selected
                          ? "border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] shadow-2xs"
                          : "text-[#475569] hover:text-[#0F172A]",
                      )}
                    >
                      {profile.isPrimary ? "Self" : profile.fullName}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setChatOpen(false)}
                aria-label="Close AI Chat"
                className="inline-flex h-10 flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border border-[#CBD5E1] bg-white px-3.5 text-[14px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
              >
                <span>Close</span>
                <kbd className="hidden rounded-[4px] border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-0.5 font-mono text-[11px] text-[#64748B] sm:inline">
                  Esc
                </kbd>
                <X className="h-4 w-4 shrink-0 text-[#475569]" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          </header>

          {/* Streaming Chat Workspace */}
          <div className="min-h-0 flex-1 overflow-hidden bg-white">
            <ChatWorkspace
              profiles={profiles}
              threads={initialThreads}
              initialThreadId={null}
              initialMessages={[]}
              initialProfileId={activeProfileId !== "all" ? activeProfileId : null}
              fullScreen
              initialPrompt={chatInitialPrompt}
              onConsumeInitialPrompt={handleConsumeInitialPrompt}
            />
          </div>
        </div>
      )}
    </>
  );
}
