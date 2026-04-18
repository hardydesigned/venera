/* eslint-disable */
/**
 * Stub file – wird durch `npx convex dev` überschrieben.
 * Nur für Build-Kompilierung ohne laufenden Convex-Dev-Server.
 */
import { makeFunctionReference } from "convex/server";

export const api = {
  tasks: {
    queries: {
      list: makeFunctionReference("tasks/queries:list"),
      listInbox: makeFunctionReference("tasks/queries:listInbox"),
      get: makeFunctionReference("tasks/queries:get"),
    },
    mutations: {
      create: makeFunctionReference("tasks/mutations:create"),
      update: makeFunctionReference("tasks/mutations:update"),
      remove: makeFunctionReference("tasks/mutations:remove"),
    },
  },
};
