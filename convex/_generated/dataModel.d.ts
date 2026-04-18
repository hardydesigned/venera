/**
 * Stub file – wird durch `npx convex dev` überschrieben.
 * Dient nur zur TypeScript-Kompilierung ohne laufenden Convex-Dev-Server.
 */
export type GenericId<TableName extends string> = string & {
  __tableName: TableName;
};

export type Id<TableName extends string> = GenericId<TableName>;

export interface DocBase<TableName extends string> {
  _id: Id<TableName>;
  _creationTime: number;
}

type TaskDoc = DocBase<"tasks"> & {
  userId: string;
  orgId?: string;
  title: string;
  description: string;
  startDate: string | null;
  dueDate: string | null;
  category: "A" | "B" | "C";
  status: "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  estimatedDurationMinutes: number | null;
  actualDurationMinutes: number | null;
};

type UserDoc = DocBase<"users"> & {
  name?: string;
  email?: string;
  emailVerificationTime?: number;
  image?: string;
  isAnonymous?: boolean;
};

export type Doc<TableName extends string> = TableName extends "tasks"
  ? TaskDoc
  : TableName extends "users"
    ? UserDoc
    : DocBase<TableName> & Record<string, unknown>;

export interface DataModel {
  tasks: {
    document: Doc<"tasks"> & {
      userId: string;
      orgId?: string;
      title: string;
      description: string;
      startDate: string | null;
      dueDate: string | null;
      category: "A" | "B" | "C";
      status: "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";
      estimatedDurationMinutes: number | null;
      actualDurationMinutes: number | null;
    };
    fieldPaths: string;
    indexes: Record<string, never>;
    searchIndexes: Record<string, never>;
    vectorIndexes: Record<string, never>;
  };
}
