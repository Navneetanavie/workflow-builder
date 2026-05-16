"use client";

import { Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { ImageUploadModal } from "@/components/workflow/image-upload-modal";
import { uploadButtonClassName } from "@/components/workflow/nodes/node-styles";

type NodeImageFieldProps = {
  value: string;
  disabled?: boolean;
  onChange: (url: string) => void;
  alt?: string;
};

export function NodeImageField({
  value,
  disabled,
  onChange,
  alt = "Uploaded image",
}: NodeImageFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {value ? (
        <div className="flex items-start gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setModalOpen(true)}
            className="shrink-0 overflow-hidden rounded-lg border border-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={alt}
              className="size-16 object-cover"
            />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="size-3.5" />
            Delete image
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setModalOpen(true)}
          className={uploadButtonClassName}
        >
          <Upload className="size-4" />
          Upload image
        </button>
      )}

      <ImageUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUploaded={(url) => {
          onChange(url);
          setModalOpen(false);
        }}
      />
    </>
  );
}
