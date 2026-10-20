"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Calendar from "@/components/Calendar";
import { SESSION_TYPES, sessionTypeFromSlug } from "@/lib/sessions";

interface Session {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  notes: string | null;
}

const GENDERS = ["Male", "Female", "Prefer not to say"] as const;

function prettyDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function weekdayOf(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long" });
}

export default function RegisterClient() {
  const searchParams = useSearchParams();
  const [sessionType, setSessionType] = useState<string>(
    () => sessionTypeFromSlug(searchParams.get("type")) ?? ""
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Session[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [availError, setAvailError] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState("");
  const [gender, setGender] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    status: "success" | "error";
    message: string;
    warning?: string;
  } | null>(null);

  function chooseType(type: string) {
    setSessionType(type);
    setSelectedDate(null);
    setAvailability([]);
    setSelectedSession(null);
    setAvailError("");
    setResult(null);
  }

  async function chooseDate(date: string) {
    setSelectedDate(date);
    setSelectedSession(null);
    setResult(null);
    setAvailError("");
    setLoadingAvail(true);
    try {
      const res = await fetch(
        `/api/availability?date=${encodeURIComponent(date)}&type=${encodeURIComponent(sessionType)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load availability");
      setAvailability(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (err) {
      setAvailError(err instanceof Error ? err.message : "Failed to load availability");
      setAvailability([]);
    } finally {
      setLoadingAvail(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSession) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          firstName,
          lastName,
          email,
          participants: Number(participants),
          gender,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ status: "error", message: data.error || "Registration failed" });
        return;
      }
      setResult({
        status: "success",
        message: "Registration successful! We'll see you there.",
        warning: data.warning,
      });
      setFirstName("");
      setLastName("");
      setEmail("");
      setParticipants("");
      setGender("");
    } catch (err) {
      setResult({
        status: "error",
        message: err instanceof Error ? err.message : "Registration failed",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-4xl font-bold text-black sm:text-5xl">
          Register a Session Today!
        </h1>

        {/* Step 1 — session type */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-black">
            1. Choose a session type
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SESSION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => chooseType(type)}
                className={`rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  sessionType === type
                    ? "border-roseGold bg-roseGold text-white"
                    : "border-neutral-300 text-black hover:border-roseGold"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {sessionType && (
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            {/* Step 2 — date */}
            <div>
              <h2 className="text-lg font-semibold text-black">2. Pick a date</h2>
              <div className="mt-4">
                <Calendar selectedDate={selectedDate} onSelect={chooseDate} />
              </div>
            </div>

            {/* Step 3 — time */}
            <div>
              <h2 className="text-lg font-semibold text-black">3. Pick a time</h2>
              <div className="mt-4">
                {selectedDate ? (
                  <>
                    <p className="text-sm font-semibold text-black">
                      Availability for &apos;{weekdayOf(selectedDate)}&apos;, &apos;
                      {prettyDate(selectedDate)}&apos;
                    </p>
                    {loadingAvail ? (
                      <p className="mt-4 text-sm text-neutral-500">Loading…</p>
                    ) : availError ? (
                      <p className="mt-4 text-sm text-red-600">{availError}</p>
                    ) : availability.length === 0 ? (
                      <p className="mt-4 text-sm text-neutral-500">
                        No sessions available for this date. Please pick another
                        date.
                      </p>
                    ) : (
                      <ul className="mt-4 grid gap-2">
                        {availability.map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSession(s);
                                setResult(null);
                              }}
                              className={`w-full rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors ${
                                selectedSession?.id === s.id
                                  ? "border-roseGold bg-roseGold text-white"
                                  : "border-neutral-300 text-black hover:border-roseGold"
                              }`}
                            >
                              {s.startTime} – {s.endTime}
                              {s.notes ? ` — ${s.notes}` : ""}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-neutral-500">
                    Pick a date to see available time slots.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — details form */}
        {selectedSession && (
          <form
            onSubmit={handleSubmit}
            className="mt-12 max-w-xl rounded-lg border border-neutral-200 p-6"
          >
            <h2 className="text-lg font-semibold text-black">4. Your details</h2>
            <p className="mt-2 text-sm text-neutral-600">
              {sessionType} — {prettyDate(selectedDate!)} ({weekdayOf(selectedDate!)}
              ) at {selectedSession.startTime}–{selectedSession.endTime}
            </p>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-black">
                    First Name
                  </label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">
                    Last Name
                  </label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Number of Participants
                </label>
                <input
                  required
                  type="number"
                  min={1}
                  step={1}
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30"
                />
              </div>

              <div>
                <span className="block text-sm font-medium text-black">Gender</span>
                <div className="mt-2 flex flex-wrap gap-5">
                  {GENDERS.map((g) => (
                    <label key={g} className="flex items-center gap-2 text-sm text-black">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        required
                        checked={gender === g}
                        onChange={() => setGender(g)}
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-md bg-roseGold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-roseGold-dark disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Register Now"}
            </button>
          </form>
        )}

        {result && (
          <div
            className={`mt-8 rounded-md p-4 ${
              result.status === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            <p className="text-sm font-medium">{result.message}</p>
            {result.warning && (
              <p className="mt-2 text-sm text-amber-700">{result.warning}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
