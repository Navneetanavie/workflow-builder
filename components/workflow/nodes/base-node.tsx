"use client";

import { Handle, Position } from "@xyflow/react";
import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { NodeMenu } from "@/components/workflow/nodes/node-menu";
import type { PortDataType } from "@/lib/workflow/types";

const PORT_COLORS: Record<PortDataType, string> = {
  text: "!bg-orange-500 !border-orange-500",
  image: "!bg-blue-500 !border-blue-500",
  any: "!bg-gray-900 !border-gray-900",
};

type BaseNodeProps = {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
  className?: string;
  onDuplicate?: () => void;
  onDelete?: () => void;
  showMenu?: boolean;
};

export function BaseNode({
  title,
  children,
  headerRight,
  className = "",
  onDuplicate,
  onDelete,
  showMenu = false,
}: BaseNodeProps) {
  return (
    <div
      className={`w-[320px] overflow-visible rounded-xl border border-gray-200 bg-white shadow-md ${className}`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{title}</span>
          <Info className="size-3.5 text-gray-400" />
        </div>
        <div className="flex items-center gap-1">
          {headerRight}
          {showMenu && onDuplicate && onDelete && (
            <NodeMenu onDuplicate={onDuplicate} onDelete={onDelete} />
          )}
        </div>
      </div>
      <div className="space-y-2.5 p-3">{children}</div>
    </div>
  );
}

type PortHandleProps = {
  id: string;
  type: "source" | "target";
  dataType: PortDataType;
};

export function PortHandle({ id, type, dataType }: PortHandleProps) {
  return (
    <Handle
      id={id}
      type={type}
      position={type === "source" ? Position.Right : Position.Left}
      className={`workflow-field-handle !relative !inset-auto !top-auto !left-auto !right-auto !bottom-auto !translate-x-0 !translate-y-0 !size-2.5 !border-2 !border-white ${PORT_COLORS[dataType]}`}
    />
  );
}

export type FieldPort = {
  id: string;
  type: "source" | "target";
  dataType: PortDataType;
};

export function FieldBlock({
  label,
  required,
  connected,
  headerRight,
  port,
  children,
}: {
  label?: ReactNode;
  required?: boolean;
  connected?: boolean;
  headerRight?: ReactNode;
  port?: FieldPort;
  children: ReactNode;
}) {
  const isOutput = port?.type === "source";

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white px-3 py-2.5">
      {port && (
        <div
          className={`pointer-events-auto absolute top-1/2 z-20 -translate-y-1/2 ${
            isOutput
              ? "-right-[5px] translate-x-1/2"
              : "-left-[5px] -translate-x-1/2"
          }`}
        >
          <PortHandle
            id={port.id}
            type={port.type}
            dataType={port.dataType}
          />
        </div>
      )}
      {(label || headerRight) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          {label ? (
            <div className="min-w-0 flex-1 text-xs font-medium text-gray-800">
              {label}
              {required && <span className="text-red-500"> *</span>}
            </div>
          ) : (
            <span />
          )}
          {headerRight}
        </div>
      )}
      <div className={connected ? "pointer-events-none opacity-45" : ""}>
        {children}
      </div>
    </div>
  );
}
