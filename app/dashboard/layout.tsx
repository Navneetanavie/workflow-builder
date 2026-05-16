import { syncUserFromClerk } from "@/lib/sync-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await syncUserFromClerk();

  return <>{children}</>;
}
