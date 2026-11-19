"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, FileText, Pencil, Trash2 } from "lucide-react";
import { Badge, Button, Card, ModalOrSheet, ProfileBadge } from "@/components/ui";
import { deleteFamilyProfileAction } from "@/server/actions";
import type { FamilyProfileWithCountDto } from "@/server/services";
import { useVaultStore } from "@/stores/use-vault-store";

export interface ProfileCardProps {
  profile: FamilyProfileWithCountDto;
  onEdit: (profile: FamilyProfileWithCountDto) => void;
}

export function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  const router = useRouter();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const addToast = useVaultStore((state) => state.addToast);
  const activeProfileId = useVaultStore((state) => state.activeProfileId);
  const setActiveProfileId = useVaultStore((state) => state.setActiveProfileId);

  function handleConfirmDelete() {
    startTransition(async () => {
      const result = await deleteFamilyProfileAction({ profileId: profile.id });
      if (result.success) {
        if (activeProfileId === profile.id) {
          setActiveProfileId("all");
        }
        setConfirmDeleteOpen(false);
        addToast(`Removed ${profile.fullName} from your family vault.`, "success");
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  return (
    <>
      <Card className="flex flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <ProfileBadge name={profile.relationship} colorIndex={profile.colorIndex} />
              {profile.isPrimary && <Badge variant="ready">Primary</Badge>}
            </div>
            <h2 className="truncate font-heading text-[18px] font-semibold text-[#0F172A]">
              {profile.fullName}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="compact"
              aria-label={`Edit ${profile.fullName}`}
              onClick={() => onEdit(profile)}
              className="px-2.5"
            >
              <Pencil className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">Edit</span>
            </Button>
            {!profile.isPrimary && (
              <Button
                variant="ghost"
                size="compact"
                aria-label={`Delete ${profile.fullName}`}
                onClick={() => setConfirmDeleteOpen(true)}
                className="px-2.5 text-[#991B1B] hover:bg-[#FEF2F2] hover:text-[#991B1B]"
              >
                <Trash2 className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-[#E2E8F0] pt-3.5 text-[14px] text-[#475569]">
          <span className="inline-flex flex-row items-center gap-1.5 tabular-nums">
            <FileText className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
            <span>
              {profile.documentCount} {profile.documentCount === 1 ? "document" : "documents"}
            </span>
          </span>
          {profile.dateOfBirth && (
            <span className="inline-flex flex-row items-center gap-1.5 font-mono text-xs tabular-nums">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[#64748B]" aria-hidden="true" />
              <span>DOB {profile.dateOfBirth}</span>
            </span>
          )}
        </div>
      </Card>

      <ModalOrSheet
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Family Member?"
        description={`Deleting ${profile.fullName} permanently removes all ${profile.documentCount} associated medical documents, AI summaries, and vector embeddings. This cannot be undone.`}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => setConfirmDeleteOpen(false)}
          >
            <span>Cancel</span>
          </Button>
          <Button
            variant="destructive"
            isLoading={isPending}
            loadingLabel="Deleting..."
            onClick={handleConfirmDelete}
          >
            <span>Delete Profile</span>
          </Button>
        </div>
      </ModalOrSheet>
    </>
  );
}
