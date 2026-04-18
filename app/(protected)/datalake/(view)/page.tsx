"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { ConnectionList } from "./_components/ConnectionList";
import { useDataLakeConnections } from "@/app/(protected)/datalake/_controller/useDataLake";
import type { Id } from "@/convex/_generated/dataModel";

export default function DataLakePage() {
  const { connections, remove, sync, isLoading } = useDataLakeConnections();
  const [deleteId, setDeleteId] = useState<Id<"dataLakeConnections"> | null>(null);
  const [syncingId, setSyncingId] = useState<Id<"dataLakeConnections"> | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await remove(deleteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Verbindung gelöscht");
    }
    setDeleteId(null);
  };

  const handleSync = async (id: Id<"dataLakeConnections">) => {
    setSyncingId(id);
    const { synced, error } = await sync(id);
    setSyncingId(null);
    if (error) {
      toast.error(`Synchronisation fehlgeschlagen: ${error.message}`);
    } else {
      toast.success(`${synced ?? 0} Dateien synchronisiert`);
    }
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Data Lake</h1>
          <p className="text-sm text-muted-foreground">
            Verbinde Nextcloud und andere Speicher-Dienste
          </p>
        </div>
        <Link href="/datalake/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Verbindung
          </Button>
        </Link>
      </div>

      <ConnectionList
        connections={connections}
        onDelete={setDeleteId}
        onSync={handleSync}
        syncingId={syncingId}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Verbindung löschen"
        description="Soll diese Verbindung wirklich gelöscht werden? Alle gecachten Dateien werden ebenfalls gelöscht."
      />
    </section>
  );
}
