"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { X } from "lucide-react";

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: selected ? 3 : style?.strokeWidth ?? 2,
          strokeDasharray: "0",
        }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <button
          type="button"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="flex size-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm hover:bg-gray-100 hover:text-gray-900"
          onClick={(event) => {
            event.stopPropagation();
            setEdges((edges) => edges.filter((edge) => edge.id !== id));
          }}
          aria-label="Delete connection"
        >
          <X className="size-3" />
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
