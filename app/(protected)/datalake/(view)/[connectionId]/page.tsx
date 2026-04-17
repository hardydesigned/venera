"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileList } from "../_components/FileList";
import { useDataLakeConnection } from "@/app/(protected)/datalake/_controller/useDataLake";
import { useDataLakeConnections } from "@/app/(protected)/datalake/_controller/useDataLake";
import type { Id } from "@/convex/_generated/dataModel";
import { PROVIDER_LABELS } from "@/convex/datalake/_model/connection";

interface PageProps {
  params: Promise<{ connectionId: string }>;
}

export default function ConnectionDetailPage({ params }: PageProps) {
  const { connectionId } = use(params);
  const id = connectionId as Id<"dataLakeConnections">;
  const { connection, items, isLoading } = useDataLakeConnection(id);
  const { sync } = useDataLakeConnections();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    const { synced, error } = await sync(id);
    setIsSyncing(false);
    if (error) {
      toast.error(`Synchronisation fehlgeschlagen: ${error.message}`);
    } else {
      toast.success(`${synced ?? 0} Dateien synchronisiert`);
    }
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/datalake">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                {connection?.name ?? "Verbindung"}
              </h1>
              {connection && (
                <Badge variant="secondary">
                  {PROVIDER_LABELS[connection.provider]}
                </Badge>
              )}
            </div>
            {connection?.lastSyncAt && (
              <p className="text-sm text-muted-foreground">
                Zuletzt synchronisiert:{" "}
                {new Date(connection.lastSyncAt).toLocaleString("de-DE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>
        </div>
        <Button onClick={handleSync} disabled={isSyncing} variant="outline">
          {isSyncing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {isSyncing ? "Synchronisiert..." : "Synchronisieren"}
        </Button>
      </div>

      <FileList items={items} isLoading={isLoading} />
    </section>
  );
}
