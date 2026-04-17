"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, EllipsisVertical, Loader2, Play } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import type { AIAgent } from "@/convex/agents/_model/agent";
import { SCHEDULE_OPTIONS } from "@/convex/agents/_model/agent";

interface AgentListProps {
  agents: AIAgent[];
  onDelete: (id: Id<"aiAgents">) => void;
  onRun: (id: Id<"aiAgents">) => void;
  isLoading: boolean;
  runningId: Id<"aiAgents"> | null;
}

function scheduleLabel(schedule?: string): string {
  const opt = SCHEDULE_OPTIONS.find((o) => o.value === (schedule ?? ""));
  return opt?.label ?? schedule ?? "Manuell";
}

export function AgentList({ agents, onDelete, onRun, isLoading, runningId }: AgentListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <Bot className="h-12 w-12 text-muted-foreground" />
          <p className="font-medium">Keine KI-Agenten vorhanden</p>
          <Link href="/agenten/new">
            <Button>Agent erstellen</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent._id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <Bot className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <Link href={`/agenten/${agent._id}`}>
                      <h3 className="font-semibold leading-tight truncate hover:underline">
                        {agent.name}
                      </h3>
                    </Link>
                    {agent.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {agent.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant={agent.isActive ? "default" : "secondary"}>
                        {agent.isActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {scheduleLabel(agent.schedule)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onRun(agent._id)}
                      disabled={runningId === agent._id}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Jetzt ausführen
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/agenten/${agent._id}`}>Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/agenten/${agent._id}/edit`}>Bearbeiten</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(agent._id)}
                    >
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {agent.lastRunAt && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Zuletzt ausgeführt: {new Date(agent.lastRunAt).toLocaleString("de-DE")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
