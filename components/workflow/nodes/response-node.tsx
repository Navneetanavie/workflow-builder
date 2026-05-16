"use client";

import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";

import { BaseNode, FieldBlock } from "@/components/workflow/nodes/base-node";
import type { ResponseData } from "@/lib/workflow/types";

export function ResponseNode({ id, data }: NodeProps) {
  const { getEdges, getNodes } = useReactFlow();
  const nodeData = data as ResponseData;
  const edges = getEdges().filter((e) => e.target === id);
  const nodes = getNodes();

  const upstream = edges.map((edge) => {
    const source = nodes.find((n) => n.id === edge.source);
    const label =
      (source?.data as { label?: string })?.label ??
      source?.type ??
      edge.source;
    return label;
  });

  return (
    <BaseNode title="Response">
      <FieldBlock
        label="result"
        port={{ id: "in-result", type: "target", dataType: "any" }}
      >
        <div className="space-y-2">
          {upstream.length === 0 && (
            <p className="text-xs text-gray-400">Connect upstream outputs</p>
          )}
          {upstream.map((label) => (
            <div
              key={label}
              className="flex items-center justify-between rounded border border-gray-100 bg-white px-2 py-1.5 text-xs"
            >
              <span className="font-medium text-gray-700">{label}</span>
              <span className="text-gray-400">No output yet</span>
            </div>
          ))}
        </div>
      </FieldBlock>

      {nodeData.result && (
        <pre className="max-h-32 overflow-auto rounded-lg bg-gray-50 p-2 text-[10px] text-gray-600">
          {nodeData.result}
        </pre>
      )}
    </BaseNode>
  );
}
