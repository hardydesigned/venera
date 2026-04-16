import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Nutzer-Profile (ergänzt das authTables users)
  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    personalOrgId: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Aufgaben (persönlich + Team)
  tasks: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("done"),
      v.literal("cancelled"),
    ),
    priority: v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    assigneeId: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_project", ["projectId"]),

  // Projekte
  projects: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    goal: v.optional(v.string()),
    color: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"]),

  // Kalender-Ereignisse
  calendarEvents: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.string()),
    title: v.string(),
    startAt: v.number(),
    endAt: v.number(),
    color: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
  })
    .index("by_user", ["userId"])
    .index("by_user_time", ["userId", "startAt"]),
});
