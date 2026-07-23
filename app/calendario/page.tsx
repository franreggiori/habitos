"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Habit = { id: number; name: string; color: string; icon: string };
type Log = { habitId: number; date: string; completed: boolean };

function padTwo(n: number) {
  return String(n).padStart(2, "0");
}

function dateStr(y: number, m: number, d: number) {
  return `${y}-${padTwo(m + 1)}-${padTwo(d)}`;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAY_NAMES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

export default function CalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch("/api/habits")
      .then((r) => r.json())
      .then(setHabits);
  }, []);

  useEffect(() => {
    const from = dateStr(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = dateStr(year, month, lastDay);
    fetch(`/api/logs?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setLogs);
  }, [year, month]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    const n = new Date(year, month + 1, 1);
    if (n > today) return;
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const firstDayOfMonth = new Date(year, month, 1);
  // Monday = 0, Sunday = 6
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function logsForDay(d: number) {
    const ds = dateStr(year, month, d);
    return logs.filter((l) => l.date === ds && l.completed);
  }

  function isToday(d: number) {
    return year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
  }

  const isFutureMonth =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth());

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">‹</button>
        <h2 className="text-xl font-bold">{MONTH_NAMES[month]} {year}</h2>
        <button
          onClick={nextMonth}
          disabled={isFutureMonth}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs text-slate-400 font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const dayLogs = logsForDay(d);
          const total = habits.length;
          const ratio = total ? dayLogs.length / total : 0;
          const ds = dateStr(year, month, d);
          const isFuture =
            new Date(year, month, d) > today;

          return (
            <Link
              key={d}
              href={isFuture ? "#" : `/?date=${ds}`}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all ${
                isToday(d)
                  ? "ring-2 ring-indigo-500"
                  : ""
              } ${
                isFuture
                  ? "opacity-30 cursor-default"
                  : "hover:bg-slate-100 cursor-pointer"
              } ${
                ratio === 1 && !isFuture ? "bg-indigo-100 text-indigo-700" : "text-slate-700"
              }`}
            >
              <span>{d}</span>
              {total > 0 && !isFuture && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[32px]">
                  {habits.map((h) => {
                    const done = dayLogs.some((l) => l.habitId === h.id);
                    return (
                      <div
                        key={h.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: done ? h.color : "#e2e8f0" }}
                      />
                    );
                  })}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {habits.map((h) => (
          <div key={h.id} className="flex items-center gap-1.5 text-sm text-slate-600">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
            {h.name}
          </div>
        ))}
      </div>
    </div>
  );
}
