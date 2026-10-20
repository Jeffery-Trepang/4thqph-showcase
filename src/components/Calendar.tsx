"use client";

import { useState } from "react";

interface CalendarProps {
  selectedDate: string | null; // YYYY-MM-DD
  onSelect: (date: string) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Calendar({ selectedDate, onSelect }: CalendarProps) {
  const now = new Date();
  const [viewDate, setViewDate] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const monthLabel = firstDay.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded px-2 py-1 text-lg text-black hover:bg-neutral-100"
          aria-label="Previous month"
        >
          &larr;
        </button>
        <div className="text-sm font-semibold text-black">{monthLabel}</div>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded px-2 py-1 text-lg text-black hover:bg-neutral-100"
          aria-label="Next month"
        >
          &rarr;
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-500">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const iso = toISO(d);
          const past = d < todayStart;
          const selected = selectedDate === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={past}
              onClick={() => onSelect(iso)}
              className={`aspect-square rounded text-sm font-medium transition-colors ${
                past
                  ? "cursor-not-allowed text-neutral-300"
                  : selected
                    ? "bg-roseGold text-white"
                    : "text-black hover:bg-neutral-100"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
