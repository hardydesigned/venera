"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConnectionForm } from "../_components/ConnectionForm";
import { useDataLakeConnections } from "@/app/(protected)/datalake/_controller/useDataLake";
import type { CreateConnection } from "@/convex/datalake/_model/connection";

export default function NewConnectionPage() {
  const router = useRouter();
  const { create } = useDataLakeConnections();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateConnection) => {
    setIsLoading(true);
    const { error } = await create(data);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Verbindung gespeichert");
    router.push("/datalake");
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/datalake">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Neue Verbindung
          </h1>
          <p className="text-sm text-muted-foreground">
            Nextcloud, OneDrive oder Google Drive verbinden
          </p>
        </div>
      </div>

      <ConnectionForm onSubmit={handleSubmit} isLoading={isLoading} />
    </section>
  );
}
