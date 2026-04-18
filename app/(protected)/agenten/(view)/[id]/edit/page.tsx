"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { AgentForm } from "../../_components/AgentForm";
import { useAgents, useAgent } from "../../../_controller/useAgents";
import { useDataLakeConnections } from "@/app/(protected)/datalake/_controller/useDataLake";
import type { Id } from "@/convex/_generated/dataModel";
import type { CreateAgent } from "@/convex/agents/_model/agent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditAgentPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const agentId = id as Id<"aiAgents">;
  const { agent, isLoading: agentLoading } = useAgent(agentId);
  const { update, isLoading } = useAgents();
  const { connections: dataLakeConnections } = useDataLakeConnections();

  const handleSubmit = async (data: CreateAgent) => {
    const { error } = await update(agentId, data);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Agent gespeichert");
    router.push(`/agenten/${id}`);
  };

  if (agentLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Agent nicht gefunden</p>
        <Link href="/agenten"><Button variant="outline">Zurück</Button></Link>
      </div>
    );
  }

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href={`/agenten/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Agent bearbeiten</h1>
          <p className="text-sm text-muted-foreground">{agent.name}</p>
        </div>
      </div>
      <AgentForm
        agent={agent}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        dataLakeConnections={dataLakeConnections}
      />
    </section>
  );
}
