"use client";

import { useState } from "react";
import { X, PanelRight, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronRight, Loader2 } from "lucide-react";

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

function formatDuration(start: Date, end: Date | null) {
  if (!end) return "-";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return `${(ms / 1000).toFixed(1)}s`;
}

function getRunStatus(entries: HistoryRun["entries"]) {
  if (entries.length === 0) return { status: "pending", color: "bg-yellow-50 text-yellow-700 border-yellow-200" };
  const hasError = entries.some(e => e.status === "error");
  const isRunning = entries.some(e => e.status === "running");
  
  if (hasError) return { status: "failed", color: "bg-red-50 text-red-700 border-red-200" };
  if (isRunning) return { status: "partial", color: "bg-yellow-50 text-yellow-700 border-yellow-200" };
  return { status: "success", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

function RunItem({ run, index, totalRuns }: { run: HistoryRun, index: number, totalRuns: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  const { status, color } = getRunStatus(run.entries);
  const scope = run.nodeIds.length === 0 || run.entries.length > 3 ? "Full Workflow" : "Partial";

  // calculate run duration
  let duration = "-";
  if (run.entries.length > 0) {
    const starts = run.entries.map(e => new Date(e.startedAt).getTime());
    const ends = run.entries.filter(e => e.completedAt).map(e => new Date(e.completedAt!).getTime());
    if (starts.length > 0 && ends.length === run.entries.length) {
      const minStart = Math.min(...starts);
      const maxEnd = Math.max(...ends);
      duration = `${((maxEnd - minStart) / 1000).toFixed(1)}s`;
    }
  }

  const runSeq = totalRuns - index;
  const runHash = run.id.slice(-4).toUpperCase();

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-3 transition-all hover:border-gray-300">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col p-3 bg-gray-50/50 hover:bg-gray-50 transition-colors"
      >
        <div className="w-full flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            {expanded ? <ChevronDown className="size-4 text-gray-500" /> : <ChevronRight className="size-4 text-gray-500" />}
            <p className="text-xs font-semibold text-gray-900">
              Run #{runSeq} ({runHash}) — {new Date(run.createdAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${color}`}>
            {status}
          </span>
        </div>
        <div className="text-[10px] text-gray-500 pl-5 text-left flex items-center gap-1">
          <span>({scope})</span>
          <span>•</span>
          <span>{duration} total</span>
        </div>
      </button>

      {expanded && (
        <div className="p-3 border-t border-gray-100 bg-white">
          <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
            {run.entries.map((entry, idx) => {
              const isLast = idx === run.entries.length - 1;
              const prefix = isLast ? "└─" : "├─";
              const dur = formatDuration(entry.startedAt, entry.completedAt);
              
              let StatusIcon = Loader2;
              let iconColor = "text-blue-500 animate-spin";
              
              if (entry.status === "success") {
                StatusIcon = CheckCircle2;
                iconColor = "text-emerald-500";
              } else if (entry.status === "error") {
                StatusIcon = XCircle;
                iconColor = "text-red-500";
              }

              let outputPreview = "—";
              if (entry.output) {
                if (typeof entry.output === "string") {
                  outputPreview = `"${entry.output.slice(0, 40)}${entry.output.length > 40 ? "..." : ""}"`;
                } else if (entry.output && typeof entry.output === "object") {
                  if ((entry.output as any).url) {
                    outputPreview = String((entry.output as any).url);
                  } else {
                    outputPreview = JSON.stringify(entry.output).slice(0, 40) + "...";
                  }
                }
              } else if (entry.status === "running") {
                outputPreview = "running...";
              }

              return (
                <div key={entry.id} className="flex items-center gap-1.5 text-gray-700 hover:bg-gray-50 p-1 rounded transition-colors group">
                  <span className="text-gray-300 select-none mr-0.5 shrink-0">{prefix}</span>
                  <span className="font-semibold text-gray-900 w-[110px] truncate shrink-0" title={entry.label ?? entry.nodeId}>
                    {entry.label ?? entry.nodeId}
                  </span>
                  <StatusIcon className={`size-3.5 shrink-0 ${iconColor}`} />
                  <span className="text-gray-500 w-[35px] text-right shrink-0">{dur}</span>
                  <span className="text-gray-400 shrink-0">→</span>
                  <span className="text-gray-600 truncate flex-1 group-hover:text-gray-900" title={String(outputPreview)}>
                    {outputPreview}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function HistoryPanel({ open, onClose, runs }: HistoryPanelProps) {
  return (
    <aside
      className={`h-full border-gray-200 bg-[#fbfbfb] transition-[width,opacity] duration-300 ease-in-out shrink-0 flex flex-col overflow-hidden ${
        open
          ? "w-[420px] opacity-100 border-l"
          : "w-0 opacity-0 pointer-events-none border-l-0"
      }`}
    >
      <div className="w-[420px] h-full flex flex-col shrink-0">
        <div className="h-14 flex items-center justify-between border-b border-gray-200 px-4 bg-white shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">Workflow History</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            title="Collapse Panel"
          >
            <PanelRight className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-[#fbfbfb]">
          {runs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-sm text-gray-500 font-medium">No runs yet.</p>
              <p className="text-xs text-gray-400 mt-1">Execute the workflow to see history.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {runs.map((run, idx) => (
                <RunItem key={run.id} run={run} index={idx} totalRuns={runs.length} />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
