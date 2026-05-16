import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { parseWorkflowDefinition } from "@/lib/workflow/defaults";
import { prisma } from "@/lib/prisma";

type WorkflowPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const workflow = await prisma.workflow.findUnique({
    where: { id },
  });

  if (!workflow) {
    notFound();
  }

  const definition = parseWorkflowDefinition(workflow.definition);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <WorkflowCanvas
        workflowId={workflow.id}
        workflowName={workflow.name}
        initialDefinition={definition}
      />
    </div>
  );
}
