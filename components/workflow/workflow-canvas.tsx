"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getWorkflowHistory,
  runWorkflow,
  saveWorkflowDefinition,
} from "@/app/dashboard/workflows/[id]/actions";
import { DeletableEdge } from "@/components/workflow/edges/deletable-edge";
import { HistoryPanel } from "@/components/workflow/history-panel";
import { NodePicker } from "@/components/workflow/node-picker";
import { CropImageNode } from "@/components/workflow/nodes/crop-image-node";
import { GeminiNode } from "@/components/workflow/nodes/gemini-node";
import { RequestInputsNode } from "@/components/workflow/nodes/request-inputs-node";
import { ResponseNode } from "@/components/workflow/nodes/response-node";
import { WorkflowHeader } from "@/components/workflow/workflow-header";
import { WorkflowNodeContext } from "@/components/workflow/nodes/node-context";
import { wouldCreateCycle } from "@/lib/workflow/dag";
import {
  createCropImageNode,
  createGeminiNode,
} from "@/lib/workflow/defaults";
import { buildEdgeFromConnection } from "@/lib/workflow/edge-styles";
import {
  getSourceHandleMeta,
  getTargetHandleMeta,
  isTypeCompatible,
} from "@/lib/workflow/handles";
import type {
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowNode,
} from "@/lib/workflow/types";
import {
  isProtectedNodeRemove,
  isProtectedWorkflowNode,
  withNodeProtection,
} from "@/lib/workflow/protected-nodes";

type WorkflowCanvasProps = {
  workflowId: string;
  workflowName: string;
  initialDefinition: WorkflowDefinition;
};

const edgeTypes = { deletable: DeletableEdge };
const nodeTypes = {
  requestInputs: RequestInputsNode,
  cropImage: CropImageNode,
  gemini: GeminiNode,
  response: ResponseNode,
};

function WorkflowCanvasInner({
  workflowId,
  workflowName,
  initialDefinition,
}: WorkflowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (initialDefinition.nodes as Node[]).map((node) =>
      withNodeProtection(node),
    ),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    (initialDefinition.edges as Edge[]).map((edge) => ({
      ...edge,
      type: "deletable" as const,
    })),
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<
    Awaited<ReturnType<typeof getWorkflowHistory>>
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runningNodeIds, setRunningNodeIds] = useState<string[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    (nextNodes: Node[], nextEdges: Edge[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveWorkflowDefinition(workflowId, {
          nodes: nextNodes as WorkflowNode[],
          edges: nextEdges as WorkflowEdge[],
        });
      }, 800);
    },
    [workflowId],
  );

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  const edgesSignature = useMemo(() => {
    return edges
      .map((e) => `${e.id}:${e.source}:${e.target}:${e.sourceHandle}:${e.targetHandle}`)
      .join("|");
  }, [edges]);

  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    persist(nodesRef.current, edgesRef.current);
  }, [edgesSignature, persist]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const filtered = changes.filter(
        (change) =>
          change.type !== "remove" || !isProtectedNodeRemove(change.id, nodes),
      );
      onNodesChange(filtered);
    },
    [nodes, onNodesChange],
  );

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node || isProtectedWorkflowNode(node)) return;

      const clone: Node = {
        ...node,
        id: `${node.type}-${crypto.randomUUID().slice(0, 8)}`,
        position: {
          x: node.position.x + 48,
          y: node.position.y + 48,
        },
        selected: false,
        data: structuredClone(node.data),
      };
      setNodes((nds) => [...nds, clone]);
    },
    [nodes, setNodes],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node || isProtectedWorkflowNode(node)) return;
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
      );
    },
    [setNodes, setEdges, nodes],
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return false;

      const sourceMeta = getSourceHandleMeta(
        sourceNode as WorkflowNode,
        connection.sourceHandle,
      );
      const targetMeta = getTargetHandleMeta(
        targetNode as WorkflowNode,
        connection.targetHandle,
      );
      if (!sourceMeta || !targetMeta) return false;
      if (!isTypeCompatible(sourceMeta.dataType, targetMeta.dataType)) {
        return false;
      }

      return !wouldCreateCycle(edges as WorkflowEdge[], {
        source: connection.source!,
        target: connection.target!,
      });
    },
    [nodes, edges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const edgeStyle = buildEdgeFromConnection(
        connection,
        nodes as WorkflowNode[],
      );
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "deletable",
            ...edgeStyle,
          },
          eds,
        ),
      );
    },
    [nodes, setEdges],
  );

  const onBeforeDelete = useCallback(
    async ({
      nodes: toDelete,
      edges: edgesToDelete,
    }: {
      nodes: Node[];
      edges: Edge[];
    }) => {
      return {
        nodes: toDelete.filter((node) => !isProtectedWorkflowNode(node)),
        edges: edgesToDelete,
      };
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON" ||
        target.isContentEditable
      ) {
        return;
      }

      const hasSelection =
        nodes.some((n) => n.selected) || edges.some((e) => e.selected);
      if (!hasSelection) return;

      event.preventDefault();
      event.stopPropagation();

      setNodes((nds) =>
        nds.filter(
          (node) => !node.selected || isProtectedWorkflowNode(node),
        ),
      );
      setEdges((eds) => eds.filter((edge) => !edge.selected));
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [nodes, edges, setNodes, setEdges]);

  const handleRun = useCallback(
    async (nodeIds: string[] = []) => {
      const targets = nodeIds.length > 0 ? nodeIds : nodes.map((n) => n.id);
      setRunningNodeIds(targets);
      setIsRunning(true);
      try {
        const result = await runWorkflow(workflowId, nodeIds);
        setNodes(
          (result.definition.nodes as Node[]).map((node) =>
            withNodeProtection(node),
          ),
        );
        const nextHistory = await getWorkflowHistory(workflowId);
        setHistory(nextHistory);
      } finally {
        setIsRunning(false);
        setRunningNodeIds([]);
      }
    },
    [workflowId, setNodes, nodes],
  );

  const handleRunNode = useCallback(
    (nodeId: string) => {
      const selected = nodes.filter((n) => n.selected).map((n) => n.id);
      const targets =
        selected.length > 1 && selected.includes(nodeId)
          ? selected
          : [nodeId];
      void handleRun(targets);
    },
    [handleRun, nodes],
  );

  const addNode = useCallback(
    (type: "cropImage" | "gemini") => {
      const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      const node =
        type === "cropImage"
          ? createCropImageNode(position)
          : createGeminiNode(position);
      setNodes((nds) => [...nds, node as Node]);
    },
    [screenToFlowPosition, setNodes],
  );



  const loadHistory = useCallback(async () => {
    const data = await getWorkflowHistory(workflowId);
    setHistory(data);
    setHistoryOpen(true);
  }, [workflowId]);

  return (
    <WorkflowNodeContext.Provider
      value={{
        onRunNode: handleRunNode,
        onDuplicate: duplicateNode,
        onDelete: deleteNode,
        runningNodeIds,
      }}
    >
      <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-[#ececee]">
        <WorkflowHeader
          workflowName={workflowName}
          isRunning={isRunning}
          onRunAll={() => void handleRun()}
          onOpenHistory={() => void loadHistory()}
        />

        <div className="relative flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            nodesDraggable
            nodesConnectable
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onBeforeDelete={onBeforeDelete}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode={null}
            edgesReconnectable
            elementsSelectable
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={18}
              size={1.2}
              color="#b8b8bc"
            />
            <Controls position="bottom-left" showInteractive={false} />
            <MiniMap
              position="bottom-right"
              pannable
              zoomable
              className="!rounded-lg !border !border-gray-200 !bg-white"
            />
          </ReactFlow>

          <NodePicker onAdd={addNode} />
        </div>

        <HistoryPanel
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          runs={history}
        />
      </div>
    </WorkflowNodeContext.Provider>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
