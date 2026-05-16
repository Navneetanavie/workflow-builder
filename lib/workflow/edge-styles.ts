import type { Connection, Edge } from "@xyflow/react";

import {
  getSourceHandleMeta,
  getTargetHandleMeta,
} from "@/lib/workflow/handles";
import type { PortDataType, WorkflowNode } from "@/lib/workflow/types";

export const PORT_EDGE_COLORS: Record<"text" | "image", string> = {
  text: "#f97316",
  image: "#3b82f6",
};

export function resolveEdgeColor(
  sourceType: PortDataType,
  targetType: PortDataType,
): string {
  if (targetType === "any") {
    return sourceType === "image"
      ? PORT_EDGE_COLORS.image
      : PORT_EDGE_COLORS.text;
  }
  return sourceType === "image"
    ? PORT_EDGE_COLORS.image
    : PORT_EDGE_COLORS.text;
}

export function buildEdgeFromConnection(
  connection: Connection,
  nodes: WorkflowNode[],
): Partial<Edge> {
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);
  if (!sourceNode || !targetNode) return { animated: true };

  const sourceMeta = getSourceHandleMeta(sourceNode, connection.sourceHandle);
  const targetMeta = getTargetHandleMeta(targetNode, connection.targetHandle);
  if (!sourceMeta || !targetMeta) return { animated: true };

  const color = resolveEdgeColor(sourceMeta.dataType, targetMeta.dataType);

  return {
    animated: true,
    style: { stroke: color, strokeWidth: 2 },
    data: {
      sourceType: sourceMeta.dataType,
      targetType: targetMeta.dataType,
    },
  };
}
