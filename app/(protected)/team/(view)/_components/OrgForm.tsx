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
  type CreateOrg,
  type OrgFormData,
  orgFormSchema,
  defaultOrg,
} from "@/convex/organizations/_model/organization";

interface OrgFormProps {
  onSubmit: (data: CreateOrg) => Promise<void>;
  isLoading: boolean;
}

export function OrgForm({ onSubmit, isLoading }: OrgFormProps) {
  const form = useForm<OrgFormData>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: defaultOrg as OrgFormData,
  });

  const handleFormSubmit = async (data: OrgFormData) => {
    await onSubmit(data as CreateOrg);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team-Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Mein Unternehmen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kürzel *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="z.B. mein-unternehmen"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              "Team erstellen"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
