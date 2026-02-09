import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { internal } from "@/convex/_generated/api";

export async function GET() {
  // Only allow in development/test
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    // seedForTest is an internalMutation; fetchMutation can invoke it
    // server-side when CONVEX_DEPLOYMENT is set (admin access).
    await fetchMutation(internal.seed.seedForTest as any);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
