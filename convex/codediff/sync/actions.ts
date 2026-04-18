import { action } from "../../_generated/server";
import { api } from "../../_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

interface GitHubTreeItem {
  path: string;
  type: string;
  sha: string;
}

interface GitHubTreeResponse {
  sha: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

/** Synchronisiert Repository-Dateien aus der GitHub API */
export const syncRepoFromGitHub = action({
  args: { repoId: v.id("codeDiffRepos") },
  handler: async (ctx, { repoId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Nicht authentifiziert.");

    const repo = await ctx.runQuery(api.codediff.repos.queries.get, { id: repoId });
    if (!repo) throw new Error("Repository nicht gefunden.");

    const { owner, name, token, defaultBranch } = repo;
    const branch = defaultBranch || "main";

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Venera-App",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `https://api.github.com/repos/${owner}/${name}/git/trees/${branch}?recursive=1`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "Repository nicht gefunden. Bitte Owner und Name prüfen.",
        );
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Authentifizierung fehlgeschlagen. Bitte GitHub-Token prüfen.",
        );
      }
      throw new Error(`GitHub API Fehler: ${response.status}`);
    }

    const data: GitHubTreeResponse = await response.json();
    const files = data.tree
      .filter((item) => item.type === "blob")
      .map((item) => ({ path: item.path, blobSha: item.sha }));

    await ctx.runMutation(api.codediff.files.mutations.bulkSync, {
      repoId,
      files,
    });

    return { fileCount: files.length, truncated: data.truncated };
  },
});
