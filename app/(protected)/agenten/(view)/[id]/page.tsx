"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Loader2, Play, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAgent, useAgents } from "../../_controller/useAgents";
import type { Id } from "@/convex/_generated/dataModel";
import type { AgentLog } from "@/convex/agents/_model/agent";

function LogStatusIcon({ status }: { status: AgentLog["status"] }) {
  if (status === "running") return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
  if (status === "success") return <CheckCircle className="h-4 w-4 text-green-500" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const agentId = id as Id<"aiAgents">;
  const { agent, logs, isLoading } = useAgent(agentId);
  const { run } = useAgents();
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    toast.info("Agent wird ausgeführt...");
    const result = await run(agentId);
    setIsRunning(false);
    if (result.success) {
      toast.success("Agent erfolgreich ausgeführt");
    } else {
      toast.error("Fehler: " + (result.error ?? "Unbekannter Fehler"));
    }
  };

  if (isLoading) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/agenten">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{agent.name}</h1>
            {agent.description && (
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            )}
          </div>
        </div>
        <Button onClick={handleRun} disabled={isRunning}>
          {isRunning ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Läuft...</>
          ) : (
            <><Play className="mr-2 h-4 w-4" /> Jetzt ausführen</>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge className="mt-1" variant={agent.isActive ? "default" : "secondary"}>
              {agent.isActive ? "Aktiv" : "Inaktiv"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Zeitplan</p>
            <p className="mt-1 font-medium text-sm">{agent.schedule || "Manuell"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Zuletzt ausgeführt</p>
            <p className="mt-1 font-medium text-sm">
              {agent.lastRunAt
                ? new Date(agent.lastRunAt).toLocaleString("de-DE")
                : "Noch nie"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System-Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            {agent.prompt}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ausführungs-Logs (letzte 20)</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Logs vorhanden.</p>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log._id} className="border rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <LogStatusIcon status={log.status} />
                      <span className="text-sm font-medium capitalize">{log.status}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(log.startedAt).toLocaleString("de-DE")}
                      </span>
                    </div>
                    {log.summary && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                        {log.summary}
                      </p>
                    )}
                    {log.errorMessage && (
                      <p className="text-sm text-destructive">{log.errorMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
