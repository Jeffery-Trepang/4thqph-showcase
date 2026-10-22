"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Calendar from "@/components/Calendar";
import { SESSION_TYPES, sessionTypeFromSlug } from "@/lib/sessions";
import { getMockAvailability, type MockSession } from "@/lib/mock-data";

const GENDERS = ["Male", "Female", "Prefer not to say"] as const;

const DEMO_MESSAGE =
  "Demo Mode: Booking received! (This is a showcase website, no data was saved.)";

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
  const [availability, setAvailability] = useState<MockSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<MockSession | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState("");
  const [gender, setGender] = useState("");

  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  function chooseType(type: string) {
    setSessionType(type);
    setSelectedDate(null);
    setAvailability([]);
    setSelectedSession(null);
    setDemoMessage(null);
  }

  function chooseDate(date: string) {
    setSelectedDate(date);
    setSelectedSession(null);
    setDemoMessage(null);
    // Demo Mode: availability comes from local mock data, not an API.
    setAvailability(getMockAvailability(date, sessionType));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSession) return;
    // Demo Mode: no network request — just show the confirmation and reset.
    setDemoMessage(DEMO_MESSAGE);
    setFirstName("");
    setLastName("");
    setEmail("");
    setParticipants("");
    setGender("");
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
                    {availability.length === 0 ? (
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
                                setDemoMessage(null);
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
              className="mt-6 w-full rounded-md bg-roseGold px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-roseGold-dark"
            >
              Register Now
            </button>
          </form>
        )}

        {/* Demo Mode confirmation modal */}
        {demoMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div
              role="dialog"
              aria-modal="true"
              className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            >
              <p className="text-base font-medium text-black">{demoMessage}</p>
              <button
                onClick={() => setDemoMessage(null)}
                className="mt-5 w-full rounded-md bg-roseGold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-roseGold-dark"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
