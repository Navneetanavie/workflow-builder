import { getExecutionLevels } from "@/lib/workflow/dag";
import {
  getSourceHandleMeta,
  getTargetHandleMeta,
} from "@/lib/workflow/handles";
import type {
  CropImageData,
  GeminiData,
  RequestInputsData,
  ResponseData,
  WorkflowEdge,
  WorkflowNode,
} from "@/lib/workflow/types";

export type NodeRunInput = Record<string, unknown>;
export type NodeRunOutput = Record<string, unknown>;

export type NodeExecutionResult = {
  nodeId: string;
  nodeType: string;
  label: string;
  inputs: NodeRunInput;
  output: NodeRunOutput;
  status: "completed";
};

function resolveInputs(
  node: WorkflowNode,
  edges: WorkflowEdge[],
  outputs: Map<string, NodeRunOutput>,
): NodeRunInput {
  const inputs: NodeRunInput = {};
  const incoming = edges.filter((edge) => edge.target === node.id);

  for (const edge of incoming) {
    const sourceNode = outputs.has(edge.source)
      ? { id: edge.source }
      : null;
    const targetMeta = getTargetHandleMeta(node, edge.targetHandle);
    const key = targetMeta?.label ?? edge.targetHandle ?? "input";

    if (sourceNode && outputs.get(edge.source)) {
      const sourceOutput = outputs.get(edge.source)!;
      if (edge.sourceHandle?.startsWith("out-")) {
        const fieldId = edge.sourceHandle.replace("out-", "");
        inputs[key] = sourceOutput[fieldId] ?? sourceOutput.response ?? sourceOutput.image;
      } else if (edge.sourceHandle === "out-image") {
        inputs[key] = sourceOutput.image ?? sourceOutput.url;
      } else if (edge.sourceHandle === "out-response") {
        inputs[key] = sourceOutput.response ?? sourceOutput.text;
      } else {
        inputs[key] = sourceOutput;
      }
    }
  }

  if (node.type === "requestInputs" && "fields" in node.data) {
    const data = node.data as RequestInputsData;
    for (const field of data.fields) {
      inputs[field.name] = field.value;
    }
  }

  if (node.type === "cropImage") {
    const data = node.data as CropImageData;
    inputs["X Position (%)"] = data.x;
    inputs["Y Position (%)"] = data.y;
    inputs["Width (%)"] = data.width;
    inputs["Height (%)"] = data.height;
    if (!inputs["Input Image"] && data.inputImageUrl) {
      inputs["Input Image"] = data.inputImageUrl;
    }
  }

  if (node.type === "gemini") {
    const data = node.data as GeminiData;
    if (!inputs.Prompt && data.prompt) inputs.Prompt = data.prompt;
    if (!inputs["System Prompt"] && data.systemPrompt) {
      inputs["System Prompt"] = data.systemPrompt;
    }
    if (!inputs["Image (Vision)"] && data.imageVisionUrl) {
      inputs["Image (Vision)"] = data.imageVisionUrl;
    }
  }

  return inputs;
}

function executeNodeStub(
  node: WorkflowNode,
  inputs: NodeRunInput,
): NodeRunOutput {
  if (node.type === "requestInputs" && "fields" in node.data) {
    const data = node.data as RequestInputsData;
    const output: NodeRunOutput = {};
    for (const field of data.fields) {
      output[field.id] = field.value;
    }
    return output;
  }

  if (node.type === "cropImage") {
    const image =
      inputs["Input Image"] ??
      (node.data as CropImageData).inputImageUrl ??
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80";
    return {
      image,
      url: image,
      message: `Cropped at x=${inputs["X Position (%)"] ?? 0}%, y=${inputs["Y Position (%)"] ?? 0}%`,
    };
  }

  if (node.type === "gemini") {
    const prompt = String(inputs.Prompt ?? "No prompt");
    return {
      response: `[Stub] Gemini response for: ${prompt.slice(0, 120)}`,
      text: `[Stub] Gemini response for: ${prompt.slice(0, 120)}`,
    };
  }

  if (node.type === "response") {
    return {
      result: JSON.stringify(inputs, null, 2),
    };
  }

  return {};
}

function seedOutputsFromNodeState(nodes: WorkflowNode[]): Map<string, NodeRunOutput> {
  const outputs = new Map<string, NodeRunOutput>();

  for (const node of nodes) {
    if (node.type === "cropImage") {
      const data = node.data as CropImageData;
      if (data.outputUrl) {
        outputs.set(node.id, { image: data.outputUrl, url: data.outputUrl });
      }
    }
    if (node.type === "gemini") {
      const data = node.data as GeminiData;
      if (data.response) {
        outputs.set(node.id, { response: data.response, text: data.response });
      }
    }
    if (node.type === "requestInputs" && "fields" in node.data) {
      const data = node.data as RequestInputsData;
      const out: NodeRunOutput = {};
      for (const field of data.fields) {
        out[field.id] = field.value;
      }
      outputs.set(node.id, out);
    }
  }

  return outputs;
}

export function executeWorkflowGraph(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  targetNodeIds?: string[],
): {
  results: NodeExecutionResult[];
  nodeOutputs: Map<string, NodeRunOutput>;
} {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const levels = getExecutionLevels(nodes, edges, targetNodeIds);
  const outputs = seedOutputsFromNodeState(nodes);
  const results: NodeExecutionResult[] = [];

  for (const level of levels) {
    for (const nodeId of level) {
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      const inputs = resolveInputs(node, edges, outputs);
      const output = executeNodeStub(node, inputs);
      outputs.set(nodeId, output);

      let label = nodeId;
      if (node.type === "cropImage") label = (node.data as CropImageData).label;
      if (node.type === "gemini") label = (node.data as GeminiData).label;

      results.push({
        nodeId,
        nodeType: node.type ?? "unknown",
        label,
        inputs,
        output,
        status: "completed",
      });
    }
  }

  return { results, nodeOutputs: outputs };
}

export function applyOutputsToNodes(
  nodes: WorkflowNode[],
  nodeOutputs: Map<string, NodeRunOutput>,
): WorkflowNode[] {
  return nodes.map((node) => {
    const output = nodeOutputs.get(node.id);
    if (!output) return node;

    if (node.type === "cropImage") {
      return {
        ...node,
        data: {
          ...(node.data as CropImageData),
          outputUrl: String(output.url ?? output.image ?? ""),
          lastResponse: String(output.message ?? ""),
        },
      };
    }

    if (node.type === "gemini") {
      return {
        ...node,
        data: {
          ...(node.data as GeminiData),
          response: String(output.response ?? output.text ?? ""),
        },
      };
    }

    if (node.type === "response") {
      return {
        ...node,
        data: {
          ...(node.data as ResponseData),
          result: String(output.result ?? JSON.stringify(output)),
        },
      };
    }

    return node;
  });
}

export function getConnectedSourceIds(
  nodeId: string,
  edges: WorkflowEdge[],
  targetHandle: string,
): string[] {
  return edges
    .filter(
      (edge) =>
        edge.target === nodeId && edge.targetHandle === targetHandle,
    )
    .map((edge) => edge.source);
}

export function isHandleConnected(
  nodeId: string,
  handleId: string,
  edges: WorkflowEdge[],
  direction: "source" | "target",
): boolean {
  return edges.some((edge) =>
    direction === "source"
      ? edge.source === nodeId && edge.sourceHandle === handleId
      : edge.target === nodeId && edge.targetHandle === handleId,
  );
}
