"use client";

import { ArrowLeft, Clock, Play } from "lucide-react";
import Link from "next/link";

type WorkflowHeaderProps = {
  workflowName: string;
  isRunning: boolean;
  onRunAll: () => void;
  onOpenHistory: () => void;
};

export function WorkflowHeader({
  workflowName,
  isRunning,
  onRunAll,
  onOpenHistory,
}: WorkflowHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-sm font-semibold text-gray-900">{workflowName}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenHistory}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Clock className="size-4" />
          History
        </button>
        <button
          type="button"
          onClick={onRunAll}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Play className="size-4 fill-current" />
          {isRunning ? "Running…" : "Run"}
        </button>
      </div>
    </header>
  );
}
