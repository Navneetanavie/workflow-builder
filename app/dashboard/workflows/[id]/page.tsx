import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Logo } from "@/components/logo";
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
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!workflow) {
    notFound();
  }

  const ownerName =
    workflow.user.firstName ??
    workflow.user.email.split("@")[0] ??
    "Unknown";

  return (
    <div className="min-h-full bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <Logo className="size-8 rounded-md" />
            <span className="font-semibold text-gray-900">{workflow.name}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-gray-900">{workflow.name}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Created by {ownerName}. The canvas editor will be built here next.
        </p>
      </main>
    </div>
  );
}
