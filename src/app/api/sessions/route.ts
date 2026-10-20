import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/auth";
import { isSessionType } from "@/lib/sessions";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidCalendarDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export async function GET() {
  if (!verifyAdminCookie()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = await prisma.session.findMany({
    include: { bookings: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  if (!verifyAdminCookie()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const date = b.date;
  const startTime = b.startTime;
  const endTime = b.endTime;
  const type = b.type;
  const notes = b.notes;

  if (typeof date !== "string" || !isValidCalendarDate(date)) {
    return NextResponse.json(
      { error: "A valid date (YYYY-MM-DD) is required" },
      { status: 400 }
    );
  }
  if (typeof startTime !== "string" || !TIME_RE.test(startTime)) {
    return NextResponse.json(
      { error: "A valid start time (HH:MM) is required" },
      { status: 400 }
    );
  }
  if (typeof endTime !== "string" || !TIME_RE.test(endTime)) {
    return NextResponse.json(
      { error: "A valid end time (HH:MM) is required" },
      { status: 400 }
    );
  }
  if (startTime >= endTime) {
    return NextResponse.json(
      { error: "End time must be after start time" },
      { status: 400 }
    );
  }
  if (typeof type !== "string" || !isSessionType(type)) {
    return NextResponse.json(
      { error: "A valid session type is required" },
      { status: 400 }
    );
  }

  const session = await prisma.session.create({
    data: {
      date,
      startTime,
      endTime,
      type,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    },
  });

  return NextResponse.json({ success: true, session }, { status: 201 });
}
