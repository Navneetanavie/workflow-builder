import { withNodeProtection } from "@/lib/workflow/protected-nodes";
import type {
  CropImageData,
  GeminiData,
  RequestField,
  RequestInputsData,
  ResponseData,
  WorkflowDefinition,
  WorkflowNode,
} from "@/lib/workflow/types";
import { DEFAULT_GEMINI_SETTINGS } from "@/lib/workflow/types";

const DEFAULT_REQUEST_FIELDS: RequestField[] = [
  {
    id: "text_field",
    name: "Car prompt",
    type: "text",
    value: "",
  },
];

export function createRequestInputsNode(
  position = { x: 80, y: 220 },
): WorkflowNode {
  return {
    id: "request-inputs",
    type: "requestInputs",
    position,
    deletable: false,
    selectable: true,
    data: { fields: DEFAULT_REQUEST_FIELDS } satisfies RequestInputsData,
  };
}

export function createResponseNode(position = { x: 1100, y: 220 }): WorkflowNode {
  return {
    id: "response",
    type: "response",
    position,
    deletable: false,
    selectable: true,
    data: {
      result: null,
      upstreamLabels: [],
    } satisfies ResponseData,
  };
}

export function createInitialDefinition(): WorkflowDefinition {
  return {
    nodes: [createRequestInputsNode(), createResponseNode()],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 0.85 },
  };
}

export function createCropImageNode(position: {
  x: number;
  y: number;
}): WorkflowNode {
  const id = `crop-${crypto.randomUUID().slice(0, 8)}`;
  return {
    id,
    type: "cropImage",
    position,
    data: {
      label: "Crop Image",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      inputImageUrl: "",
      outputUrl: null,
      lastResponse: null,
    } satisfies CropImageData,
  };
}

export function createGeminiNode(position: {
  x: number;
  y: number;
}): WorkflowNode {
  const id = `gemini-${crypto.randomUUID().slice(0, 8)}`;
  return {
    id,
    type: "gemini",
    position,
    data: {
      label: "Gemini 3.1 Pro",
      prompt: "",
      systemPrompt: "You are a helpful assistant...",
      imageVisionUrl: "",
      settingsOpen: false,
      settings: DEFAULT_GEMINI_SETTINGS,
      response: null,
    } satisfies GeminiData,
  };
}

export function parseWorkflowDefinition(raw: unknown): WorkflowDefinition {
  if (!raw || typeof raw !== "object") {
    return createInitialDefinition();
  }

  const value = raw as Partial<WorkflowDefinition>;
  const nodes =
    Array.isArray(value.nodes) && value.nodes.length > 0
      ? value.nodes
      : createInitialDefinition().nodes;

  const hasRequest = nodes.some((node) => node.id === "request-inputs");
  const hasResponse = nodes.some((node) => node.id === "response");

  const normalizedNodes = [
    ...nodes.map((node) => withNodeProtection(node)),
    ...(hasRequest ? [] : [createRequestInputsNode()]),
    ...(hasResponse ? [] : [createResponseNode()]),
  ];

  return {
    nodes: normalizedNodes,
    edges: Array.isArray(value.edges) ? value.edges : [],
    viewport: value.viewport,
  };
}
