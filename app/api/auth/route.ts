import { fetchAction } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

function getCookieNames(host: string) {
  const isLocalhost =
    host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const prefix = isLocalhost ? "" : "__Host-";
  return {
    token: prefix + "__convexAuthJWT",
    refreshToken: prefix + "__convexAuthRefreshToken",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action: string;
      args: Record<string, unknown>;
    };
    const { action, args } = body;

    if (action !== "auth:signIn" && action !== "auth:signOut") {
      return new Response("Invalid action", { status: 400 });
    }

    const requestHeaders = await headers();
    const host = requestHeaders.get("host") ?? "localhost";
    const names = getCookieNames(host);
    const cookieStore = await cookies();

    if (action === "auth:signIn") {
      // Replace dummy refresh token with the real one stored in httpOnly cookie
      if (args.refreshToken !== undefined) {
        const storedRefreshToken = cookieStore.get(names.refreshToken)?.value;
        if (!storedRefreshToken) {
          return NextResponse.json({ tokens: null });
        }
        args.refreshToken = storedRefreshToken;
      }
    }

    const existingToken = cookieStore.get(names.token)?.value;

    let result: Record<string, unknown>;
    try {
      result = (await fetchAction(
        action as "auth:signIn" | "auth:signOut",
        args,
        { url: CONVEX_URL, token: existingToken },
      )) as Record<string, unknown>;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: mapAuthError(message) }, { status: 400 });
    }

    if (action === "auth:signOut") {
      const response = NextResponse.json(null);
      response.cookies.set(names.token, "", { maxAge: 0 });
      response.cookies.set(names.refreshToken, "", { maxAge: 0 });
      return response;
    }

    // auth:signIn
    if (result.tokens !== undefined) {
      const tokens = result.tokens as {
        token: string;
        refreshToken: string;
      } | null;

      const response = NextResponse.json({
        tokens:
          tokens !== null
            ? { token: tokens.token, refreshToken: "dummy" }
            : null,
      });

      if (tokens !== null) {
        const cookieOpts = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as const,
          path: "/",
        };
        response.cookies.set(names.token, tokens.token, cookieOpts);
        response.cookies.set(
          names.refreshToken,
          tokens.refreshToken,
          cookieOpts,
        );
      } else {
        response.cookies.set(names.token, "", { maxAge: 0 });
        response.cookies.set(names.refreshToken, "", { maxAge: 0 });
      }

      return response;
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Auth proxy error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

function mapAuthError(message: string): string {
  if (message.includes("already exists")) {
    return "Ein Konto mit dieser E-Mail-Adresse existiert bereits.";
  }
  if (message.includes("InvalidSecret") || message.includes("InvalidAccountId")) {
    return "E-Mail oder Passwort ist falsch.";
  }
  if (message.includes("AuthProviderDiscoveryFailed")) {
    return "Authentifizierungsdienst nicht verfügbar. Bitte später erneut versuchen.";
  }
  if (message.includes("Missing environment variable")) {
    return "Serverkonfigurationsfehler. Bitte den Administrator kontaktieren.";
  }
  return "Anmeldung fehlgeschlagen. Bitte erneut versuchen.";
}
