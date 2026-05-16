"use client";

import { X } from "lucide-react";

type HistoryRun = {
  id: string;
  createdAt: Date;
  nodeIds: string[];
  entries: {
    id: string;
    nodeId: string;
    label: string | null;
    nodeType: string;
    inputs: unknown;
    output: unknown;
    status: string;
    startedAt: Date;
    completedAt: Date | null;
  }[];
};

type HistoryPanelProps = {
  open: boolean;
  onClose: () => void;
  runs: HistoryRun[];
};

export function HistoryPanel({ open, onClose, runs }: HistoryPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Close history"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">Run history</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {runs.length === 0 ? (
            <p className="text-sm text-gray-500">No runs yet.</p>
          ) : (
            <ul className="space-y-4">
              {runs.map((run) => (
                <li
                  key={run.id}
                  className="rounded-xl border border-gray-200 p-3"
                >
                  <p className="text-xs text-gray-500">
                    {new Date(run.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {run.nodeIds.length === 0 ||
                    run.entries.length > 3
                      ? "Full workflow"
                      : `Nodes: ${run.nodeIds.join(", ")}`}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {run.entries.map((entry) => (
                      <li
                        key={entry.id}
                        className="rounded-lg bg-gray-50 p-2 text-xs"
                      >
                        <p className="font-medium text-gray-800">
                          {entry.label ?? entry.nodeId}
                        </p>
                        <p className="mt-1 text-gray-500">
                          Input:{" "}
                          <code className="text-[10px]">
                            {JSON.stringify(entry.inputs).slice(0, 80)}…
                          </code>
                        </p>
                        <p className="mt-1 text-gray-600">
                          Output:{" "}
                          {entry.output
                            ? JSON.stringify(entry.output).slice(0, 100)
                            : "—"}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
