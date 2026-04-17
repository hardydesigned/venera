"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAgentSchema,
  CreateAgent,
  defaultAgent,
  SCHEDULE_OPTIONS,
  type AIAgent,
} from "@/convex/agents/_model/agent";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database } from "lucide-react";
import type { DataLakeConnection } from "@/convex/datalake/_model/connection";
import { PROVIDER_LABELS } from "@/convex/datalake/_model/connection";

interface AgentFormProps {
  agent?: AIAgent | null;
  dataLakeConnections: DataLakeConnection[];
  onSubmit: (data: CreateAgent) => Promise<void>;
  isLoading: boolean;
}

export function AgentForm({ agent, dataLakeConnections, onSubmit, isLoading }: AgentFormProps) {
  const form = useForm<CreateAgent>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: { ...defaultAgent, ...agent } as CreateAgent,
  });

  const connections = form.watch("connections") ?? [];

  const toggleConnection = (connectionRef: string) => {
    if (connections.includes(connectionRef)) {
      form.setValue("connections", connections.filter((c) => c !== connectionRef));
    } else {
      form.setValue("connections", [...connections, connectionRef]);
    }
  };

  useEffect(() => {
    if (agent) {
      form.reset({ ...defaultAgent, ...agent } as CreateAgent);
    }
  }, [agent, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Agent-Konfiguration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Marketing-Analyst" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Input placeholder="Kurze Beschreibung der Aufgabe" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System-Prompt *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Du bist ein KI-Assistent der..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zeitplan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Zeitplan wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SCHEDULE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Agent aktiv</FormLabel>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Lake Verbindungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dataLakeConnections.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine Data Lake Verbindungen vorhanden. Erstelle zuerst eine Verbindung unter{" "}
                <a href="/datalake" className="underline hover:text-foreground">Data Lake</a>.
              </p>
            ) : (
              <div className="space-y-3">
                {dataLakeConnections.map((conn) => {
                  const ref = `datalake:${conn._id}`;
                  return (
                    <div key={conn._id} className="flex items-center gap-3">
                      <Checkbox
                        id={`conn-${conn._id}`}
                        checked={connections.includes(ref)}
                        onCheckedChange={() => toggleConnection(ref)}
                      />
                      <label
                        htmlFor={`conn-${conn._id}`}
                        className="flex flex-col cursor-pointer"
                      >
                        <span className="text-sm font-medium">{conn.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {PROVIDER_LABELS[conn.provider]}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : agent ? "Änderungen speichern" : "Agent erstellen"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
