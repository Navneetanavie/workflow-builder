"use client";

import type { NodeProps } from "@xyflow/react";
import { useReactFlow, useEdges } from "@xyflow/react";
import { Play } from "lucide-react";

import { BaseNode, FieldBlock } from "@/components/workflow/nodes/base-node";
import { GeminiSettingsPanel } from "@/components/workflow/nodes/gemini-settings";
import { NodeImageField } from "@/components/workflow/nodes/node-image-field";
import {
  outputBoxClassName,
  textareaClassName,
} from "@/components/workflow/nodes/node-styles";
import { useWorkflowNode } from "@/components/workflow/nodes/node-context";
import { isHandleConnected } from "@/lib/workflow/execution";
import type { GeminiData } from "@/lib/workflow/types";
import { DEFAULT_GEMINI_SETTINGS } from "@/lib/workflow/types";

type GeminiNodeProps = NodeProps & {
  onRunNode?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  isRunning?: boolean;
};

export function GeminiNode({
  id,
  data,
  onRunNode: propsOnRunNode,
  onDuplicate: propsOnDuplicate,
  onDelete: propsOnDelete,
  isRunning: propsIsRunning,
}: GeminiNodeProps) {
  const { onRunNode, onDuplicate, onDelete, runningNodeIds } = useWorkflowNode();
  const isRunning = propsIsRunning ?? runningNodeIds?.includes(id) ?? false;
  const { updateNodeData } = useReactFlow();
  const edges = useEdges();
  const raw = data as GeminiData;
  const nodeData: GeminiData = {
    ...raw,
    settings: raw.settings ?? DEFAULT_GEMINI_SETTINGS,
  };

  const setData = (patch: Partial<GeminiData>) => {
    updateNodeData(id, { ...nodeData, ...patch });
  };

  const connected = (handleId: string) =>
    isHandleConnected(id, handleId, edges, "target");

  const activeOnRunNode = propsOnRunNode ?? onRunNode;
  const activeOnDuplicate = propsOnDuplicate ?? onDuplicate;
  const activeOnDelete = propsOnDelete ?? onDelete;

  return (
    <BaseNode
      title="Gemini 3.1 Pro"
      showMenu
      isRunning={isRunning}
      onDuplicate={() => activeOnDuplicate?.(id)}
      onDelete={() => activeOnDelete?.(id)}
      headerRight={
        <button
          type="button"
          onClick={() => activeOnRunNode?.(id)}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <Play className="size-3 fill-current" />
          Run
        </button>
      }
    >
      <FieldBlock
        label="Prompt"
        required
        connected={connected("in-prompt")}
        port={{ id: "in-prompt", type: "target", dataType: "text" }}
      >
        <textarea
          value={nodeData.prompt}
          disabled={connected("in-prompt")}
          onChange={(e) => setData({ prompt: e.target.value })}
          rows={2}
          className={textareaClassName}
          placeholder="Enter your prompt..."
        />
      </FieldBlock>

      <FieldBlock
        label="System Prompt"
        connected={connected("in-system")}
        port={{ id: "in-system", type: "target", dataType: "text" }}
      >
        <textarea
          value={nodeData.systemPrompt}
          disabled={connected("in-system")}
          onChange={(e) => setData({ systemPrompt: e.target.value })}
          rows={2}
          className={textareaClassName}
          placeholder="You are a helpful assistant..."
        />
      </FieldBlock>

      <FieldBlock
        label="Image (Vision)"
        connected={connected("in-image")}
        port={{ id: "in-image", type: "target", dataType: "image" }}
      >
        <NodeImageField
          value={nodeData.imageVisionUrl}
          disabled={connected("in-image")}
          alt="Vision input"
          onChange={(url) => setData({ imageVisionUrl: url })}
        />
      </FieldBlock>

      <GeminiSettingsPanel
        open={nodeData.settingsOpen}
        settings={nodeData.settings ?? DEFAULT_GEMINI_SETTINGS}
        onToggle={() => setData({ settingsOpen: !nodeData.settingsOpen })}
        onChange={(patch) =>
          setData({
            settings: { ...nodeData.settings, ...patch },
          })
        }
      />

      <FieldBlock
        label="Response"
        port={{ id: "out-response", type: "source", dataType: "text" }}
      >
        <div className={outputBoxClassName}>
          {nodeData.response ?? "No output yet"}
        </div>
      </FieldBlock>
    </BaseNode>
  );
}
