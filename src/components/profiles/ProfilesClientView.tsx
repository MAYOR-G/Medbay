"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui";
import type { FamilyProfileWithCountDto } from "@/server/services";
import { MAX_DEPENDENT_PROFILES, type UserAccountDto } from "@/types/domain.types";
import { AddProfileModal } from "./AddProfileModal";
import { GoogleSyncCard } from "./GoogleSyncCard";
import { ProfileCard } from "./ProfileCard";

export interface ProfilesClientViewProps {
  user: UserAccountDto;
  profiles: FamilyProfileWithCountDto[];
}

export function ProfilesClientView({ user, profiles }: ProfilesClientViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FamilyProfileWithCountDto | null>(null);

  const dependentCount = profiles.filter((p) => !p.isPrimary).length;
  const atDependentLimit = dependentCount >= MAX_DEPENDENT_PROFILES;

  function openAddModal() {
    setEditingProfile(null);
    setModalOpen(true);
  }

  function openEditModal(profile: FamilyProfileWithCountDto) {
    setEditingProfile(profile);
    setModalOpen(true);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-[#0F172A]">
              Family Profiles &amp; Settings
            </h1>
            <p className="mt-1.5 flex items-center gap-2 text-[15px] text-[#475569]">
              <Users className="h-[18px] w-[18px] shrink-0 text-[#059669]" aria-hidden="true" />
              <span className="tabular-nums">
                {dependentCount} of {MAX_DEPENDENT_PROFILES} managed dependents used
              </span>
            </p>
          </div>

          <Button variant="primary" disabled={atDependentLimit} onClick={openAddModal}>
            <Plus className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span>Add Family Member</span>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} onEdit={openEditModal} />
          ))}
        </div>
      </section>

      <GoogleSyncCard user={user} />

      <AddProfileModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingProfile={editingProfile}
      />
    </div>
  );
}
