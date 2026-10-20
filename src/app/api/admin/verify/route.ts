import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ authenticated: verifyAdminCookie() });
}
