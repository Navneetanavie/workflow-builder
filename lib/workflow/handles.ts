import type {
  HandleMeta,
  PortDataType,
  WorkflowNode,
  WorkflowNodeType,
} from "@/lib/workflow/types";

export function getSourceHandleMeta(
  node: WorkflowNode,
  handleId: string | null | undefined,
): HandleMeta | null {
  if (!handleId) return null;

  if (node.type === "requestInputs" && node.data && "fields" in node.data) {
    const field = node.data.fields.find((f) => `out-${f.id}` === handleId);
    if (!field) return null;
    return {
      dataType: field.type === "image" ? "image" : "text",
      label: field.name,
    };
  }

  if (node.type === "cropImage") {
    if (handleId === "out-image") {
      return { dataType: "image", label: "Output Image" };
    }
  }

  if (node.type === "gemini" && handleId === "out-response") {
    return { dataType: "text", label: "Response" };
  }

  return null;
}

export function getTargetHandleMeta(
  node: WorkflowNode,
  handleId: string | null | undefined,
): HandleMeta | null {
  if (!handleId) return null;

  if (node.type === "cropImage") {
    if (handleId === "in-image") {
      return { dataType: "image", label: "Input Image" };
    }
  }

  if (node.type === "gemini") {
    const map: Record<string, HandleMeta> = {
      "in-prompt": { dataType: "text", label: "Prompt" },
      "in-system": { dataType: "text", label: "System Prompt" },
      "in-image": { dataType: "image", label: "Image (Vision)" },
    };
    return map[handleId] ?? null;
  }

  if (node.type === "response" && handleId === "in-result") {
    return { dataType: "any", label: "result" };
  }

  return null;
}

export function isTypeCompatible(
  source: PortDataType,
  target: PortDataType,
): boolean {
  if (target === "any" || source === "any") return true;
  return source === target;
}

export function nodeTypeLabel(type: WorkflowNodeType): string {
  switch (type) {
    case "requestInputs":
      return "Request-Inputs";
    case "cropImage":
      return "Crop Image";
    case "gemini":
      return "Gemini 3.1 Pro";
    case "response":
      return "Response";
    default:
      return type;
  }
}
