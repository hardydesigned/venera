"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AgentForm } from "../_components/AgentForm";
import { useAgents } from "../../_controller/useAgents";
import { useDataLakeConnections } from "@/app/(protected)/datalake/_controller/useDataLake";
import type { CreateAgent } from "@/convex/agents/_model/agent";

export default function NewAgentPage() {
  const router = useRouter();
  const { create, isLoading } = useAgents();
  const { connections: dataLakeConnections } = useDataLakeConnections();

  const handleSubmit = async (data: CreateAgent) => {
    const { error } = await create(data);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Agent erstellt");
    router.push("/agenten");
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/agenten">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Neuer KI-Agent</h1>
        </div>
      </div>
      <AgentForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        dataLakeConnections={dataLakeConnections}
      />
    </section>
  );
}
