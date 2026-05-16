"use client";

import { useState, useTransition } from "react";

import { updateWorkflowThumbnail } from "@/app/dashboard/actions";
import { ImageUploadModal } from "@/components/workflow/image-upload-modal";

type ThumbnailUploadModalProps = {
  workflowId: string;
  open: boolean;
  onClose: () => void;
  onUploaded: (url: string) => void;
};

export function ThumbnailUploadModal({
  workflowId,
  open,
  onClose,
  onUploaded,
}: ThumbnailUploadModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <ImageUploadModal
      open={open}
      error={error}
      busy={isPending}
      busyLabel="Saving thumbnail…"
      onClose={() => {
        if (!isPending) {
          setError(null);
          onClose();
        }
      }}
      onUploaded={(url) => {
        setError(null);
        startTransition(async () => {
          try {
            await updateWorkflowThumbnail(workflowId, url);
            onUploaded(url);
            onClose();
          } catch {
            setError("Failed to save thumbnail. Please try again.");
          }
        });
      }}
    />
  );
}
