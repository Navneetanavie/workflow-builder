import type { Prisma } from "@prisma/client";

export type WorkflowListItem = {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  definition: Prisma.JsonValue;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

export type WorkflowExportPayload = {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  definition: Prisma.JsonValue;
  createdAt: string;
  updatedAt: string;
};
