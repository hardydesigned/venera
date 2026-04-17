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
    orgId: v.optional(v.id("organizations")),
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

  // Code Diff: GitHub Repository Review-Tracking
  codeDiffRepos: defineTable({
    userId: v.id("users"),
    orgId: v.optional(v.string()),
    owner: v.string(),
    name: v.string(),
    token: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultBranch: v.string(),
    lastSyncAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  codeDiffFiles: defineTable({
    repoId: v.id("codeDiffRepos"),
    path: v.string(),
    status: v.union(
      v.literal("needs_review"),
      v.literal("reviewed"),
      v.literal("todo"),
      v.literal("always_green"),
    ),
    blobSha: v.optional(v.string()),
  })
    .index("by_repo", ["repoId"])
    .index("by_repo_path", ["repoId", "path"]),

  // Organisationen (Team-Accounts)
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.id("users"),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"]),

  // Org-Mitgliedschaften
  orgMemberships: defineTable({
    orgId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("member")),
    invitedBy: v.optional(v.id("users")),
  })
    .index("by_org", ["orgId"])
    .index("by_user", ["userId"])
    .index("by_org_user", ["orgId", "userId"]),

  // Data Lake: Storage-Verbindungen (Nextcloud, OneDrive, etc.)
  dataLakeConnections: defineTable({
    userId: v.id("users"),
    name: v.string(),
    provider: v.union(
      v.literal("nextcloud"),
      v.literal("onedrive"),
      v.literal("googledrive"),
    ),
    webdavUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    lastSyncAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Data Lake: Gecachte Datei/Ordner-Einträge
  dataLakeItems: defineTable({
    connectionId: v.id("dataLakeConnections"),
    path: v.string(),
    name: v.string(),
    type: v.union(v.literal("file"), v.literal("folder")),
    size: v.optional(v.number()),
    lastModified: v.optional(v.number()),
    contentType: v.optional(v.string()),
    etag: v.optional(v.string()),
  })
    .index("by_connection", ["connectionId"])
    .index("by_connection_path", ["connectionId", "path"]),
});
