"use client";

import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { AgentList } from "./_components/AgentList";
import { useAgents } from "../_controller/useAgents";
import type { Id } from "@/convex/_generated/dataModel";

export default function AgentenPage() {
  const { agents, remove, run, isLoading } = useAgents();
  const [deleteId, setDeleteId] = useState<Id<"aiAgents"> | null>(null);
  const [runningId, setRunningId] = useState<Id<"aiAgents"> | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await remove(deleteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Agent gelöscht");
    }
    setDeleteId(null);
  };

  const handleRun = async (id: Id<"aiAgents">) => {
    setRunningId(id);
    toast.info("Agent wird ausgeführt...");
    const result = await run(id);
    setRunningId(null);
    if (result.success) {
      toast.success("Agent erfolgreich ausgeführt");
    } else {
      toast.error("Fehler: " + (result.error ?? "Unbekannter Fehler"));
    }
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">KI-Agenten</h1>
          <p className="text-sm text-muted-foreground">
            Automatisierte KI-Assistenten für deine Daten
          </p>
        </div>
        <Link href="/agenten/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Agent
          </Button>
        </Link>
      </div>

      <AgentList
        agents={agents}
        onDelete={setDeleteId}
        onRun={handleRun}
        isLoading={isLoading}
        runningId={runningId}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Agent löschen"
        description="Soll dieser KI-Agent und alle seine Logs unwiderruflich gelöscht werden?"
      />
    </section>
  );
}
