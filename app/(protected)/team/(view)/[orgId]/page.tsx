"use client";

import { use, useState } from "react";
import { toast } from "sonner";
import { useOrg } from "@/app/(protected)/team/_controller/useOrg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";

interface TeamDetailPageProps {
  params: Promise<{ orgId: string }>;
}

export default function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { orgId } = use(params);
  const { org, members, isLoading, addMember, removeMember } = useOrg(
    orgId as Id<"organizations">,
  );
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddMember = async () => {
    if (!email.trim()) return;
    setAdding(true);
    const { error } = await addMember(email.trim());
    setAdding(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Mitglied hinzugefügt");
      setEmail("");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const { error } = await removeMember(userId as Id<"users">);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Mitglied entfernt");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Team nicht gefunden.
      </div>
    );
  }

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/team">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">{org.name}</h1>
          <p className="text-sm text-muted-foreground">/{org.slug}</p>
        </div>
      </div>

      {/* Mitglied hinzufügen */}
      <Card>
        <CardHeader>
          <CardTitle>Mitglied einladen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="E-Mail-Adresse"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
            />
            <Button onClick={handleAddMember} disabled={adding || !email.trim()}>
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              <span className="ml-2">Hinzufügen</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mitgliederliste */}
      <Card>
        <CardHeader>
          <CardTitle>Mitglieder ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Keine Mitglieder.</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{member.name ?? member.email ?? member.userId}</p>
                    {member.name && member.email && (
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                      {member.role === "owner" ? "Inhaber" : "Mitglied"}
                    </Badge>
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.userId)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
