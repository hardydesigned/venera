import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  authAccounts: defineTable({
    provider: v.string(),
    providerAccountId: v.string(),
    secret: v.optional(v.string()),
    userId: v.id("users"),
    emailVerified: v.optional(v.number()),
  })
    .index("by_providerAndAccountId", ["provider", "providerAccountId"])
    .index("by_userId", ["userId"]),

  authSessions: defineTable({
    userId: v.id("users"),
    expirationTime: v.number(),
  }).index("by_userId", ["userId"]),

  authVerificationCodes: defineTable({
    accountId: v.id("authAccounts"),
    code: v.string(),
    expirationTime: v.number(),
    provider: v.optional(v.string()),
    verifier: v.optional(v.string()),
    emailVerified: v.optional(v.number()),
    phone: v.optional(v.string()),
  }).index("by_accountId", ["accountId"]),

  authVerifiers: defineTable({
    sessionId: v.optional(v.id("authSessions")),
    signature: v.string(),
  }).index("by_signature", ["signature"]),

  authRateLimits: defineTable({
    identifier: v.string(),
    lastAttemptTime: v.number(),
    attemptsCount: v.number(),
  }).index("by_identifier", ["identifier"]),

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
  })
    .index("by_email", ["email"]),

  tasks: defineTable({
    userId: v.string(),
    orgId: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    startDate: v.union(v.string(), v.null()),
    dueDate: v.union(v.string(), v.null()),
    category: v.union(v.literal("A"), v.literal("B"), v.literal("C")),
    status: v.union(
      v.literal("OPEN"),
      v.literal("IN_PROGRESS"),
      v.literal("DONE"),
      v.literal("CANCELLED"),
    ),
    estimatedDurationMinutes: v.union(v.number(), v.null()),
    actualDurationMinutes: v.union(v.number(), v.null()),
  })
    .index("by_user", ["userId"])
    .index("by_org", ["orgId"])
    .index("by_user_status", ["userId", "status"]),
});
