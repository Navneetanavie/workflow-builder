import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { syncUserFromClerk } from "@/lib/sync-user";

export async function getDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!dbUser) {
    dbUser = await syncUserFromClerk();
  }

  return dbUser;
}
