"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { createWorkflow } from "@/app/dashboard/actions";
import { RenameWorkflowDialog } from "@/components/dashboard/rename-workflow-dialog";
import { WorkflowCard } from "@/components/dashboard/workflow-card";
import { WorkflowsEmptyState } from "@/components/dashboard/workflows-empty-state";
import type { WorkflowListItem } from "@/types/workflow";

type WorkflowsDashboardProps = {
  workflows: WorkflowListItem[];
  currentUserId: string;
};

export function WorkflowsDashboard({
  workflows,
  currentUserId,
}: WorkflowsDashboardProps) {
  const [query, setQuery] = useState("");
  const [renameTarget, setRenameTarget] = useState<WorkflowListItem | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const filteredWorkflows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return workflows;

    return workflows.filter((workflow) =>
      workflow.name.toLowerCase().includes(normalized),
    );
  }, [query, workflows]);

  const handleCreate = () => {
    startTransition(() => {
      void createWorkflow();
    });
  };

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Your Workflows
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Open one to edit, run, and review history.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            <Plus className="size-4" />
            {isPending ? "Creating…" : "New workflow"}
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search workflows..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>
      </div>

      {workflows.length === 0 ? (
        <div className="mt-8">
          <WorkflowsEmptyState />
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="mt-8 rounded-xl border border-gray-200 bg-white px-8 py-10 text-center">
          <p className="text-sm text-gray-500">
            No workflows match &ldquo;{query}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              currentUserId={currentUserId}
              onRename={setRenameTarget}
            />
          ))}
        </div>
      )}

      <RenameWorkflowDialog
        workflow={renameTarget}
        onClose={() => setRenameTarget(null)}
      />
    </>
  );
}
