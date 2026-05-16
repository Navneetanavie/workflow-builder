import { auth } from "@clerk/nextjs/server";

import { createTransloaditSignature } from "@/lib/transloadit";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { params, signature } = createTransloaditSignature();

    return Response.json({ params, signature });
  } catch (error) {
    console.error("Transloadit params error:", error);
    return Response.json(
      { error: "Failed to create upload credentials" },
      { status: 500 },
    );
  }
}
