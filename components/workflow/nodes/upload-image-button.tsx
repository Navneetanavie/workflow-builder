"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";

import { uploadButtonClassName } from "@/components/workflow/nodes/node-styles";

type UploadImageButtonProps = {
  disabled?: boolean;
  onUrl: (url: string) => void;
};

export function UploadImageButton({ disabled, onUrl }: UploadImageButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onUrl(URL.createObjectURL(file));
          }
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={uploadButtonClassName}
      >
        <Upload className="size-4" />
        Upload image
      </button>
    </>
  );
}
