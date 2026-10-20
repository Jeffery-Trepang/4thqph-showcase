import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/auth";
import { sendCancellationEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminCookie()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { id },
    include: { bookings: true },
  });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Soft delete: mark the session cancelled instead of removing it.
  await prisma.session.update({
    where: { id },
    data: { status: "cancelled" },
  });

  // Send apology emails to every booked customer.
  let emailed = 0;
  let failed = 0;
  for (const booking of session.bookings) {
    const res = await sendCancellationEmail({
      sessionType: session.type,
      date: session.date,
      startTime: session.startTime,
      firstName: booking.firstName,
      email: booking.email,
    });
    if (res.sent) emailed += 1;
    else failed += 1;
  }

  return NextResponse.json({ success: true, emailed, failed });
}
