import { fetchAction } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";

const signInRef = makeFunctionReference<"action">("auth:signIn");
const signOutRef = makeFunctionReference<"action">("auth:signOut");

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

    const cookieStore = await cookies();
    const token = cookieStore.get("__convexAuthToken")?.value;

    const actionRef = action === "auth:signIn" ? signInRef : signOutRef;
    const result = await fetchAction(actionRef, args, {
      url: CONVEX_URL,
      token,
    });

    const response = NextResponse.json(result);

    if (
      action === "auth:signIn" &&
      result &&
      typeof result === "object" &&
      "token" in result
    ) {
      response.cookies.set("__convexAuthToken", String(result.token), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
    } else if (action === "auth:signOut") {
      response.cookies.delete("__convexAuthToken");
    }

    return response;
  } catch (err) {
    console.error("Auth proxy error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}
