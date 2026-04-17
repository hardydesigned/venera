"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useOrgs } from "@/app/(protected)/team/_controller/useOrg";
import { OrgForm } from "@/app/(protected)/team/(view)/_components/OrgForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { Users, Trash2, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

export default function TeamPage() {
  const { orgs, isLoading, create, remove } = useOrgs();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<Id<"organizations"> | null>(null);

  const handleCreate = async (data: Parameters<typeof create>[0]) => {
    setCreating(true);
    const { error } = await create(data);
    setCreating(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Team erstellt!");
      setShowCreate(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await remove(deleteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Team gelöscht");
    }
    setDeleteId(null);
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            Deine Organisationen und Teams
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Team
        </Button>
      </div>

      {showCreate && (
        <OrgForm onSubmit={handleCreate} isLoading={creating} />
      )}

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          Lade Teams...
        </div>
      ) : orgs.length === 0 && !showCreate ? (
        <Card>
          <CardContent className="flex h-40 flex-col items-center justify-center gap-3 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium text-muted-foreground">
              Noch kein Team vorhanden
            </p>
            <Button variant="outline" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Team erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => (
            <Card key={org!._id} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{org!.name}</CardTitle>
                  <Badge variant="outline">{org!.slug}</Badge>
                  {"role" in org! && (
                    <Badge variant={org!.role === "owner" ? "default" : "secondary"}>
                      {org!.role === "owner" ? "Inhaber" : "Mitglied"}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/team/${org!._id}`}>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  {"role" in org! && org!.role === "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(org!._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Team löschen"
        description="Möchtest du dieses Team wirklich löschen? Alle Mitglieder werden entfernt. Diese Aktion kann nicht rückgängig gemacht werden."
      />
    </section>
  );
}
