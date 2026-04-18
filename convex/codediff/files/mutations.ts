import { mutation } from "../../_generated/server";
import { requireAuth } from "../../lib/auth";
import { v } from "convex/values";

const statusValidator = v.union(
  v.literal("needs_review"),
  v.literal("reviewed"),
  v.literal("todo"),
  v.literal("always_green"),
);

/** Status einer einzelnen Datei aktualisieren */
export const updateStatus = mutation({
  args: {
    id: v.id("codeDiffFiles"),
    status: statusValidator,
  },
  handler: async (ctx, { id, status }) => {
    const { userId } = await requireAuth(ctx);
    const file = await ctx.db.get(id);
    if (!file) throw new Error("Datei nicht gefunden.");
    const repo = await ctx.db.get(file.repoId);
    if (!repo || repo.userId !== userId) throw new Error("Zugriff verweigert.");
    await ctx.db.patch(id, { status });
  },
});

/** Bulk-Sync: Dateien aus GitHub in DB schreiben */
export const bulkSync = mutation({
  args: {
    repoId: v.id("codeDiffRepos"),
    files: v.array(v.object({ path: v.string(), blobSha: v.string() })),
  },
  handler: async (ctx, { repoId, files }) => {
    const { userId } = await requireAuth(ctx);
    const repo = await ctx.db.get(repoId);
    if (!repo || repo.userId !== userId) throw new Error("Repository nicht gefunden.");

    const existing = await ctx.db
      .query("codeDiffFiles")
      .withIndex("by_repo", (q) => q.eq("repoId", repoId))
      .collect();
    const existingMap = new Map(existing.map((f) => [f.path, f]));

    for (const { path, blobSha } of files) {
      const existingFile = existingMap.get(path);
      if (!existingFile) {
        await ctx.db.insert("codeDiffFiles", {
          repoId,
          path,
          status: "needs_review",
          blobSha,
        });
      } else if (existingFile.blobSha !== blobSha) {
        if (existingFile.status !== "always_green") {
          await ctx.db.patch(existingFile._id, { status: "needs_review", blobSha });
        } else {
          await ctx.db.patch(existingFile._id, { blobSha });
        }
      }
    }

    // lastSyncAt setzen
    await ctx.db.patch(repoId, { lastSyncAt: Date.now() });
  },
});
