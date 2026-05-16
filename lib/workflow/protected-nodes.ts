import { PROTECTED_NODE_IDS } from "@/lib/workflow/types";

export function isProtectedNodeId(id: string): boolean {
  return PROTECTED_NODE_IDS.has(id);
}

export function isProtectedWorkflowNode(node: {
  id: string;
  type?: string;
}): boolean {
  return (
    isProtectedNodeId(node.id) ||
    node.type === "requestInputs" ||
    node.type === "response"
  );
}

export function isProtectedNodeRemove(id: string, nodes: { id: string; type?: string }[]): boolean {
  if (isProtectedNodeId(id)) return true;
  const node = nodes.find((n) => n.id === id);
  return node ? isProtectedWorkflowNode(node) : false;
}

export function withNodeProtection<T extends { id: string; type?: string; deletable?: boolean }>(
  node: T,
): T {
  return {
    ...node,
    deletable: isProtectedWorkflowNode(node) ? false : node.deletable !== false,
  };
}
