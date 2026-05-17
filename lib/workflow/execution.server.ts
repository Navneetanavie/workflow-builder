import "server-only";

import { configure, runs, tasks } from "@trigger.dev/sdk/v3";

const triggerSecretKey =
  process.env.TRIGGER_SECRET_KEY ??
  process.env.TRIGGER_DEV_API_KEY ??
  process.env.TRIGGER_API_KEY;

if (triggerSecretKey) {
  configure({
    accessToken: triggerSecretKey,
    baseURL: process.env.TRIGGER_API_URL ?? "https://api.trigger.dev",
  });
}

import { geminiJob, type GeminiJobResult } from "@/lib/gemini/gemini-job";
import { formatGeminiErrorResponse } from "@/lib/gemini/format-error";
import {
  runGeminiPipeline,
  type GeminiJobPayload,
} from "@/lib/gemini/gemini-pipeline";
import { cropImageJob, type CropJobResult } from "@/lib/image-cropping/crop-job";
import {
  runCropImagePipeline,
  type CropJobPayload,
} from "@/lib/image-cropping/crop-pipeline";
import { getExecutionLevels } from "@/lib/workflow/dag";
import {
  applyOutputsToNodes,
  executeNodeStub,
  pickImageUrl,
  pickImageUrls,
  resolveInputs,
  seedOutputsFromNodeState,
  type NodeExecutionResult,
  type NodeRunInput,
  type NodeRunOutput,
} from "@/lib/workflow/execution";
import type {
  CropImageData,
  GeminiData,
  GeminiSettings,
  WorkflowEdge,
  WorkflowNode,
} from "@/lib/workflow/types";
import { DEFAULT_GEMINI_SETTINGS } from "@/lib/workflow/types";

export { applyOutputsToNodes };

const CROP_POLL_INTERVAL_MS = 2_000;
/** Crop task waits ≥30s; allow extra time for FFmpeg + Transloadit upload. */
const CROP_POLL_MAX_WAIT_MS = 180_000;

const GEMINI_POLL_INTERVAL_MS = 2_000;
const GEMINI_POLL_MAX_WAIT_MS = 180_000;
/** How long to wait for a Trigger.dev worker before running the pipeline on the server. */
const WORKER_GRACE_MS = 10_000;

const WAITING_FOR_WORKER_STATUSES = new Set([
  "PENDING_VERSION",
  "QUEUED",
  "DELAYED",
  "DEQUEUED",
]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isWaitingForWorker(status: string) {
  return WAITING_FOR_WORKER_STATUSES.has(status);
}

function cropPayloadFromNode(
  node: WorkflowNode,
  inputs: NodeRunInput,
): CropJobPayload {
  const data = node.data as CropImageData;
  const imageUrl =
    pickImageUrl(inputs["Input Image"]) ?? data.inputImageUrl?.trim() ?? "";

  return {
    imageUrl,
    xPercent: Number(inputs["X Position (%)"] ?? data.x ?? 0),
    yPercent: Number(inputs["Y Position (%)"] ?? data.y ?? 0),
    widthPercent: Number(inputs["Width (%)"] ?? data.width ?? 100),
    heightPercent: Number(inputs["Height (%)"] ?? data.height ?? 100),
  };
}

function cropOutputToNodeOutput(
  output: CropJobResult,
  jobId?: string,
): NodeRunOutput {
  if (!output.success || !output.croppedImageUrl) {
    throw new Error(output.error ?? output.message ?? "Crop task failed");
  }

  return {
    image: output.croppedImageUrl,
    url: output.croppedImageUrl,
    jobId,
    message: output.message,
  };
}

async function waitForCropRun(runId: string) {
  const started = Date.now();
  let run = await runs.retrieve(runId);

  while (!run.isCompleted && Date.now() - started < CROP_POLL_MAX_WAIT_MS) {
    await sleep(CROP_POLL_INTERVAL_MS);
    run = await runs.retrieve(runId);
  }

  if (!run.isCompleted) {
    throw new Error(
      `Crop job timed out after ${Math.round((Date.now() - started) / 1000)}s (status: ${run.status}). ` +
        `Start the Trigger.dev worker: npm run trigger:dev — or the server will run the crop inline after ${WORKER_GRACE_MS / 1000}s if the job stays queued.`,
    );
  }

  return run;
}

async function executeCropImageNode(
  node: WorkflowNode,
  inputs: NodeRunInput,
): Promise<NodeRunOutput> {
  const payload = cropPayloadFromNode(node, inputs);
  if (!payload.imageUrl) {
    throw new Error("Input Image is required");
  }

  const handle = await tasks.trigger(cropImageJob.id, payload);

  await sleep(WORKER_GRACE_MS);
  let run = await runs.retrieve(handle.id);

  if (!run.isCompleted && isWaitingForWorker(run.status)) {
    try {
      await runs.cancel(handle.id);
    } catch {
      // Best-effort cancel of the queued cloud run.
    }

    console.warn(
      `[crop-image] Trigger.dev worker not processing runs (status: ${run.status}). Running crop pipeline on the server.`,
    );
    const output = await runCropImagePipeline(payload);
    return cropOutputToNodeOutput(output, `inline-${Date.now()}`);
  }

  run = await waitForCropRun(handle.id);

  if (run.isFailed || !run.isSuccess) {
    throw new Error(run.error?.message ?? "Crop task failed");
  }

  return cropOutputToNodeOutput(run.output as CropJobResult, run.id);
}

function mergeGeminiSettings(settings?: GeminiSettings): GeminiSettings {
  return { ...DEFAULT_GEMINI_SETTINGS, ...settings };
}

function geminiPayloadFromNode(
  node: WorkflowNode,
  inputs: NodeRunInput,
): GeminiJobPayload {
  const data = node.data as GeminiData;
  const settings = mergeGeminiSettings(data.settings);

  return {
    prompt: String(inputs.Prompt ?? data.prompt ?? "").trim(),
    systemPrompt: String(
      inputs["System Prompt"] ?? data.systemPrompt ?? "",
    ).trim(),
    imageUrls: pickImageUrls(inputs["Image (Vision)"]),
    settings,
  };
}

function geminiErrorNodeOutput(
  message: string,
  payload: GeminiJobPayload,
  jobId?: string,
): NodeRunOutput {
  return {
    response: formatGeminiErrorResponse(message, payload),
    text: null,
    error: true,
    jobId,
  };
}

function geminiOutputToNodeOutput(
  output: GeminiJobResult,
  payload: GeminiJobPayload,
  jobId?: string,
): NodeRunOutput {
  if (!output.success || !output.text) {
    return geminiErrorNodeOutput(
      output.error ?? output.message ?? "Gemini task failed",
      payload,
      jobId,
    );
  }

  return {
    response: output.text,
    text: output.text,
    jobId,
    message: output.message,
  };
}

async function waitForGeminiRun(runId: string) {
  const started = Date.now();
  let run = await runs.retrieve(runId);

  while (!run.isCompleted && Date.now() - started < GEMINI_POLL_MAX_WAIT_MS) {
    await sleep(GEMINI_POLL_INTERVAL_MS);
    run = await runs.retrieve(runId);
  }

  if (!run.isCompleted) {
    throw new Error(
      `Gemini job timed out after ${Math.round((Date.now() - started) / 1000)}s (status: ${run.status}). ` +
        `Start the Trigger.dev worker: npm run trigger:dev — or the server will run Gemini inline after ${WORKER_GRACE_MS / 1000}s if the job stays queued.`,
    );
  }

  return run;
}

async function executeGeminiNode(
  node: WorkflowNode,
  inputs: NodeRunInput,
): Promise<NodeRunOutput> {
  const payload = geminiPayloadFromNode(node, inputs);

  if (!payload.prompt) {
    return geminiErrorNodeOutput("Prompt is required", payload);
  }

  try {
    const handle = await tasks.trigger(geminiJob.id, payload);

    await sleep(WORKER_GRACE_MS);
    let run = await runs.retrieve(handle.id);

    if (!run.isCompleted && isWaitingForWorker(run.status)) {
      try {
        await runs.cancel(handle.id);
      } catch {
        // Best-effort cancel of the queued cloud run.
      }

      console.warn(
        `[gemini] Trigger.dev worker not processing runs (status: ${run.status}). Running Gemini pipeline on the server.`,
      );
      const output = await runGeminiPipeline(payload);
      return geminiOutputToNodeOutput(output, payload, `inline-${Date.now()}`);
    }

    run = await waitForGeminiRun(handle.id);

    if (run.isFailed || !run.isSuccess) {
      return geminiErrorNodeOutput(
        run.error?.message ?? "Gemini task failed",
        payload,
        run.id,
      );
    }

    return geminiOutputToNodeOutput(
      run.output as GeminiJobResult,
      payload,
      run.id,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return geminiErrorNodeOutput(message, payload);
  }
}

export async function executeWorkflowGraph(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  targetNodeIds?: string[],
): Promise<{
  results: NodeExecutionResult[];
  nodeOutputs: Map<string, NodeRunOutput>;
}> {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const levels = getExecutionLevels(nodes, edges, targetNodeIds);
  const outputs = seedOutputsFromNodeState(nodes);
  const results: NodeExecutionResult[] = [];

  for (const level of levels) {
    for (const nodeId of level) {
      const node = nodeMap.get(nodeId);
      if (!node) continue;

      const inputs = resolveInputs(node, edges, outputs);
      const output =
        node.type === "cropImage"
          ? await executeCropImageNode(node, inputs)
          : node.type === "gemini"
            ? await executeGeminiNode(node, inputs)
            : executeNodeStub(node, inputs);

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
