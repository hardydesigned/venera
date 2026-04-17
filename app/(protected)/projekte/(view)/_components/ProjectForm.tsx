"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";
import {
  type CreateProject,
  type ProjectFormData,
  projectFormSchema,
  defaultProject,
} from "@/convex/projects/_model/project";
import type { Project } from "@/convex/projects/_model/project";

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: CreateProject) => Promise<void>;
  isLoading: boolean;
}

const colorOptions = [
  { value: "gray", label: "Grau" },
  { value: "red", label: "Rot" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Gelb" },
  { value: "green", label: "Grün" },
  { value: "blue", label: "Blau" },
  { value: "purple", label: "Lila" },
  { value: "pink", label: "Pink" },
];

export function ProjectForm({ project, onSubmit, isLoading }: ProjectFormProps) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: { ...defaultProject, ...project } as ProjectFormData,
  });

  useEffect(() => {
    if (project) {
      form.reset({ ...defaultProject, ...project } as ProjectFormData);
    }
  }, [project, form]);

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data as CreateProject);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Projekt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel *</FormLabel>
                  <FormControl>
                    <Input placeholder="Projekttitel eingeben" {...field} />
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
                    <Textarea
                      placeholder="Optionale Beschreibung"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ziel</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Was soll mit diesem Projekt erreicht werden?"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farbe</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Farbe wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colorOptions.map((opt) => (
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
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading} data-testid="project-submit">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gespeichert...
              </>
            ) : project ? (
              "Änderungen speichern"
            ) : (
              "Projekt erstellen"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
