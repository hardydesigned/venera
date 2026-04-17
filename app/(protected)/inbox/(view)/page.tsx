"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTasks, useOrgTasks } from "@/app/(protected)/inbox/_controller/useTasks";
import { useOrgs } from "@/app/(protected)/team/_controller/useOrg";
import { TaskList } from "@/app/(protected)/inbox/(view)/_components/TaskList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default function InboxPage() {
  const { tasks, remove, isLoading } = useTasks();
  const { orgs } = useOrgs();
  const [deleteId, setDeleteId] = useState<Id<"tasks"> | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<
    Id<"organizations"> | undefined
  >(undefined);
  const {
    tasks: orgTasks,
    remove: removeOrgTask,
    isLoading: orgLoading,
  } = useOrgTasks(selectedOrgId);

  const handleDeletePersonal = async () => {
    if (!deleteId) return;
    const { error } = await remove(deleteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Aufgabe gelöscht");
    }
    setDeleteId(null);
  };

  const handleDeleteOrg = async () => {
    if (!deleteId) return;
    const { error } = await removeOrgTask(deleteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Aufgabe gelöscht");
    }
    setDeleteId(null);
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Inbox</h1>
          <p className="text-sm text-muted-foreground">
            Aufgabenverwaltung
          </p>
        </div>
        <Link href="/inbox/new">
          <Button data-testid="new-task-button">
            <Plus className="mr-2 h-4 w-4" />
            Neue Aufgabe
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Persönlich</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <TaskList
            tasks={tasks}
            onDelete={setDeleteId}
            isLoading={isLoading}
          />
          <DeleteConfirmDialog
            open={deleteId !== null}
            onOpenChange={(open) => !open && setDeleteId(null)}
            onConfirm={handleDeletePersonal}
            title="Aufgabe löschen"
            description="Möchtest du diese Aufgabe wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
          />
        </TabsContent>

        <TabsContent value="team">
          <div className="mb-4 flex items-center gap-3">
            <Select
              value={selectedOrgId ?? ""}
              onValueChange={(v) =>
                setSelectedOrgId(v ? (v as Id<"organizations">) : undefined)
              }
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Team auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {orgs.map((org) => (
                  <SelectItem key={org!._id} value={org!._id}>
                    {org!.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {orgs.length === 0 && (
              <Link href="/team">
                <Button variant="outline" size="sm">
                  Team erstellen
                </Button>
              </Link>
            )}
          </div>

          {selectedOrgId && (
            <>
              <TaskList
                tasks={orgTasks}
                onDelete={setDeleteId}
                isLoading={orgLoading}
              />
              <DeleteConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={handleDeleteOrg}
                title="Team-Aufgabe löschen"
                description="Möchtest du diese Team-Aufgabe wirklich löschen?"
              />
            </>
          )}

          {!selectedOrgId && orgs.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Wähle ein Team, um die gemeinsamen Aufgaben zu sehen.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
