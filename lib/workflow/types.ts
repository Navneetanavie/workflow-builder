import type { Edge, Node, Viewport } from "@xyflow/react";

export type PortDataType = "text" | "image" | "any";

export type RequestFieldType = "text" | "image";

export type RequestField = {
  id: string;
  name: string;
  type: RequestFieldType;
  value: string;
};

export type RequestInputsData = {
  fields: RequestField[];
};

export type CropImageData = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  inputImageUrl: string;
  outputUrl: string | null;
  lastResponse: string | null;
};

export type GeminiSettings = {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  frequencyPenalty: number;
  presencePenalty: number;
  repetitionPenalty: number;
  minP: number;
  topA: number;
  seed: number;
  reasoning: boolean;
  stopSequences: string;
};

export type GeminiData = {
  label: string;
  prompt: string;
  systemPrompt: string;
  imageVisionUrl: string;
  settingsOpen: boolean;
  settings: GeminiSettings;
  response: string | null;
};

export type ResponseData = {
  result: string | null;
  upstreamLabels: string[];
};

export type WorkflowNodeData =
  | RequestInputsData
  | CropImageData
  | GeminiData
  | ResponseData;

export type WorkflowNodeType =
  | "requestInputs"
  | "cropImage"
  | "gemini"
  | "response";

export type WorkflowNode = Node<WorkflowNodeData, WorkflowNodeType>;
export type WorkflowEdge = Edge;

export type WorkflowDefinition = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  viewport?: Viewport;
};

export type HandleMeta = {
  dataType: PortDataType;
  label: string;
};

export const PROTECTED_NODE_IDS = new Set(["request-inputs", "response"]);

export const DEFAULT_GEMINI_SETTINGS: GeminiSettings = {
  temperature: 0.7,
  maxTokens: 1024,
  topP: 1,
  topK: 40,
  frequencyPenalty: 0,
  presencePenalty: 0,
  repetitionPenalty: 0,
  minP: 0,
  topA: 0,
  seed: 0,
  reasoning: false,
  stopSequences: "",
};
