"use client";

import { ImageIcon, Plus, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AddFieldMenuProps = {
  onAddText: () => void;
  onAddImage: () => void;
};

export function AddFieldMenu({ onAddText, onAddImage }: AddFieldMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        aria-label="Add field"
      >
        <Plus className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onAddText();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <Type className="size-4 text-gray-500" />
            Textarea
          </button>
          <button
            type="button"
            onClick={() => {
              onAddImage();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <ImageIcon className="size-4 text-gray-500" />
            Image
          </button>
        </div>
      )}
    </div>
  );
}
