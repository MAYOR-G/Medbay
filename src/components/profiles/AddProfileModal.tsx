"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Button, Input, ModalOrSheet } from "@/components/ui";
import { createFamilyProfileAction, updateFamilyProfileAction } from "@/server/actions";
import type { FamilyProfileWithCountDto } from "@/server/services";
import { useVaultStore } from "@/stores/use-vault-store";
import {
  DEPENDENT_RELATIONSHIPS,
  FAMILY_RELATIONSHIPS,
  type DependentRelationship,
} from "@/types/domain.types";

const profileFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(160),
  relationship: z.enum(FAMILY_RELATIONSHIPS),
  dateOfBirth: z.string().refine((val) => {
    if (val === "") return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
    const todayIso = new Date().toISOString().slice(0, 10);
    return val <= todayIso;
  }, "Date of birth cannot be in the future."),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export interface AddProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProfile: FamilyProfileWithCountDto | null;
}

export function AddProfileModal({ open, onOpenChange, editingProfile }: AddProfileModalProps) {
  const router = useRouter();
  const addToast = useVaultStore((state) => state.addToast);
  const isEditing = Boolean(editingProfile);
  const isPrimaryEditing = Boolean(editingProfile?.isPrimary);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      relationship: "Spouse",
      dateOfBirth: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        fullName: editingProfile?.fullName ?? "",
        relationship: editingProfile?.relationship ?? "Spouse",
        dateOfBirth: editingProfile?.dateOfBirth ?? "",
      });
    }
  }, [open, editingProfile, reset]);

  async function onSubmit(values: ProfileFormValues) {
    const normalizedDob = values.dateOfBirth.trim() === "" ? null : values.dateOfBirth.trim();

    if (isEditing && editingProfile) {
      const result = await updateFamilyProfileAction({
        profileId: editingProfile.id,
        fullName: values.fullName,
        relationship: editingProfile.isPrimary ? "Self" : values.relationship,
        dateOfBirth: normalizedDob,
      });

      if (result.success) {
        addToast(`Updated ${result.data.fullName}'s profile.`, "success");
        onOpenChange(false);
        router.refresh();
      } else {
        if (result.error.fieldErrors?.fullName?.[0]) {
          setError("fullName", { message: result.error.fieldErrors.fullName[0] });
        }
        addToast(result.error.message, "danger");
      }
      return;
    }

    if (values.relationship === "Self") {
      setError("relationship", { message: "Select Spouse, Child, Parent, Dependent, or Other." });
      return;
    }

    const result = await createFamilyProfileAction({
      fullName: values.fullName,
      relationship: values.relationship as DependentRelationship,
      dateOfBirth: normalizedDob,
    });

    if (result.success) {
      addToast(`Added ${result.data.fullName} to your family vault.`, "success");
      onOpenChange(false);
      router.refresh();
    } else {
      if (result.error.fieldErrors?.fullName?.[0]) {
        setError("fullName", { message: result.error.fieldErrors.fullName[0] });
      }
      addToast(result.error.message, "danger");
    }
  }

  return (
    <ModalOrSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Family Member" : "Add Family Member"}
      description="Managed profiles stay under your single account with no separate email or login required."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          required
          placeholder="e.g., David Morgan"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <div className="space-y-1.5">
          <label
            htmlFor="profile-relationship"
            className="flex items-center gap-1.5 text-[14px] font-semibold text-text-primary"
          >
            <span>Relationship</span>
            <span className="text-status-danger-text" aria-hidden="true">
              *
            </span>
          </label>
          <select
            id="profile-relationship"
            disabled={isPrimaryEditing}
            aria-invalid={Boolean(errors.relationship)}
            className="h-[44px] w-full rounded-md border border-border-strong bg-surface px-3 font-body text-[15px] text-text-primary focus:border-border-focus disabled:bg-surface-subtle disabled:text-text-muted"
            {...register("relationship")}
          >
            {isPrimaryEditing ? (
              <option value="Self">Self</option>
            ) : (
              DEPENDENT_RELATIONSHIPS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))
            )}
          </select>
          {errors.relationship?.message && (
            <p className="flex items-center gap-1 text-[13px] text-status-danger-text">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{errors.relationship.message}</span>
            </p>
          )}
        </div>

        <Input
          label="Date of Birth"
          type="date"
          optionalTag
          max={new Date().toISOString().slice(0, 10)}
          error={errors.dateOfBirth?.message}
          helperText="Helps MedBay AI apply age-appropriate clinical context."
          {...register("dateOfBirth")}
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingLabel="Saving Profile..."
          >
            {isEditing ? "Save Changes" : "Save Family Member"}
          </Button>
        </div>
      </form>
    </ModalOrSheet>
  );
}
