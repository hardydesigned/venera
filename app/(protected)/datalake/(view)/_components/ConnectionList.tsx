"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, RefreshCw, Database, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import type { DataLakeConnection } from "@/convex/datalake/_model/connection";
import { PROVIDER_LABELS } from "@/convex/datalake/_model/connection";

interface ConnectionListProps {
  connections: DataLakeConnection[];
  onDelete: (id: Id<"dataLakeConnections">) => void;
  onSync: (id: Id<"dataLakeConnections">) => void;
  syncingId: Id<"dataLakeConnections"> | null;
  isLoading: boolean;
}

export function ConnectionList({
  connections,
  onDelete,
  onSync,
  syncingId,
  isLoading,
}: ConnectionListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <Database className="h-12 w-12 text-muted-foreground" />
          <p className="font-medium">Keine Speicher-Verbindungen</p>
          <p className="text-sm text-muted-foreground">
            Füge eine Nextcloud- oder andere Storage-Verbindung hinzu.
          </p>
          <Link href="/datalake/new">
            <Button>Verbindung hinzufügen</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {connections.map((conn) => {
        const isSyncing = syncingId === conn._id;
        return (
          <Card key={conn._id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold leading-none">{conn.name}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {PROVIDER_LABELS[conn.provider]}
                  </Badge>
                  {conn.lastSyncAt && (
                    <p className="text-xs text-muted-foreground">
                      Sync:{" "}
                      {new Date(conn.lastSyncAt).toLocaleString("de-DE", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/datalake/${conn._id}`}>Dateien anzeigen</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(conn._id)}
                      className="text-destructive"
                    >
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={isSyncing}
                  onClick={() => onSync(conn._id)}
                >
                  {isSyncing ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-3 w-3" />
                  )}
                  {isSyncing ? "Synchronisiert..." : "Synchronisieren"}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/datalake/${conn._id}`}>Öffnen</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
