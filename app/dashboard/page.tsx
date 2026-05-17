import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { WorkflowsDashboard } from "@/components/dashboard/workflows-dashboard";
import { Logo } from "@/components/logo";
import { getDbUser } from "@/lib/get-db-user";
import { prisma } from "@/lib/prisma";
import type { WorkflowListItem } from "@/types/workflow";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getDbUser();
  if (!dbUser) {
    redirect("/sign-in");
  }

  const workflows = await prisma.workflow.findMany({
    where: { userId: dbUser.id },
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  const workflowItems: WorkflowListItem[] = workflows.map((workflow) => ({
    id: workflow.id,
    name: workflow.name,
    thumbnailUrl: workflow.thumbnailUrl,
    definition: workflow.definition,
    updatedAt: workflow.updatedAt,
    user: workflow.user,
  }));

  return (
    <DashboardShell>
      <WorkflowsDashboard
        workflows={workflowItems}
        currentUserId={dbUser.id}
      />
    </DashboardShell>

  );
}
