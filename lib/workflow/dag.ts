import type { WorkflowEdge, WorkflowNode } from "@/lib/workflow/types";

export function getIncomingEdges(
  nodeId: string,
  edges: WorkflowEdge[],
): WorkflowEdge[] {
  return edges.filter((edge) => edge.target === nodeId);
}

export function getOutgoingEdges(
  nodeId: string,
  edges: WorkflowEdge[],
): WorkflowEdge[] {
  return edges.filter((edge) => edge.source === nodeId);
}

export function getAncestors(
  nodeId: string,
  edges: WorkflowEdge[],
): Set<string> {
  const ancestors = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of getIncomingEdges(current, edges)) {
      if (!ancestors.has(edge.source)) {
        ancestors.add(edge.source);
        queue.push(edge.source);
      }
    }
  }

  return ancestors;
}

export function wouldCreateCycle(
  edges: WorkflowEdge[],
  connection: { source: string; target: string },
): boolean {
  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    const list = adjacency.get(edge.source) ?? [];
    list.push(edge.target);
    adjacency.set(edge.source, list);
  }

  const list = adjacency.get(connection.source) ?? [];
  list.push(connection.target);
  adjacency.set(connection.source, list);

  const visited = new Set<string>();
  const stack = new Set<string>();

  const dfs = (nodeId: string): boolean => {
    if (stack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    stack.add(nodeId);

    for (const next of adjacency.get(nodeId) ?? []) {
      if (dfs(next)) return true;
    }

    stack.delete(nodeId);
    return false;
  };

  for (const nodeId of adjacency.keys()) {
    if (dfs(nodeId)) return true;
  }

  return false;
}

export function expandTargetNodeIds(
  targetNodeIds: string[],
  edges: WorkflowEdge[],
): string[] {
  const expanded = new Set(targetNodeIds);
  for (const targetId of targetNodeIds) {
    for (const ancestorId of getAncestors(targetId, edges)) {
      expanded.add(ancestorId);
    }
  }
  return [...expanded];
}

export function getExecutionLevels(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  targetNodeIds?: string[],
): string[][] {
  const nodeIds = new Set(
    targetNodeIds
      ? expandTargetNodeIds(targetNodeIds, edges)
      : nodes.map((node) => node.id),
  );
  const relevantEdges = edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );

  const inDegree = new Map<string, number>();
  const children = new Map<string, string[]>();

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    children.set(id, []);
  }

  for (const edge of relevantEdges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    children.get(edge.source)?.push(edge.target);
  }

  const levels: string[][] = [];
  let ready = [...nodeIds].filter((id) => (inDegree.get(id) ?? 0) === 0);

  while (ready.length > 0) {
    levels.push(ready);
    const nextReady: string[] = [];

    for (const id of ready) {
      for (const child of children.get(id) ?? []) {
        const degree = (inDegree.get(child) ?? 1) - 1;
        inDegree.set(child, degree);
        if (degree === 0) nextReady.push(child);
      }
    }

    ready = nextReady;
  }

  const scheduled = new Set(levels.flat());
  const remaining = [...nodeIds].filter((id) => !scheduled.has(id));
  if (remaining.length > 0) {
    throw new Error("Workflow contains a cycle");
  }

  return levels;
}
