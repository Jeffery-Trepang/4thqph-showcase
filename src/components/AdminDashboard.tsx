"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_TYPES, sessionTypeRank } from "@/lib/sessions";

interface Booking {
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

interface Session {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  notes: string | null;
  status: string;
  createdAt: string;
  bookings: Booking[];
}

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function byDateTime(a: Session, b: Session, desc: boolean): number {
  const ka = `${a.date} ${a.startTime}`;
  const kb = `${b.date} ${b.startTime}`;
  if (ka < kb) return desc ? 1 : -1;
  if (ka > kb) return desc ? -1 : 1;
  return sessionTypeRank(a.type) - sessionTypeRank(b.type);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    notes: string;
  }>({
    date: "",
    startTime: "",
    endTime: "",
    type: SESSION_TYPES[0],
    notes: "",
  });
  const [formStatus, setFormStatus] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    const list: Session[] = res.ok ? data.sessions ?? [] : [];
    setSessions(list);
    const map: Record<number, boolean> = {};
    for (const s of list) {
      for (const b of s.bookings) map[b.id] = b.attended;
    }
    setAttendance(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // "today" is derived from local time, so date comparisons never shift due to UTC.
  const today = todayISO();

  const currentSessions = sessions
    .filter((s) => s.status === "active")
    .sort((a, b) => byDateTime(a, b, false));

  const registerSessions = sessions
    .filter((s) => s.status === "active" && s.date <= today)
    .sort((a, b) => byDateTime(a, b, false));

  const historySessions = sessions
    .filter((s) => s.status === "completed" || s.status === "cancelled")
    .sort((a, b) => byDateTime(a, b, true));

  function toggleAttendance(bookingId: number) {
    setAttendance((prev) => ({ ...prev, [bookingId]: !prev[bookingId] }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormStatus(null);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        type: form.type,
        notes: form.notes || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setFormStatus({ status: "error", message: data.error || "Failed to create session" });
      return;
    }
    setFormStatus({ status: "success", message: "Session created" });
    setForm({ date: "", startTime: "", endTime: "", type: SESSION_TYPES[0], notes: "" });
    await loadData();
  }

  async function handleCancel(id: number) {
    if (
      !window.confirm(
        "Cancel this session? A cancellation email will be sent to each registered client."
      )
    ) {
      return;
    }
    const res = await fetch(`/api/sessions/${id}/cancel`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      window.alert(data.error || "Failed to cancel session");
      return;
    }
    setMessage(`Session cancelled${data.emailed ? ` — ${data.emailed} email(s) sent` : ""}.`);
    await loadData();
  }

  async function handleSave(session: Session) {
    const bookings = session.bookings.map((b) => ({
      id: b.id,
      attended: !!attendance[b.id],
    }));
    const res = await fetch(`/api/sessions/${session.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookings }),
    });
    const data = await res.json();
    if (!res.ok) {
      window.alert(data.error || "Failed to save attendance");
      return;
    }
    setMessage("Attendance saved. Session moved to History.");
    await loadData();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-neutral-100 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-700"
          >
            Log out
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-md bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
            {message}
          </p>
        )}

        {/* Create session */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black">Create a session</h2>
          <form onSubmit={handleCreate} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-black">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Start time</label>
              <input
                type="time"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">End time</label>
              <input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Session type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30"
              >
                {SESSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium text-black">
                Notes (optional)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="rounded-md bg-roseGold px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-roseGold-dark"
              >
                Create session
              </button>
            </div>
          </form>
          {formStatus && (
            <p
              className={`mt-4 text-sm font-medium ${
                formStatus.status === "success" ? "text-green-700" : "text-red-600"
              }`}
            >
              {formStatus.message}
            </p>
          )}
        </div>

        {/* Section A: Current/Future Sessions */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black">Current/Future Sessions</h2>
          {loading ? (
            <p className="mt-4 text-sm text-neutral-500">Loading…</p>
          ) : currentSessions.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No upcoming sessions.</p>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-200">
              {currentSessions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="text-sm text-black">
                    <span className="font-semibold">{s.type}</span> —{" "}
                    {prettyDate(s.date)}, {s.startTime}–{s.endTime}
                  </div>
                  <button
                    onClick={() => handleCancel(s.id)}
                    className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Cancel Session
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Section B: Register Form */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black">Register Form</h2>
          {loading ? (
            <p className="mt-4 text-sm text-neutral-500">Loading…</p>
          ) : registerSessions.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">
              No past sessions awaiting attendance.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-6">
              {registerSessions.map((s) => (
                <div key={s.id} className="rounded-md border border-neutral-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-black">
                      {s.type} — {prettyDate(s.date)}, {s.startTime}–{s.endTime}
                    </div>
                    <button
                      onClick={() => handleSave(s)}
                      className="shrink-0 rounded-md bg-roseGold px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-roseGold-dark"
                    >
                      Save Session
                    </button>
                  </div>
                  {s.bookings.length === 0 ? (
                    <p className="mt-2 text-sm text-neutral-500">No registrations.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-neutral-100">
                      {s.bookings.map((b) => (
                        <li key={b.id} className="py-2">
                          <label className="flex cursor-pointer items-center gap-3 text-sm text-black">
                            <input
                              type="checkbox"
                              checked={!!attendance[b.id]}
                              onChange={() => toggleAttendance(b.id)}
                              className="h-4 w-4 accent-roseGold"
                            />
                            <span>
                              {b.firstName} {b.lastName} - {b.gender} - {b.email}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section C: History Sessions */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-black">History Sessions</h2>
          {loading ? (
            <p className="mt-4 text-sm text-neutral-500">Loading…</p>
          ) : historySessions.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No history yet.</p>
          ) : (
            <div className="mt-4 flex flex-col gap-6">
              {historySessions.map((s) => {
                const cancelled = s.status === "cancelled";
                return (
                  <div
                    key={s.id}
                    className={`rounded-md border p-4 ${
                      cancelled ? "border-neutral-200 bg-neutral-100" : "border-neutral-200"
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        cancelled ? "text-neutral-400" : "text-black"
                      }`}
                    >
                      {s.type} — {prettyDate(s.date)}, {s.startTime}–{s.endTime}
                      {cancelled ? " (Cancelled)" : ""}
                    </div>
                    {s.bookings.length === 0 ? (
                      <p className="mt-2 text-sm text-neutral-400">No registrations.</p>
                    ) : (
                      <ul className="mt-2 divide-y divide-neutral-100">
                        {s.bookings.map((b) => (
                          <li
                            key={b.id}
                            className={`py-2 text-sm ${
                              cancelled ? "text-neutral-400" : "text-black"
                            }`}
                          >
                            {b.firstName} {b.lastName} - {b.gender} - {b.email} -{" "}
                            {cancelled ? "Cancelled" : `Attended: ${b.attended ? "Yes" : "No"}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
