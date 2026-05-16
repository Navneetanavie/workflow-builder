"use client";

import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Play, RotateCcw } from "lucide-react";

import { BaseNode, FieldBlock } from "@/components/workflow/nodes/base-node";
import { NodeImageField } from "@/components/workflow/nodes/node-image-field";
import { outputBoxClassName } from "@/components/workflow/nodes/node-styles";
import { isHandleConnected } from "@/lib/workflow/execution";
import type { CropImageData } from "@/lib/workflow/types";

type CropImageNodeProps = NodeProps & {
  onRunNode?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
};

function SliderInput({
  label,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  value: number;
  defaultValue: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <div className="flex items-center justify-between text-xs text-gray-700">
        <span>{label}</span>
        <div className="flex items-center gap-1">
          <span className="tabular-nums text-gray-900">{value}</span>
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            className="rounded p-0.5 text-gray-400 hover:bg-gray-100"
            aria-label={`Reset ${label}`}
          >
            <RotateCcw className="size-3" />
          </button>
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer accent-blue-600"
      />
    </div>
  );
}

export function CropImageNode({
  id,
  data,
  onRunNode,
  onDuplicate,
  onDelete,
}: CropImageNodeProps) {
  const { updateNodeData, getEdges } = useReactFlow();
  const nodeData = data as CropImageData;
  const edges = getEdges();
  const imageConnected = isHandleConnected(id, "in-image", edges, "target");

  const setData = (patch: Partial<CropImageData>) => {
    updateNodeData(id, { ...nodeData, ...patch });
  };

  return (
    <BaseNode
      title="Crop Image"
      showMenu
      onDuplicate={() => onDuplicate?.(id)}
      onDelete={() => onDelete?.(id)}
      headerRight={
        <button
          type="button"
          onClick={() => onRunNode?.(id)}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <Play className="size-3 fill-current" />
          Run
        </button>
      }
    >
      <FieldBlock
        label="Input Image"
        required
        connected={imageConnected}
        port={{ id: "in-image", type: "target", dataType: "image" }}
      >
        <NodeImageField
          value={nodeData.inputImageUrl}
          disabled={imageConnected}
          alt="Input"
          onChange={(url) => setData({ inputImageUrl: url })}
        />
      </FieldBlock>

      <SliderInput
        label="X Position (%)"
        value={nodeData.x}
        defaultValue={0}
        onChange={(x) => setData({ x })}
      />
      <SliderInput
        label="Y Position (%)"
        value={nodeData.y}
        defaultValue={0}
        onChange={(y) => setData({ y })}
      />
      <SliderInput
        label="Width (%)"
        value={nodeData.width}
        defaultValue={100}
        onChange={(width) => setData({ width })}
      />
      <SliderInput
        label="Height (%)"
        value={nodeData.height}
        defaultValue={100}
        onChange={(height) => setData({ height })}
      />

      <FieldBlock
        label="Output Image"
        port={{ id: "out-image", type: "source", dataType: "image" }}
      >
        <div className={outputBoxClassName}>
          {nodeData.outputUrl ? "Output ready" : "No output yet"}
        </div>
      </FieldBlock>
    </BaseNode>
  );
}
