"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import {
  repoFormSchema,
  type RepoFormData,
  type CreateCodeDiffRepo,
  defaultRepo,
} from "@/convex/codediff/_model/repo";

interface RepoFormProps {
  onSubmit: (data: CreateCodeDiffRepo) => Promise<void>;
  isLoading: boolean;
}

export function RepoForm({ onSubmit, isLoading }: RepoFormProps) {
  const form = useForm<RepoFormData>({
    resolver: zodResolver(repoFormSchema),
    defaultValues: defaultRepo as RepoFormData,
  });

  const handleSubmit = async (data: RepoFormData) => {
    await onSubmit(data as CreateCodeDiffRepo);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        data-testid="repo-form"
      >
        <Card>
          <CardHeader>
            <CardTitle>Repository-Daten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Owner *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. octocat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository-Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. my-project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="defaultBranch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Standard-Branch</FormLabel>
                  <FormControl>
                    <Input placeholder="main" {...field} />
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
                    <Input
                      placeholder="Kurze Beschreibung (optional)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Personal Access Token (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="ghp_... (nur für private Repos nötig)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} data-testid="submit-repo">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              "Repository hinzufügen"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
