import { prisma } from "../lib/prisma";

async function main() {
  // Find the active user
  const activeUser = await prisma.user.findFirst({
    where: { clerkId: "user_3Dkut8H4RWUS9nN41xYNNxtAWxd" },
  });

  if (!activeUser) {
    console.error("Active user not found!");
    return;
  }

  console.log(`Active user found: id="${activeUser.id}" email="${activeUser.email}"`);

  // Update all workflows to belong to the active user
  const result = await prisma.workflow.updateMany({
    data: {
      userId: activeUser.id,
    },
  });

  // Update all runs to belong to the active user
  const runResult = await prisma.workflowRun.updateMany({
    data: {
      userId: activeUser.id,
    },
  });

  console.log(`Successfully updated ${result.count} workflows and ${runResult.count} workflow runs to belong to the active user.`);
}

main().catch(console.error);
