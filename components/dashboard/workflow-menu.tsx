"use client";

import {
  Copy,
  Download,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  deleteWorkflow,
  duplicateWorkflow,
  getWorkflowForExport,
} from "@/app/dashboard/actions";
import type { WorkflowListItem } from "@/types/workflow";

type WorkflowMenuProps = {
  workflow: WorkflowListItem;
  canManage: boolean;
  onRename: (workflow: WorkflowListItem) => void;
};

export function WorkflowMenu({
  workflow,
  canManage,
  onRename,
}: WorkflowMenuProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleDuplicate = () => {
    startTransition(async () => {
      await duplicateWorkflow(workflow.id);
      setOpen(false);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${workflow.name}"? This cannot be undone.`)) return;

    startTransition(async () => {
      await deleteWorkflow(workflow.id);
      setOpen(false);
    });
  };

  const handleExportJson = () => {
    startTransition(async () => {
      const data = await getWorkflowForExport(workflow.id);
      const payload = {
        id: data.id,
        name: data.name,
        thumbnailUrl: data.thumbnailUrl,
        definition: data.definition,
        createdAt: data.createdAt.toISOString(),
        updatedAt: data.updatedAt.toISOString(),
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${workflow.name.replace(/\s+/g, "-").toLowerCase()}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    });
  };

  return (
    <div ref={menuRef} className="absolute right-2 top-2 z-10">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className={`flex size-8 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm ring-1 ring-gray-200/80 backdrop-blur-sm transition-opacity hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 ${
          open ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        }`}
        aria-label={`Actions for ${workflow.name}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreVertical className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          <Link
            href={`/dashboard/workflows/${workflow.id}`}
            role="menuitem"
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            <ExternalLink className="size-4 shrink-0 text-gray-500" />
            Open
          </Link>
          {canManage && (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {
                setOpen(false);
                onRename(workflow);
              }}
            >
              <Pencil className="size-4 shrink-0 text-gray-500" />
              Rename
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            disabled={isPending}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={handleDuplicate}
          >
            <Copy className="size-4 shrink-0 text-gray-500" />
            Duplicate
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={isPending}
            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={handleExportJson}
          >
            <Download className="size-4 shrink-0 text-gray-500" />
            Export JSON
          </button>
          {canManage && (
            <>
              <div className="my-1 border-t border-gray-100" />
              <button
                type="button"
                role="menuitem"
                disabled={isPending}
                className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                onClick={handleDelete}
              >
                <Trash2 className="size-4 shrink-0" />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
