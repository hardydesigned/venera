"use node";
import { action } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import type { SyncItem } from "../_model/item";

// WebDAV PROPFIND XML-Response parsen
function parseWebDavXml(xml: string): SyncItem[] {
  const items: SyncItem[] = [];
  const responseRegex = /<[Dd]:response[^>]*>([\s\S]*?)<\/[Dd]:response>/g;
  let match;

  while ((match = responseRegex.exec(xml)) !== null) {
    const block = match[1];

    const hrefMatch = /<[Dd]:href[^>]*>(.*?)<\/[Dd]:href>/.exec(block);
    if (!hrefMatch) continue;
    const href = decodeURIComponent(hrefMatch[1].trim());

    const isFolder = /<[Dd]:collection/.test(block);
    const type: "file" | "folder" = isFolder ? "folder" : "file";

    const parts = href.replace(/\/$/, "").split("/").filter(Boolean);
    const name = parts[parts.length - 1] ?? href;

    const sizeMatch = /<[Dd]:getcontentlength[^>]*>(.*?)<\/[Dd]:getcontentlength>/.exec(block);
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : undefined;

    const modMatch = /<[Dd]:getlastmodified[^>]*>(.*?)<\/[Dd]:getlastmodified>/.exec(block);
    const lastModified = modMatch ? new Date(modMatch[1]).getTime() : undefined;

    const ctMatch = /<[Dd]:getcontenttype[^>]*>(.*?)<\/[Dd]:getcontenttype>/.exec(block);
    const contentType = ctMatch ? ctMatch[1] : undefined;

    const etagMatch = /<[Dd]:getetag[^>]*>(.*?)<\/[Dd]:getetag>/.exec(block);
    const etag = etagMatch ? etagMatch[1].replace(/"/g, "") : undefined;

    items.push({ path: href, name, type, size, lastModified, contentType, etag });
  }

  return items;
}

export const syncFromNextcloud = action({
  args: { connectionId: v.id("dataLakeConnections") },
  handler: async (ctx, { connectionId }) => {
    const connection = await ctx.runQuery(
      api.datalake.connections.queries.get,
      { id: connectionId },
    );
    if (!connection) throw new Error("Verbindung nicht gefunden");

    const { webdavUrl, username, password } = connection;
    if (!webdavUrl || !username || !password) {
      throw new Error("Verbindungsdaten unvollständig (URL, Benutzername und Passwort erforderlich)");
    }

    const credentials = Buffer.from(`${username}:${password}`).toString("base64");

    const response = await fetch(webdavUrl, {
      method: "PROPFIND",
      headers: {
        Authorization: `Basic ${credentials}`,
        Depth: "infinity",
        "Content-Type": "application/xml; charset=utf-8",
      },
      body: `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:">
  <d:prop>
    <d:resourcetype/>
    <d:getcontentlength/>
    <d:getlastmodified/>
    <d:getcontenttype/>
    <d:getetag/>
  </d:prop>
</d:propfind>`,
    });

    if (!response.ok) {
      throw new Error(`WebDAV-Fehler: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const items = parseWebDavXml(xml);

    await ctx.runMutation(api.datalake.items.mutations.bulkSync, {
      connectionId,
      items,
    });

    await ctx.runMutation(api.datalake.connections.mutations.setLastSync, {
      id: connectionId,
    });

    return { synced: items.length };
  },
});
