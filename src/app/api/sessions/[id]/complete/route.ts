import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminCookie()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({ where: { id } });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const rawBookings = (body as Record<string, unknown>)?.bookings;
  const bookings = Array.isArray(rawBookings) ? rawBookings : [];

  // Persist each booking's attendance flag (scoped to this session).
  for (const item of bookings) {
    const rec = item as Record<string, unknown>;
    const bookingId = Number(rec.id);
    const attended = Boolean(rec.attended);
    if (Number.isInteger(bookingId) && bookingId > 0) {
      await prisma.booking.updateMany({
        where: { id: bookingId, sessionId: id },
        data: { attended },
      });
    }
  }

  // Archive the session into history.
  await prisma.session.update({
    where: { id },
    data: { status: "completed" },
  });

  return NextResponse.json({ success: true });
}
