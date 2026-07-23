"use client";

import { useEffect, useState } from "react";

type Habit = { id: number; name: string; color: string; icon: string };
type LogMap = Record<number, boolean>;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

export default function HoyPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<LogMap>({});
  const [date, setDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/habits")
      .then((r) => r.json())
      .then(setHabits);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/logs?date=${date}`)
      .then((r) => r.json())
      .then((data: { habitId: number; completed: boolean }[]) => {
        const map: LogMap = {};
        data.forEach((l) => (map[l.habitId] = l.completed));
        setLogs(map);
        setLoading(false);
      });
  }, [date]);

  async function toggle(habitId: number) {
    const newVal = !logs[habitId];
    setLogs((prev) => ({ ...prev, [habitId]: newVal }));
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date, completed: newVal }),
    });
  }

  const isToday = date === todayStr();
  const completed = habits.filter((h) => logs[h.id]).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isToday ? "Hoy" : formatDate(date)}</h1>
          <p className="text-slate-500 text-sm mt-0.5 capitalize">
            {isToday ? formatDate(date) : ""}
          </p>
        </div>
        <input
          type="date"
          value={date}
          max={todayStr()}
          onChange={(e) => setDate(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {habits.length > 0 && (
        <div className="mb-6 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span>Progreso del día</span>
            <span>{completed}/{habits.length}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${habits.length ? (completed / habits.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-slate-400 py-12">Cargando...</div>
        ) : habits.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            No hay hábitos todavía. Creá uno en ⚙️ Hábitos.
          </div>
        ) : (
          habits.map((habit) => {
            const done = !!logs[habit.id];
            return (
              <button
                key={habit.id}
                onClick={() => toggle(habit.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                  done
                    ? "border-transparent shadow-sm"
                    : "bg-white border-slate-100 shadow-sm hover:border-slate-200"
                }`}
                style={done ? { backgroundColor: habit.color + "22", borderColor: habit.color + "44" } : {}}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: habit.color + "33" }}
                >
                  {habit.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">{habit.name}</p>
                  <p className="text-sm text-slate-400">{done ? "Cumplido" : "Pendiente"}</p>
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    done ? "text-white" : "border-2 border-slate-200"
                  }`}
                  style={done ? { backgroundColor: habit.color } : {}}
                >
                  {done && <span className="text-sm">✓</span>}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
