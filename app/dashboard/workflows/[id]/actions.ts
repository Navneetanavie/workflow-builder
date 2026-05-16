"use server";

import { revalidatePath } from "next/cache";

import { getDbUser } from "@/lib/get-db-user";
import { prisma } from "@/lib/prisma";
import {
  applyOutputsToNodes,
  executeWorkflowGraph,
} from "@/lib/workflow/execution";
import { parseWorkflowDefinition } from "@/lib/workflow/defaults";
import type { WorkflowDefinition } from "@/lib/workflow/types";

async function requireWorkflowAccess(workflowId: string) {
  const user = await getDbUser();
  if (!user) throw new Error("Unauthorized");

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow) throw new Error("Workflow not found");
  return { user, workflow };
}

export async function saveWorkflowDefinition(
  workflowId: string,
  definition: WorkflowDefinition,
) {
  await requireWorkflowAccess(workflowId);

  await prisma.workflow.update({
    where: { id: workflowId },
    data: { definition: definition as object },
  });
}

export async function runWorkflow(
  workflowId: string,
  nodeIds: string[] = [],
) {
  const { user, workflow } = await requireWorkflowAccess(workflowId);
  const definition = parseWorkflowDefinition(workflow.definition);
  const targetIds =
    nodeIds.length > 0
      ? nodeIds
      : definition.nodes.map((node) => node.id);

  const { results, nodeOutputs } = executeWorkflowGraph(
    definition.nodes,
    definition.edges,
    targetIds,
  );

  const updatedNodes = applyOutputsToNodes(definition.nodes, nodeOutputs);
  const nextDefinition: WorkflowDefinition = {
    ...definition,
    nodes: updatedNodes,
  };

  await prisma.workflow.update({
    where: { id: workflowId },
    data: { definition: nextDefinition as object },
  });

  const run = await prisma.workflowRun.create({
    data: {
      workflowId,
      userId: user.id,
      nodeIds: targetIds,
      status: "completed",
      entries: {
        create: results.map((result) => ({
          nodeId: result.nodeId,
          nodeType: result.nodeType,
          label: result.label,
          inputs: result.inputs as object,
          output: result.output as object,
          status: result.status,
          completedAt: new Date(),
        })),
      },
    },
    include: { entries: true },
  });

  revalidatePath(`/dashboard/workflows/${workflowId}`);

  return {
    runId: run.id,
    results,
    definition: nextDefinition,
  };
}

export async function getWorkflowHistory(workflowId: string) {
  await requireWorkflowAccess(workflowId);

  return prisma.workflowRun.findMany({
    where: { workflowId },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      entries: {
        orderBy: { startedAt: "asc" },
      },
    },
  });
}

export async function updateWorkflowName(workflowId: string, name: string) {
  await requireWorkflowAccess(workflowId);
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required");

  await prisma.workflow.update({
    where: { id: workflowId },
    data: { name: trimmed },
  });

  revalidatePath(`/dashboard/workflows/${workflowId}`);
  revalidatePath("/dashboard");
}
