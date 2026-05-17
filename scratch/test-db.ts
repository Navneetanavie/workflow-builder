import { prisma } from "../lib/prisma";

async function main() {
  const workflows = await prisma.workflow.findMany({
    include: {
      user: true,
    },
  });
  console.log("Found workflows count:", workflows.length);
  for (const w of workflows) {
    console.log(`Workflow: ID="${w.id}" Name="${w.name}" userId="${w.userId}" user.id="${w.user?.id}" user.clerkId="${w.user?.clerkId}"`);
  }
}

main().catch(console.error);
