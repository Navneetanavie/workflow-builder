"use client";

import { Plus } from "lucide-react";
import { useTransition } from "react";

import { createWorkflow } from "@/app/dashboard/actions";

export function WorkflowsEmptyState() {
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(() => {
      void createWorkflow();
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-8 py-10">
      <h2 className="text-lg font-semibold text-gray-900">No workflows yet</h2>
      <p className="mt-2 text-sm text-gray-500">
        Create your first workflow to start building.
      </p>
      <button
        type="button"
        onClick={handleCreate}
        disabled={isPending}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
      >
        <Plus className="size-4" />
        {isPending ? "Creating…" : "Create workflow"}
      </button>
    </div>
  );
}
