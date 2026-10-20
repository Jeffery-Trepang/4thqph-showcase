import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSessionType } from "@/lib/sessions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const type = searchParams.get("type");

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  if (!type || !isSessionType(type)) {
    return NextResponse.json({ error: "invalid session type" }, { status: 400 });
  }

  const sessions = await prisma.session.findMany({
    where: { date, type, status: "active" },
    orderBy: { startTime: "asc" },
  });

  // Only offer sessions that start at least 20 minutes from now.
  const cutoff = Date.now() + 20 * 60 * 1000;
  const bookable = sessions.filter((s) => {
    const [y, m, d] = s.date.split("-").map(Number);
    const [hh, mm] = s.startTime.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm).getTime() >= cutoff;
  });

  return NextResponse.json({ sessions: bookable });
}
