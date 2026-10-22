"use client";

import { useEffect, useState } from "react";
import { SESSION_TYPES, sessionTypeRank } from "@/lib/sessions";
import { getMockSessions, type MockSession } from "@/lib/mock-data";

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

function byDateTime(a: MockSession, b: MockSession, desc: boolean): number {
  const ka = `${a.date} ${a.startTime}`;
  const kb = `${b.date} ${b.startTime}`;
  if (ka < kb) return desc ? 1 : -1;
  if (ka > kb) return desc ? -1 : 1;
  return sessionTypeRank(a.type) - sessionTypeRank(b.type);
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [sessions, setSessions] = useState<MockSession[]>([]);
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

  // Demo Mode: load fake data from local mock-data (no API, no database).
  useEffect(() => {
    const list = getMockSessions();
    setSessions(list);
    const map: Record<number, boolean> = {};
    for (const s of list) {
      for (const b of s.bookings) map[b.id] = b.attended;
    }
    setAttendance(map);
    setLoading(false);
  }, []);

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

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormStatus(null);
    if (!form.date || !form.startTime || !form.endTime) {
      setFormStatus({
        status: "error",
        message: "Please fill date, start and end time.",
      });
      return;
    }
    // Demo Mode: update local React state only.
    setSessions((prev) => {
      const nextId = Math.max(0, ...prev.map((s) => s.id)) + 1;
      const created: MockSession = {
        id: nextId,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        type: form.type,
        notes: form.notes || null,
        status: "active",
        createdAt: new Date().toISOString(),
        bookings: [],
      };
      return [created, ...prev];
    });
    setFormStatus({ status: "success", message: "Session created (demo only)." });
    setForm({ date: "", startTime: "", endTime: "", type: SESSION_TYPES[0], notes: "" });
  }

  function handleCancel(id: number) {
    if (
      !window.confirm(
        "Cancel this session? (Demo Mode: no email will be sent.)"
      )
    ) {
      return;
    }
    // Demo Mode: move to History in local state only — no API, no emails.
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "cancelled" } : s))
    );
    setMessage("Session cancelled (demo only — no email sent).");
  }

  function handleSave(session: MockSession) {
    // Demo Mode: mark completed + record attendance in local state only.
    setSessions((prev) =>
      prev.map((s) =>
        s.id === session.id
          ? {
              ...s,
              status: "completed",
              bookings: s.bookings.map((b) => ({
                ...b,
                attended: !!attendance[b.id],
              })),
            }
          : s
      )
    );
    setMessage("Attendance saved. Session moved to History (demo only).");
  }

  function handleLogout() {
    onLogout();
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
