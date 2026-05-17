"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type GeminiResponseModalProps = {
  open: boolean;
  onClose: () => void;
  content: string;
};

export function GeminiResponseModal({
  open,
  onClose,
  content,
}: GeminiResponseModalProps) {
  const [mounted, setMounted] = useState(false);
  const isError = content.startsWith("Error:");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close response dialog"
        onClick={onClose}
      />

      <div
        className="relative z-10 flex max-h-[min(85vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Response</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 nodrag"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <pre
          className={`nodrag flex-1 overflow-y-auto whitespace-pre-wrap break-words px-4 py-4 text-sm leading-relaxed ${
            isError ? "text-red-600" : "text-gray-900"
          }`}
        >
          {content}
        </pre>
      </div>
    </div>,
    document.body,
  );
}
