"use client";

import { Crop, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

import { GEMINI_MODEL_LABEL } from "@/lib/gemini/models";

type NodePickerProps = {
  onAdd: (type: "cropImage" | "gemini") => void;
};

export function NodePicker({ onAdd }: NodePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
      <div className="pointer-events-auto relative">
        {open && (
          <div className="absolute bottom-full left-1/2 mb-3 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
            <button
              type="button"
              onClick={() => {
                onAdd("cropImage");
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Crop className="size-4 text-gray-500" />
              Crop Image
            </button>
            <button
              type="button"
              onClick={() => {
                onAdd("gemini");
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <Sparkles className="size-4 text-gray-500" />
              {GEMINI_MODEL_LABEL}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex size-12 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Add node"
        >
          <Plus className="size-6" />
        </button>
      </div>
    </div>
  );
}
