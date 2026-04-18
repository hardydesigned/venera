import type { ReactNode } from "react";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "./_components/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const token = await convexAuthNextjsToken().catch(() => null);
  if (!token) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
