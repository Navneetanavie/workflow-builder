import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

type ClerkUserPayload = {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string;
};

export async function syncUserFromClerk() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  return upsertUser({
    id: user.id,
    email_addresses: [{ email_address: email }],
    first_name: user.firstName,
    last_name: user.lastName,
    image_url: user.imageUrl,
  });
}

export async function upsertUser(data: ClerkUserPayload) {
  const email = data.email_addresses[0]?.email_address;

  if (!email) return null;

  return prisma.user.upsert({
    where: {
      email,
    },
    create: {
      clerkId: data.id,
      email,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
    },
    update: {
      clerkId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
    },
  });
}
export async function deleteUserByClerkId(clerkId: string) {
  return prisma.user.deleteMany({ where: { clerkId } });
}
