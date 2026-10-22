import { isSessionBookable } from "./time";

/**
 * Demo Mode data.
 *
 * The showcase build has no database, so the admin dashboard and the booking
 * calendar are populated from the fake sessions/bookings below. Everything is
 * generated relative to "now" so the demo always looks fresh.
 */

export type MockSessionStatus = "active" | "completed" | "cancelled";

export interface MockBooking {
  id: number;
  sessionId: number;
  firstName: string;
  lastName: string;
  email: string;
  participants: number;
  gender: string;
  attended: boolean;
  createdAt: string;
}

export interface MockSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  notes: string | null;
  status: MockSessionStatus;
  createdAt: string;
  bookings: MockBooking[];
}

const HS = "Athletic Development (High School)";
const UNI = "Athletic Development (University/College)";
const WOMEN = "Women's Strength & Stretch";
const MEN = "Men's Strength & Conditioning";

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function hhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

function shift(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}

function booking(
  id: number,
  sessionId: number,
  firstName: string,
  lastName: string,
  email: string,
  gender: string,
  attended = false,
  participants = 1
): MockBooking {
  return {
    id,
    sessionId,
    firstName,
    lastName,
    email,
    gender,
    attended,
    participants,
    createdAt: new Date().toISOString(),
  };
}

function session(
  id: number,
  date: string,
  startTime: string,
  endTime: string,
  type: string,
  status: MockSessionStatus,
  notes: string | null,
  bookings: MockBooking[]
): MockSession {
  return {
    id,
    date,
    startTime,
    endTime,
    type,
    status,
    notes,
    bookings,
    createdAt: new Date().toISOString(),
  };
}

/** Fake sessions covering all three admin sections. */
export function getMockSessions(): MockSession[] {
  const now = new Date();
  const plus2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const dynStart = hhmm(plus2h);

  return [
    // --- today (appears in Current/Future and the Register Form) ---
    session(1, shift(0), "09:00", "10:30", HS, "active", "Morning speed & agility", [
      booking(1, 1, "Ava", "Thompson", "ava.thompson@example.com", "Female", false, 1),
      booking(2, 1, "Liam", "Chen", "liam.chen@example.com", "Male", false, 2),
    ]),
    // Always bookable: exactly two hours from now.
    session(9, isoDate(plus2h), dynStart, addMinutes(dynStart, 90), MEN, "active", "Open session", [
      booking(9, 9, "Emma", "Clarke", "emma.clarke@example.com", "Female", false, 1),
    ]),
    // --- upcoming ---
    session(3, shift(1), "10:00", "11:30", UNI, "active", "Combine prep", []),
    session(4, shift(2), "18:00", "19:30", WOMEN, "active", "Mobility & core", [
      booking(4, 4, "Mia", "Rossi", "mia.rossi@example.com", "Female", false, 1),
    ]),
    session(5, shift(4), "09:00", "10:30", HS, "active", "Field session", []),
    // --- recent past (still active, shown in the Register Form) ---
    session(6, shift(-2), "14:00", "15:30", MEN, "active", "Lower body", [
      booking(6, 6, "Ethan", "Kim", "ethan.kim@example.com", "Male", false, 1),
    ]),
    // --- history ---
    session(7, shift(-3), "10:00", "11:30", HS, "completed", "Attended", [
      booking(7, 7, "Sofia", "Martinez", "sofia.martinez@example.com", "Female", true, 1),
      booking(8, 7, "Lucas", "Brown", "lucas.brown@example.com", "Male", false, 1),
    ]),
    session(8, shift(-4), "18:00", "19:30", WOMEN, "cancelled", "Cancelled due to weather", [
      booking(10, 8, "Chloe", "Wilson", "chloe.wilson@example.com", "Female", false, 1),
    ]),
  ];
}

/** Flat list of fake bookings. */
export function getMockBookings(): MockBooking[] {
  return getMockSessions().flatMap((s) => s.bookings);
}

/** Sessions offered on the /register calendar for a date + type. */
export function getMockAvailability(date: string, type: string): MockSession[] {
  return getMockSessions().filter(
    (s) =>
      s.date === date &&
      s.type === type &&
      s.status === "active" &&
      isSessionBookable(s.date, s.startTime)
  );
}
