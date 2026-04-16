# SentryCommand - Project Structure and Development Guidelines

## Project Overview

SentryCommand is a Next.js application for drone fleet management with:

- **Frontend**: Next.js 16 (App Router) with React 19
- **Backend**: Convex (Realtime Database & Backend)
- **Authentication**: Clerk (with Organization Support)
- **Validation**: Zod + convex-helpers/zod4
- **UI**: Shadcn/UI + Tailwind CSS
- **Forms**: React Hook Form with Zod Resolver

Always use Context7 MCP when I need library/API documentation, code generation,
setup or configuration steps without me having to explicitly ask.

## Core Architecture

The project follows a strict module structure with clear separation between
backend (Convex) and frontend (Next.js).

-> Never exceed the limit of 250 lines per file!

### 1. Backend Structure (Convex)

All backend logic is located under `convex/` and organized by modules.

#### Module Structure

```
convex/
  └── [module]/                   # e.g. fleet
      ├── _model/                 # Zod Schemas and TypeScript Types
      │   ├── drone.ts
      │   ├── accessory.ts
      │   └── ...
      ├── drones/                 # Entity-specific Operations
      │   ├── mutations.ts        # Create, Update, Delete
      │   └── queries.ts          # List, Get
      ├── accessories/
      │   ├── mutations.ts
      │   └── queries.ts
      └── storage/                # Shared Services
          └── mutations.ts
```

#### Model Definitions (`_model/`)

Each data structure has its own model file with:

```typescript
import { z } from "zod";
import { zid } from "convex-helpers/server/zod4";
import type { Doc } from "../../_generated/dataModel";

// 1. Enums (if needed)
export const statusEnum = z.enum(["active", "inactive"]);
export type Status = z.infer<typeof statusEnum>;

// 2. Convex Document Type
export type Entity = Doc<"entities">;

// 3. Creation Schema (for API validation)
export const createEntitySchema = z.object({
	org_id: z.string().optional(), // Set server-side
	template_id: zid("templates").optional(),
	name: z.string().min(1),
	status: statusEnum,
	custom_image: z.string().optional(), // Storage ID
	// ... additional fields
});

export type CreateEntity = z.infer<typeof createEntitySchema>;

// 4. Form Schema (for react-hook-form with String IDs)
export const entityFormSchema = createEntitySchema.partial().extend({
	template_id: z.string().optional(), // String instead of zid for forms
	drone_id: z.string().optional(),
});

export type EntityFormData = z.infer<typeof entityFormSchema>;

// 5. Update Schema
export const updateEntitySchema = createEntitySchema.partial().extend({
	id: zid("entities"),
});

export type UpdateEntity = z.infer<typeof updateEntitySchema>;

// 6. Default Values
export const defaultEntity: Partial<CreateEntity> = {
	name: "",
	status: "active",
	// ...
};
```

#### Mutations (`mutations.ts`)

**Pattern**: All mutations use `zCustomMutation` with Zod validation.

```typescript
import { mutation } from "../../_generated/server";
import { requireOrgIdentity } from "../../lib/auth";
import { createEntitySchema } from "../_model/entity";
import { zCustomMutation, zid } from "convex-helpers/server/zod4";
import { NoOp } from "convex-helpers/server/customFunctions";
import { z } from "zod";

const zMutation = zCustomMutation(mutation, NoOp);

// CREATE
export const create = zMutation({
	args: createEntitySchema,
	handler: async (ctx, args) => {
		const { orgId } = await requireOrgIdentity(
			await ctx.auth.getUserIdentity(),
		);

		// Validate relationships (if present)
		if (args.parent_id) {
			const parent = await ctx.db.get(args.parent_id);
			if (!parent || parent.org_id !== orgId) {
				throw new Error("Parent not found");
			}
		}

		return ctx.db.insert("entities", {
			...args,
			org_id: orgId,
		});
	},
});

// UPDATE
export const update = zMutation({
	args: createEntitySchema.partial().extend({
		id: zid("entities"),
	}),
	handler: async (ctx, { id, ...updates }) => {
		const { orgId } = await requireOrgIdentity(
			await ctx.auth.getUserIdentity(),
		);

		const entity = await ctx.db.get(id);
		if (!entity || entity.org_id !== orgId) {
			throw new Error("Entity not found");
		}

		// Validate relationships on updates
		if (updates.parent_id) {
			const parent = await ctx.db.get(updates.parent_id);
			if (!parent || parent.org_id !== orgId) {
				throw new Error("Parent not found");
			}
		}

		await ctx.db.patch(id, updates);
		return id;
	},
});

// DELETE (with cascade for dependent resources)
export const remove = zMutation({
	args: z.object({ id: zid("entities") }),
	handler: async (ctx, { id }) => {
		const { orgId } = await requireOrgIdentity(
			await ctx.auth.getUserIdentity(),
		);

		const entity = await ctx.db.get(id);
		if (!entity || entity.org_id !== orgId) {
			throw new Error("Entity not found");
		}

		// Delete storage files
		if (entity.custom_image) {
			await ctx.storage.delete(entity.custom_image);
		}

		// Delete dependent resources (CASCADE)
		const children = await ctx.db
			.query("children")
			.withIndex("by_parent", (q) => q.eq("parent_id", id))
			.collect();

		for (const child of children) {
			if (child.custom_image) {
				await ctx.storage.delete(child.custom_image);
			}
			await ctx.db.delete(child._id);
		}

		await ctx.db.delete(id);
	},
});
```

#### Queries (`queries.ts`)

**Pattern**: Queries are read-only and load related data as well as storage
URLs.

```typescript
import { query } from "../../_generated/server";
import { v } from "convex/values";
import { requireOrgIdentity } from "../../lib/auth";

// LIST - All entities of an organization
export const list = query({
	handler: async (ctx) => {
		const { orgId } = await requireOrgIdentity(
			await ctx.auth.getUserIdentity(),
		);

		const entities = await ctx.db
			.query("entities")
			.withIndex("by_org", (q) => q.eq("org_id", orgId))
			.collect();

		// Load templates (if needed)
		const templates = await ctx.db.query("templates").collect();

		// Resolve storage URLs and assign templates
		return Promise.all(
			entities.map(async (entity) => {
				const template = entity.template_id
					? (templates.find((t) => t._id === entity.template_id) ??
						null)
					: null;

				const imageUrl = entity.custom_image
					? await ctx.storage.getUrl(entity.custom_image)
					: null;

				return {
					...entity,
					template,
					imageUrl,
				};
			}),
		);
	},
});

// GET - Single entity
export const get = query({
	args: { id: v.id("entities") },
	handler: async (ctx, { id }) => {
		const { orgId } = await requireOrgIdentity(
			await ctx.auth.getUserIdentity(),
		);

		const entity = await ctx.db.get(id);
		if (!entity || entity.org_id !== orgId) {
			return null;
		}

		const template = entity.template_id
			? await ctx.db.get(entity.template_id)
			: null;

		const imageUrl = entity.custom_image
			? await ctx.storage.getUrl(entity.custom_image)
			: null;

		return {
			...entity,
			template,
			imageUrl,
		};
	},
});

// LIST Templates (global, no org_id)
export const listTemplates = query({
	handler: async (ctx) => {
		await requireOrgIdentity(await ctx.auth.getUserIdentity());
		return ctx.db.query("templates").collect();
	},
});
```

#### Schema Definition (`schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { zodOutputToConvex } from "convex-helpers/server/zod4";
import { createEntitySchema } from "./module/_model/entity";

export default defineSchema({
	// Entities with indexes
	entities: defineTable(zodOutputToConvex(createEntitySchema))
		.index("by_org", ["org_id"])
		.index("by_parent", ["parent_id"]),
});
```

### 2. Frontend Structure (Next.js)

All UI logic is located under `app/` and follows the Next.js App Router pattern.

#### Module Structure

```
app/(protected)/
  └── [module]/                   # e.g. fleet
      ├── _controller/            # Custom Hooks (Business Logic)
      │   ├── useEntities.ts
      │   ├── useFleetStorage.ts
      │   └── gen_url_slug.ts     # Utility Functions
      └── (view)/                 # UI Layer
          ├── _components/        # React Components
          │   ├── EntityForm.tsx
          │   └── EntityList.tsx
          ├── page.tsx            # /fleet
          └── entities/           # Nested Routes
              ├── new/
              │   └── page.tsx    # /fleet/entities/new
              └── [id]/
                  ├── page.tsx    # /fleet/entities/:id
                  └── edit/
                      └── page.tsx # /fleet/entities/:id/edit
```

#### Controller/Hooks (`_controller/`)

**Pattern**: Each entity has its own hook that encapsulates Convex
queries/mutations.

```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useFleetStorage } from "./useFleetStorage";
import { CreateEntity } from "@/convex/module/_model/entity";

// Hook for list and CRUD operations
export function useEntities() {
	const entities = useQuery(api.module.entities.queries.list);
	const templates = useQuery(api.module.entities.queries.listTemplates);
	const createMutation = useMutation(api.module.entities.mutations.create);
	const updateMutation = useMutation(api.module.entities.mutations.update);
	const removeMutation = useMutation(api.module.entities.mutations.remove);
	const { uploadImage } = useFleetStorage();

	const create = async (
		data: CreateEntity,
		imageFile?: File | null,
	): Promise<{ data: Id<"entities"> | null; error: Error | null }> => {
		try {
			let customImage: Id<"_storage"> | undefined;
			if (imageFile) {
				const storageId = await uploadImage(imageFile);
				if (storageId) {
					customImage = storageId;
				}
			}

			const id = await createMutation({
				...data,
				custom_image: customImage,
			});

			return { data: id, error: null };
		} catch (e) {
			return { data: null, error: e as Error };
		}
	};

	const update = async (
		id: Id<"entities">,
		data: Partial<CreateEntity>,
		imageFile?: File | null,
	): Promise<{ data: Id<"entities"> | null; error: Error | null }> => {
		try {
			let customImage: Id<"_storage"> | undefined;
			if (imageFile) {
				const storageId = await uploadImage(imageFile);
				if (storageId) {
					customImage = storageId;
				}
			}

			await updateMutation({
				id,
				...data,
				custom_image: customImage,
			});

			return { data: id, error: null };
		} catch (e) {
			return { data: null, error: e as Error };
		}
	};

	const remove = async (
		id: Id<"entities">,
	): Promise<{ error: Error | null }> => {
		try {
			await removeMutation({ id });
			return { error: null };
		} catch (e) {
			return { error: e as Error };
		}
	};

	return {
		entities: entities ?? [],
		templates: templates ?? [],
		isLoading: entities === undefined,
		create,
		update,
		remove,
	};
}

// Hook for single entity
export function useEntity(id: Id<"entities"> | undefined) {
	const entity = useQuery(
		api.module.entities.queries.get,
		id ? { id } : "skip",
	);

	return {
		entity: entity ?? null,
		isLoading: id !== undefined && entity === undefined,
	};
}
```

#### Storage Hook (`useFleetStorage.ts`)

```typescript
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useFleetStorage() {
	const generateUploadUrl = useMutation(
		api.fleet.storage.mutations.generateUploadUrl,
	);
	const deleteFileMutation = useMutation(
		api.fleet.storage.mutations.deleteFile,
	);

	const uploadImage = async (file: File): Promise<Id<"_storage"> | null> => {
		try {
			const uploadUrl = await generateUploadUrl();
			const response = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const { storageId } = await response.json();
			return storageId as Id<"_storage">;
		} catch (error) {
			console.error("Upload error:", error);
			return null;
		}
	};

	const deleteFile = async (storageId: Id<"_storage">): Promise<void> => {
		try {
			await deleteFileMutation({ storageId });
		} catch (error) {
			console.error("Delete error:", error);
		}
	};

	return { uploadImage, deleteFile };
}
```

#### Components (`_components/`)

##### Form Component Pattern

```typescript
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import {
  CreateEntity,
  EntityFormData,
  entityFormSchema,
  defaultEntity,
} from "@/convex/module/_model/entity";

interface EntityFormProps {
  entity?: EntityWithTemplate | null;
  onSubmit: (data: CreateEntity, imageFile: File | null) => Promise<void>;
  isLoading: boolean;
}

export function EntityForm({ entity, onSubmit, isLoading }: EntityFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    entity?.imageUrl ?? null
  );

  const form = useForm<EntityFormData>({
    resolver: zodResolver(entityFormSchema),
    defaultValues: { ...defaultEntity, ...entity } as EntityFormData,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data: EntityFormData) => {
    await onSubmit(data as CreateEntity, imageFile);
  };

  useEffect(() => {
    if (entity) {
      form.reset({ ...defaultEntity, ...entity } as EntityFormData);
    }
  }, [entity]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload */}
            <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <Input type="file" accept="image/*" onChange={handleImageChange} />

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Status Select */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : entity ? (
              "Save Changes"
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

##### List Component Pattern

```typescript
"use client";

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
import { EllipsisVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import type { EntityWithTemplate } from "@/convex/module/_model/entity";

interface EntityListProps {
  entities: EntityWithTemplate[];
  onDelete: (id: Id<"entities">) => void;
  isLoading: boolean;
}

export function EntityList({ entities, onDelete, isLoading }: EntityListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <p className="font-medium">No entries found</p>
          <Link href="/module/entities/new">
            <Button>Add New Entry</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {entities.map((entity) => (
          <Card key={entity._id} className="overflow-hidden transition-shadow hover:bg-secondary hover:shadow-md">
            <Link href={`/module/entities/${entity._id}`}>
              <div className="aspect-video relative bg-muted">
                {entity.imageUrl ? (
                  <img src={entity.imageUrl} alt={entity.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <Badge>{entity.status}</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold leading-none">{entity.name}</h3>
                    {entity.template && (
                      <p className="text-sm text-muted-foreground">
                        {entity.template.manufacturer} {entity.template.model}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/module/entities/${entity._id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.preventDefault();
                          onDelete(entity._id);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
```

#### Pages (Routes)

##### List Page (`page.tsx`)

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEntities } from "@/app/(protected)/module/_controller/useEntities";
import { EntityList } from "@/app/(protected)/module/(view)/_components/EntityList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import type { Id } from "@/convex/_generated/dataModel";

export default function EntitiesPage() {
  const { entities, remove, isLoading } = useEntities();
  const [deleteId, setDeleteId] = useState<Id<"entities"> | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await remove(deleteId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Successfully deleted");
    }
    setDeleteId(null);
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">Entities</h1>
          <p className="text-sm text-muted-foreground">
            Manage your entities
          </p>
        </div>
        <Link href="/module/entities/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </Link>
      </div>

      <EntityList
        entities={entities}
        onDelete={setDeleteId}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Entity"
        description="Are you sure you want to delete this entity? This action cannot be undone."
      />
    </section>
  );
}
```

##### Create/Edit Page (`new/page.tsx` or `[id]/edit/page.tsx`)

```typescript
"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEntities, useEntity } from "@/app/(protected)/module/_controller/useEntities";
import { EntityForm } from "@/app/(protected)/module/(view)/_components/EntityForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CreateEntity } from "@/convex/module/_model/entity";

// For Edit: Props from params
interface EditPageProps {
  params: { id: string };
}

export default function NewEntityPage(/* props?: EditPageProps */) {
  const router = useRouter();
  const { create, update, isLoading } = useEntities();

  // For Edit mode:
  // const { entity, isLoading: entityLoading } = useEntity(props.params.id as Id<"entities">);

  const handleSubmit = async (data: CreateEntity, imageFile: File | null) => {
    // For Create:
    const { error } = await create(data, imageFile);

    // For Update:
    // const { error } = await update(props.params.id as Id<"entities">, data, imageFile);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Successfully saved");
    router.push("/module/entities");
  };

  return (
    <section className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/module/entities">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            New Entity
          </h1>
        </div>
      </div>

      <EntityForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        // For Edit: entity={entity}
      />
    </section>
  );
}
```

## Development Guidelines

### 1. Adding a New Entity

When a new data structure (e.g., "Mission") should be added to the project:

#### Backend (Convex)

1. **Create model**: `convex/module/_model/mission.ts`
    - Define enums
    - Zod schemas (create, form, update)
    - Default values

2. **Extend schema**: `convex/schema.ts`

    ```typescript
    missions: defineTable(zodOutputToConvex(createMissionSchema))
      .index("by_org", ["org_id"])
      .index("by_drone", ["drone_id"]),
    ```

3. **Create mutations**: `convex/module/missions/mutations.ts`
    - `create` - with org_id injection
    - `update` - with org_id validation
    - `remove` - with cascade delete

4. **Create queries**: `convex/module/missions/queries.ts`
    - `list` - with org_id filter
    - `get` - single record
    - Template queries if needed

#### Frontend (Next.js)

1. **Create hook**: `app/(protected)/module/_controller/useMissions.ts`
    - List and single record hook
    - CRUD functions with error handling
    - Image upload integration

2. **Create components**: `app/(protected)/module/(view)/_components/`
    - `MissionForm.tsx` - Create/Edit form
    - `MissionList.tsx` - Grid/List view

3. **Create routes**: `app/(protected)/module/(view)/missions/`
    ```
    missions/
      ├── page.tsx              # List
      ├── new/
      │   └── page.tsx          # Create
      └── [id]/
          ├── page.tsx          # Detail
          └── edit/
              └── page.tsx      # Edit
    ```

### 2. Code Quality Rules

#### General

- ✅ **TypeScript strict mode** always use
- ✅ **Zod** for all input validation
- ✅ **Error handling** in all async functions
- ✅ **Loading states** for all asynchronous operations
- ✅ **Type location**: Types and constants must never be defined locally inside components.
  - If the data is stored in Convex → define the type in `convex/<module>/_model/<entity>.ts`
  - If the data is not stored in Convex (e.g. UI-only state) → define the type in `convex/config/`
- ✅ **German umlauts**: Always use correct German characters: `ü`, `ä`, `ö`, `Ü`, `Ä`, `Ö`, `ß`. Never write `ue`, `ae`, `oe` or omit umlauts in user-facing strings.
- ❌ **No inline styles** - use Tailwind only
- ❌ **No any-types** without good reason

#### Backend (Convex)

- ✅ **Always** use `requireOrgIdentity()` in mutations/queries
- ✅ **Always** check org_id on updates/deletes
- ✅ **Cascade deletes** for dependent resources
- ✅ **Storage cleanup** on deletes
- ✅ **zCustomMutation** instead of plain `mutation()`
- ❌ **No direct ctx.auth** usage without requireOrgIdentity

#### Frontend (Next.js)

- ✅ **"use client"** directive for client components
- ✅ **Custom hooks** for all Convex access
- ✅ **React Hook Form + Zod** for all forms
- ✅ **Toast notifications** for user feedback
- ✅ **Loading/empty states** in lists
- ✅ **Delete confirmation dialogs**
- ❌ **No direct Convex queries** in components (only via hooks)
- ❌ **No business logic** in components

### 3. Naming Conventions

#### Files & Folders

- Components: PascalCase (`DroneForm.tsx`)
- Hooks: camelCase with "use" prefix (`useDrones.ts`)
- Utils: camelCase (`gen_url_slug.ts`)
- Routes: kebab-case (`flight-logs/`)

#### Code

- Interfaces: PascalCase + Props/Data suffix (`EntityFormProps`)
- Types: PascalCase (`CreateEntity`)
- Enums: camelCase + Enum suffix (`statusEnum`)
- Functions: camelCase (`createEntity`)
- Constants: camelCase (`defaultEntity`)

### 4. Git Workflow

```bash
# Create feature branch
git checkout -b feature/missions-module

# Commits with meaningful messages
git commit -m "feat(missions): Add mission model and schema"
git commit -m "feat(missions): Add CRUD mutations and queries"
git commit -m "feat(missions): Add frontend hooks and components"

# Run tests locally
pnpm test

# Push and create PR
git push origin feature/missions-module
```

### 5. Testing

#### Unit Tests (Convex)

```typescript
// tests/unit/module/missions.test.ts
import { describe, it, expect } from "vitest";
import { convexTest } from "convex-test";
import { api } from "@/convex/_generated/api";

describe("Mission CRUD", () => {
	it("should create a mission", async () => {
		const t = convexTest();
		const id = await t.mutation(api.module.missions.mutations.create, {
			name: "Test Mission",
			status: "planned",
		});
		expect(id).toBeDefined();
	});
});
```

#### E2E Tests (Cypress)
Schreibe die Tests mit Cypress.
Füge an geeigneten Stellen auch Test Ids hinzu.

### 6. Performance Best Practices

- ✅ Cache query results through Convex (automatic)
- ✅ Optimize images (WebP, max 2MB)
- ✅ Lazy loading for large lists (`ScrollArea`)
- ✅ Optimistic updates where appropriate
- ❌ No unnecessary re-renders (React.memo if needed)
- ❌ No large queries without pagination

### 7. Security

- ✅ **Always** check authentication (requireOrgIdentity)
- ✅ **Always** check authorization (org_id matching)
- ✅ **Always** validate input (Zod)
- ✅ **Sensitive data** never store in client
- ❌ **No direct storage URLs** without org_id check
- ❌ **No SQL-like injections** (prevented by Convex)

## Tech Stack Details

### Core Dependencies

```json
{
	"next": "^16.0.10",
	"react": "^19.2.3",
	"convex": "^1.31.6",
	"@clerk/nextjs": "^6.36.10",
	"zod": "^4.1.13",
	"convex-helpers": "^0.1.111",
	"react-hook-form": "^7.68.0",
	"@hookform/resolvers": "^5.2.2",
	"tailwindcss": "^4.1.18",
	"lucide-react": "^0.561.0",
	"sonner": "^2.0.7"
}
```

### UI Components (Shadcn)

All UI components are located under `components/ui/` and based on:

- Radix UI Primitives
- Tailwind CSS
- CVA (Class Variance Authority)

Standard components:

- `button`, `input`, `card`, `dialog`, `form`
- `select`, `checkbox`, `switch`, `tabs`
- `dropdown-menu`, `tooltip`, `badge`
- `scroll-area`, `separator`, `sheet`

### Utilities

- `lib/utils.ts` - Tailwind cn() Helper
- `lib/hooks/use-mobile.ts` - Responsive Hook
- `lib/services/s3-client.ts` - S3 Integration (optional)

## Debugging

### Convex Dev Dashboard

```bash
npx convex dev
# Open: https://dashboard.convex.dev/
```

### Next.js Dev Tools

```bash
pnpm dev
# Open: http://localhost:3000
```

### Logs

- **Convex**: Console in Dev Dashboard
- **Next.js**: Terminal + Browser Console
- **Clerk**: [clerk.com/dashboard](https://clerk.com/dashboard)

## Common Issues

### "No active organization in session"

- Make sure Clerk organization support is active
- User must be assigned to an organization
- Check Clerk JWT template for `org_id` claim

### "Entity not found"

- org_id doesn't match → Check requireOrgIdentity
- ID is undefined → Check query "skip" logic
- Entity was deleted → Handle null case

### Images not displaying

- Storage URL expires → Always load fresh URLs via `ctx.storage.getUrl()`
- org_id check missing → Check storage queries as well
- File not uploaded → Check upload response

### Form validation fails

- Zod schema doesn't match form data
- `zid()` vs `z.string()` for IDs → Forms use string
- Optional fields → Don't forget `.optional()`

## Summary

**Most Important Principles:**

1. ✅ **Strict separation**: Backend (Convex) ↔ Controller (Hooks) ↔ View
   (Components)
2. ✅ **Consistent schema**: Model → Mutation → Query → Hook → Component
3. ✅ **Zod everywhere**: Validation in backend AND frontend
4. ✅ **org_id ALWAYS check**: Security has highest priority
5. ✅ **Error handling**: Never unhandled promises
6. ✅ **User feedback**: Loading states + toast notifications
7. ✅ **DRY principle**: Reusable hooks and components

-> Never exceed the limit of 250 lines per file!

**For New Features:**

1. Define model (Zod schema)
2. Extend schema (Convex DB)
3. Write mutations (Create, Update, Delete)
4. Write queries (List, Get)
5. Create hook (Frontend bridge)
6. Build components (Form + List)
7. Create routes (Pages)
8. Write tests (Unit + E2E)

---

**Documentation Date**: January 2026  
**Version**: 1.0.0
