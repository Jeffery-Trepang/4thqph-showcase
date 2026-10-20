import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendBookingEmails } from "@/lib/mailer";
import { verifyAdminCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENDERS = ["Male", "Female", "Prefer not to say"];

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const sessionId = b.sessionId;
  const firstName = b.firstName;
  const lastName = b.lastName;
  const email = b.email;
  const participants = b.participants;
  const gender = b.gender;

  // --- Server-side validation ---
  if (typeof sessionId !== "number" || !Number.isInteger(sessionId) || sessionId < 1) {
    return NextResponse.json({ error: "A session must be selected" }, { status: 400 });
  }
  if (typeof firstName !== "string" || !firstName.trim()) {
    return NextResponse.json({ error: "First name is required" }, { status: 400 });
  }
  if (typeof lastName !== "string" || !lastName.trim()) {
    return NextResponse.json({ error: "Last name is required" }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  const participantsNum = Number(participants);
  if (
    typeof participants !== "number" &&
    typeof participants !== "string"
  ) {
    return NextResponse.json(
      { error: "Number of participants must be a positive integer" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(participantsNum) || participantsNum < 1) {
    return NextResponse.json(
      { error: "Number of participants must be a positive integer" },
      { status: 400 }
    );
  }
  if (typeof gender !== "string" || !GENDERS.includes(gender)) {
    return NextResponse.json({ error: "Please select a gender" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 400 });
  }

  // Reject non-active sessions (completed/cancelled) — second line of defense.
  if (session.status !== "active") {
    return NextResponse.json(
      { error: "This session is no longer available for booking" },
      { status: 400 }
    );
  }

  // Reject sessions starting in less than 20 minutes (or already started).
  const [sy, sm, sd] = session.date.split("-").map(Number);
  const [shh, smm] = session.startTime.split(":").map(Number);
  const sessionStart = new Date(sy, sm - 1, sd, shh, smm).getTime();
  if (sessionStart - Date.now() < 20 * 60 * 1000) {
    return NextResponse.json(
      { error: "Booking closed: session starts in less than 20 minutes." },
      { status: 400 }
    );
  }

  // --- Save the booking (no capacity limit) ---
  const booking = await prisma.booking.create({
    data: {
      sessionId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      participants: participantsNum,
      gender,
    },
  });

  // --- Send emails; keep the booking even if email fails ---
  let warning: string | undefined;
  try {
    const mail = await sendBookingEmails({
      sessionType: session.type,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      participants: booking.participants,
      gender: booking.gender,
      notes: session.notes,
    });
    const problems: string[] = [];
    if (!mail.adminSent) {
      problems.push(`Admin email not sent (${mail.adminError ?? "unknown error"})`);
    }
    if (!mail.customerSent) {
      problems.push(`Customer email not sent (${mail.customerError ?? "unknown error"})`);
    }
    if (problems.length > 0) warning = problems.join("; ");
  } catch (err) {
    warning =
      "Booking saved, but email sending failed: " +
      (err instanceof Error ? err.message : String(err));
  }

  return NextResponse.json(
    { success: true, booking: { id: booking.id }, warning },
    { status: 201 }
  );
}

export async function GET() {
  if (!verifyAdminCookie()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bookings = await prisma.booking.findMany({
    include: { session: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bookings });
}
