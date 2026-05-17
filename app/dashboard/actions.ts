"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDbUser } from "@/lib/get-db-user";
import { prisma } from "@/lib/prisma";
import { createInitialDefinition } from "@/lib/workflow/defaults";
import { DEFAULT_WORKFLOW_THUMBNAIL } from "@/lib/workflow-defaults";

async function requireDbUser() {
  const user = await getDbUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function createWorkflow() {
  const user = await requireDbUser();

  const workflow = await prisma.workflow.create({
    data: {
      name: "Untitled workflow",
      thumbnailUrl: DEFAULT_WORKFLOW_THUMBNAIL,
      definition: createInitialDefinition() as object,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/workflows/${workflow.id}`);
}

export async function renameWorkflow(id: string, name: string) {
  const user = await requireDbUser();
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Name is required");
  }

  await prisma.workflow.updateMany({
    where: { id, userId: user.id },
    data: { name: trimmed },
  });

  revalidatePath("/dashboard");
}

export async function duplicateWorkflow(id: string) {
  const user = await requireDbUser();

  const source = await prisma.workflow.findFirst({
    where: { id },
  });

  if (!source) {
    throw new Error("Workflow not found");
  }

  await prisma.workflow.create({
    data: {
      name: `${source.name} (copy)`,
      thumbnailUrl: source.thumbnailUrl,
      definition: (source.definition ?? createInitialDefinition()) as object,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
}

export async function deleteWorkflow(id: string) {
  const user = await requireDbUser();

  await prisma.workflow.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/dashboard");
}

export async function updateWorkflowThumbnail(id: string, thumbnailUrl: string) {
  const user = await requireDbUser();
  const trimmed = thumbnailUrl.trim();
  if (!trimmed) {
    throw new Error("Thumbnail URL is required");
  }

  await prisma.workflow.updateMany({
    where: { id, userId: user.id },
    data: { thumbnailUrl: trimmed },
  });

  revalidatePath("/dashboard");
}

export async function getWorkflowForExport(id: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      thumbnailUrl: true,
      definition: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  return workflow;
}

export async function importWorkflow(name: string, definition: object) {
  const user = await requireDbUser();

  const workflow = await prisma.workflow.create({
    data: {
      name: name || "Imported workflow",
      thumbnailUrl: DEFAULT_WORKFLOW_THUMBNAIL,
      definition: definition || (createInitialDefinition() as object),
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/workflows/${workflow.id}`);
}
