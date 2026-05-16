"use client";

import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import Transloadit from "@uppy/transloadit";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { getImageUrlFromAssembly } from "@/lib/transloadit";

import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";

type ImageUploadModalProps = {
  open: boolean;
  onClose: () => void;
  onUploaded: (url: string) => void;
  busy?: boolean;
  busyLabel?: string;
  error?: string | null;
};

export function ImageUploadModal({
  open,
  onClose,
  onUploaded,
  busy = false,
  busyLabel = "Saving…",
  error: externalError = null,
}: ImageUploadModalProps) {
  const dashboardTargetRef = useRef<HTMLDivElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const error = externalError ?? uploadError;

  const uppy = useMemo(() => {
    return new Uppy({
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: 10 * 1024 * 1024,
        allowedFileTypes: ["image/*"],
      },
    }).use(Transloadit, {
      waitForEncoding: true,
      assemblyOptions: async () => {
        const response = await fetch("/api/transloadit/params", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to start upload");
        }

        return response.json();
      },
    });
  }, []);

  useEffect(() => {
    if (!open) {
      uppy.cancelAll();
      setUploadError(null);
      return;
    }

    const target = dashboardTargetRef.current;
    if (!target) return;

    uppy.use(Dashboard, {
      target,
      inline: true,
      height: 420,
      width: "100%",
      proudlyDisplayPoweredByUppy: false,
      note: "Images only, up to 10 MB",
    });

    return () => {
      const dashboard = uppy.getPlugin("Dashboard");
      if (dashboard) {
        uppy.removePlugin(dashboard);
      }
    };
  }, [open, uppy]);

  useEffect(() => {
    const handleComplete = (assembly: {
      results?: Record<
        string,
        Array<{ ssl_url?: string | null; url?: string | null }>
      >;
    }) => {
      const url = getImageUrlFromAssembly(assembly);
      if (!url) {
        setUploadError("Upload finished but no image URL was returned.");
        return;
      }

      setUploadError(null);
      uppy.cancelAll();
      onUploaded(url);
    };

    uppy.on("transloadit:complete", handleComplete);

    return () => {
      uppy.off("transloadit:complete", handleComplete);
    };
  }, [uppy, onUploaded]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close upload dialog"
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <button
        type="button"
        onClick={() => {
          if (!busy) onClose();
        }}
        className="absolute right-6 top-6 z-20 rounded-full p-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <X className="size-5" />
      </button>

      <div className="relative z-10 w-full max-w-[760px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {error && (
          <p className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {busy && (
          <p className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-600">
            {busyLabel}
          </p>
        )}
        <div ref={dashboardTargetRef} className="uppy-thumbnail-dashboard" />
      </div>
    </div>
  );
}
