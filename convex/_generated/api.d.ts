/**
 * Stub file – wird durch `npx convex dev` überschrieben.
 */
import type { FunctionReference } from "convex/server";
import type { Doc, Id } from "./dataModel";

type TaskDoc = Doc<"tasks">;

export declare const api: {
  tasks: {
    queries: {
      list: FunctionReference<"query", "public", Record<string, never>, TaskDoc[]>;
      listInbox: FunctionReference<"query", "public", Record<string, never>, TaskDoc[]>;
      get: FunctionReference<"query", "public", { id: Id<"tasks"> }, TaskDoc | null>;
    };
    mutations: {
      create: FunctionReference<"mutation", "public", Partial<Omit<TaskDoc, "_id" | "_creationTime">>, Id<"tasks">>;
      update: FunctionReference<"mutation", "public", { id: Id<"tasks"> } & Partial<Omit<TaskDoc, "_id" | "_creationTime">>, Id<"tasks">>;
      remove: FunctionReference<"mutation", "public", { id: Id<"tasks"> }, void>;
    };
  };
};
