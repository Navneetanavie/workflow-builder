import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { Logo } from "@/components/logo";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  const displayName =
    dbUser?.firstName ??
    clerkUser.firstName ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "there";

  return (
    <div className="min-h-full bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
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

      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Welcome back, {displayName}
        </h1>
        <p className="mt-2 text-gray-600">
          Your dashboard is ready. Workflow creation and canvas features will
          be added here next.
        </p>
      </main>
    </div>
  );
}
