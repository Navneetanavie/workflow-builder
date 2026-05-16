import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { WorkflowsDashboard } from "@/components/dashboard/workflows-dashboard";
import { Logo } from "@/components/logo";
import { getDbUser } from "@/lib/get-db-user";
import { prisma } from "@/lib/prisma";
import type { WorkflowListItem } from "@/types/workflow";

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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Logo className="size-8 rounded-md" />
            <span className="font-semibold text-gray-900">Magica</span>
          </div>
          <SignOutButton>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </SignOutButton>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <WorkflowsDashboard
          workflows={workflowItems}
          currentUserId={dbUser.id}
        />
      </main>
    </div>
  );
}
