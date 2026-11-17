"use client";

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Camera, FileUp, UploadCloud, X } from "lucide-react";
import { Button, Input, ModalOrSheet, cn } from "@/components/ui";
import { useVaultStore } from "@/stores/use-vault-store";
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  type FamilyProfileDto,
} from "@/types/domain.types";

const ACCEPTED_FILE_EXTENSIONS = ".jpg,.jpeg,.png,.webp,.pdf,.docx,.txt";

export interface UploadSheetProps {
  profiles: FamilyProfileDto[];
}

export function UploadSheet({ profiles }: UploadSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = useVaultStore((state) => state.isUploadSheetOpen);
  const setOpen = useVaultStore((state) => state.setUploadSheetOpen);
  const activeProfileId = useVaultStore((state) => state.activeProfileId);
  const addToast = useVaultStore((state) => state.addToast);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [targetProfileId, setTargetProfileId] = useState<string>("auto");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  function resetForm() {
    setSelectedFile(null);
    setCustomTitle("");
    setTargetProfileId(activeProfileId !== "all" ? activeProfileId : "auto");
    setIsDragging(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && !isUploading) {
      resetForm();
    } else if (nextOpen) {
      setTargetProfileId(activeProfileId !== "all" ? activeProfileId : "auto");
    }
    setOpen(nextOpen);
  }

  function validateAndSelectFile(file: File | undefined) {
    if (!file) return;

    const extensionAllowed = /\.(jpe?g|png|webp|pdf|docx|txt)$/i.test(file.name);
    const mimeAllowed = (ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type);

    if (
      (!mimeAllowed && !extensionAllowed) ||
      file.size > MAX_DOCUMENT_SIZE_BYTES ||
      file.size === 0
    ) {
      addToast(
        "Unsupported file or size over 25 MB. Please select a JPEG, PNG, WebP, PDF, DOCX, or TXT file.",
        "danger",
      );
      return;
    }

    setSelectedFile(file);
    if (!customTitle.trim()) {
      setCustomTitle(
        file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[_-]+/g, " ")
          .trim(),
      );
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    validateAndSelectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    validateAndSelectFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) {
      addToast("Please choose or capture a medical document first.", "warning");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (targetProfileId !== "auto") {
        formData.append("profileId", targetProfileId);
      }
      if (customTitle.trim()) {
        formData.append("title", customTitle.trim());
      }

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: { id: string };
        error?: { message: string };
      };

      if (!response.ok || !payload.success) {
        addToast(payload.error?.message ?? "Upload failed. Please try again.", "danger");
        return;
      }

      addToast("Document uploaded — MedBay AI is analyzing it now.", "success");
      resetForm();
      setOpen(false);
      if (pathname !== "/vault") {
        router.push("/vault");
      }
      router.refresh();
    } catch {
      addToast("Network error during upload. Please try again.", "danger");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <ModalOrSheet
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Add Medical Document"
      description="Accepted: JPEG, PNG, WebP, PDF, DOCX, or TXT up to 25 MB."
      size="wide"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "rounded-lg border-[1.5px] border-dashed p-5 text-center transition-colors",
            isDragging
              ? "border-accent-primary bg-accent-primary-tint/50"
              : "border-border-strong bg-surface-hover",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_EXTENSIONS}
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-border-hairline bg-surface px-3.5 py-2.5 text-left">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-text-primary">
                  {selectedFile.name}
                </p>
                <p className="font-mono text-xs text-text-muted tabular-nums">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                aria-label="Remove selected file"
                onClick={() => setSelectedFile(null)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud className="mx-auto h-8 w-8 text-accent-primary" aria-hidden="true" />
              <p className="mt-2 text-[14px] text-text-secondary">
                Drag and drop a medical record here, or choose an option below
              </p>
              <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  <span>Take Photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp className="h-4 w-4" aria-hidden="true" />
                  <span>Choose File</span>
                </Button>
              </div>
            </>
          )}
        </div>

        <Input
          label="Document Title"
          optionalTag
          placeholder="e.g., Annual Blood Panel"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
        />

        <div className="space-y-2">
          <p className="text-[14px] font-semibold text-text-primary">Assign to Family Member</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTargetProfileId("auto")}
              className={cn(
                "min-h-[44px] rounded-full border px-3.5 text-[14px] transition-colors",
                targetProfileId === "auto"
                  ? "border-accent-primary bg-accent-primary font-semibold text-text-inverted"
                  : "border-border-hairline bg-surface font-medium text-text-secondary hover:border-border-strong",
              )}
            >
              Auto-Detect from Document
            </button>
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => setTargetProfileId(profile.id)}
                className={cn(
                  "min-h-[44px] rounded-full border px-3.5 text-[14px] transition-colors",
                  targetProfileId === profile.id
                    ? "border-accent-primary bg-accent-primary font-semibold text-text-inverted"
                    : "border-border-hairline bg-surface font-medium text-text-secondary hover:border-border-strong",
                )}
              >
                {profile.isPrimary ? "Self" : profile.fullName}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isUploading}
          loadingLabel="Uploading..."
          disabled={!selectedFile}
          className="w-full"
        >
          Upload &amp; Analyze
        </Button>
      </form>
    </ModalOrSheet>
  );
}
