"use client";

import { ImagePlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ThumbnailUploadModal } from "@/components/dashboard/thumbnail-upload-modal";
import { WorkflowMenu } from "@/components/dashboard/workflow-menu";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { DEFAULT_WORKFLOW_THUMBNAIL } from "@/lib/workflow-defaults";
import type { WorkflowListItem } from "@/types/workflow";

type WorkflowCardProps = {
  workflow: WorkflowListItem;
  currentUserId: string;
  onRename: (workflow: WorkflowListItem) => void;
};

export function WorkflowCard({
  workflow,
  currentUserId,
  onRename,
}: WorkflowCardProps) {
  const router = useRouter();
  const [thumbnail, setThumbnail] = useState(
    workflow.thumbnailUrl ?? DEFAULT_WORKFLOW_THUMBNAIL,
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const canManage = workflow.user.id === currentUserId;
  const href = `/dashboard/workflows/${workflow.id}`;

  const overlayButtonClass = (isActive: boolean) =>
    `flex size-8 items-center justify-center rounded-lg bg-white/90 text-gray-700 shadow-sm ring-1 ring-gray-200/80 backdrop-blur-sm transition-opacity hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 ${
      isActive
        ? "opacity-100"
        : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
    }`;

  return (
    <>
      <article className="group">
        <div className="relative aspect-[4/3] w-full bg-gray-100">
          <Link href={href} className="absolute inset-0 block overflow-hidden rounded-xl">
            <Image
              src={thumbnail}
              alt={workflow.name}
              fill
              unoptimized={thumbnail.includes("transloadit.com")}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </Link>

          {canManage && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setUploadOpen(true);
              }}
              className={`absolute left-2 top-2 z-10 ${overlayButtonClass(uploadOpen)}`}
              aria-label={`Edit thumbnail for ${workflow.name}`}
            >
              <ImagePlus className="size-4" />
            </button>
          )}

          <WorkflowMenu
            workflow={workflow}
            canManage={canManage}
            onRename={onRename}
          />
        </div>
        <Link href={href} className="mt-3 block space-y-0.5">
          <h3 className="truncate text-sm font-medium text-gray-900">
            {workflow.name}
          </h3>
          <p className="text-sm text-gray-500">
            {formatRelativeTime(new Date(workflow.updatedAt))}
          </p>
        </Link>
      </article>

      {canManage && (
        <ThumbnailUploadModal
          workflowId={workflow.id}
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={(url) => {
            setThumbnail(url);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
