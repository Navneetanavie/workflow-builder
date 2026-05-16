"use client";

import { useEffect, useRef, useTransition } from "react";

import { renameWorkflow } from "@/app/dashboard/actions";
import type { WorkflowListItem } from "@/types/workflow";

type RenameWorkflowDialogProps = {
  workflow: WorkflowListItem | null;
  onClose: () => void;
};

export function RenameWorkflowDialog({
  workflow,
  onClose,
}: RenameWorkflowDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!workflow) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [workflow]);

  if (!workflow) return null;

  const handleSubmit = (formData: FormData) => {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return;

    startTransition(async () => {
      await renameWorkflow(workflow.id, name);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">Rename workflow</h2>
        <form action={handleSubmit} className="mt-4 space-y-4">
          <input
            ref={inputRef}
            name="name"
            defaultValue={workflow.name}
            disabled={isPending}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
