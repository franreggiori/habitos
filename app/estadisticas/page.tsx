"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

type Habit = { id: number; name: string; color: string; icon: string; createdAt: string };
type Log = { habitId: number; date: string; completed: boolean };

function padTwo(n: number) {
  return String(n).padStart(2, "0");
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${padTwo(d.getMonth() + 1)}-${padTwo(d.getDate())}`;
}

function weekLabel(monday: Date) {
  const sunday = addDays(monday, 6);
  const mStr = `${monday.getDate()}/${monday.getMonth() + 1}`;
  const sStr = `${sunday.getDate()}/${sunday.getMonth() + 1}`;
  return `${mStr}-${sStr}`;
}

function getMondayOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

type RangeKey = "7" | "30" | "all";

export default function EstadisticasPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [range, setRange] = useState<RangeKey>("30");

  const today = new Date();

  useEffect(() => {
    fetch("/api/habits")
      .then((r) => r.json())
      .then(setHabits);
  }, []);

  useEffect(() => {
    if (habits.length === 0) return;
    let from: string;
    if (range === "all") {
      const earliest = habits.reduce((min, h) => {
        const d = h.createdAt.slice(0, 10);
        return d < min ? d : min;
      }, toDateStr(today));
      from = earliest;
    } else {
      from = toDateStr(addDays(today, -Number(range) + 1));
    }
    const to = toDateStr(today);
    fetch(`/api/logs?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setLogs);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, habits]);

  if (habits.length === 0) {
    return <div className="text-center text-slate-400 py-20">Cargando...</div>;
  }

  // --- Per-habit stats ---
  const habitStats = habits.map((h) => {
    const completedLogs = logs.filter((l) => l.habitId === h.id && l.completed);
    // count unique dates in range
    const dates = new Set(logs.map((l) => l.date));
    const total = dates.size;
    return {
      ...h,
      completed: completedLogs.length,
      total,
      pct: total ? Math.round((completedLogs.length / total) * 100) : 0,
    };
  });

  const worst = [...habitStats].sort((a, b) => a.pct - b.pct)[0];

  // --- Días ganados / neutros / perdidos ---
  const completedPerDay = new Map<string, number>();
  logs.filter((l) => l.completed).forEach((l) => {
    completedPerDay.set(l.date, (completedPerDay.get(l.date) ?? 0) + 1);
  });
  let diasGanados = 0, diasNeutros = 0, diasPerdidos = 0;
  completedPerDay.forEach((count) => {
    if (count >= 7) diasGanados++;
    else if (count <= 3) diasPerdidos++;
    else diasNeutros++;
  });

  // --- Weekly scores ---
  const allDates = [...new Set(logs.map((l) => l.date))].sort();
  if (allDates.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Estadísticas</h1>
        <p className="text-slate-400 text-center py-12">Todavía no hay registros. ¡Empezá a trackear hoy!</p>
      </div>
    );
  }

  const firstDate = new Date(allDates[0] + "T00:00:00");
  const firstMonday = getMondayOfWeek(firstDate);
  const lastMonday = getMondayOfWeek(today);

  const weeks: { label: string; score: number; monday: Date }[] = [];
  let cursor = new Date(firstMonday);
  while (cursor <= lastMonday) {
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      weekDates.push(toDateStr(addDays(cursor, i)));
    }
    const trackedDates = weekDates.filter((d) => allDates.includes(d));
    let score = 0;
    if (trackedDates.length > 0) {
      const totalPossible = trackedDates.length * habits.length;
      const done = logs.filter(
        (l) => l.completed && trackedDates.includes(l.date)
      ).length;
      score = totalPossible ? Math.round((done / totalPossible) * 100) : 0;
    }
    weeks.push({ label: weekLabel(cursor), score, monday: new Date(cursor) });
    cursor = addDays(cursor, 7);
  }

  const recentWeeks = weeks.slice(-8);
  const currentWeek = weeks[weeks.length - 1];
  const best = [...recentWeeks].sort((a, b) => b.score - a.score)[0];
  const poorest = [...recentWeeks].sort((a, b) => a.score - b.score)[0];

  const rangeLabels: Record<RangeKey, string> = {
    "7": "Última semana",
    "30": "Último mes",
    "all": "Todo el historial",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Estadísticas</h1>

      <div className="flex gap-2 mb-6">
        {(Object.keys(rangeLabels) as RangeKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setRange(k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              range === k
                ? "bg-indigo-600 text-white"
                : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            {rangeLabels[k]}
          </button>
        ))}
      </div>

      {/* Días ganados / neutros / perdidos */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{diasGanados}</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">Ganados</div>
          <div className="text-xs text-emerald-500 mt-0.5">7+ hábitos</div>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-slate-500">{diasNeutros}</div>
          <div className="text-xs text-slate-600 font-medium mt-1">Neutros</div>
          <div className="text-xs text-slate-400 mt-0.5">4 a 6 hábitos</div>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-rose-500">{diasPerdidos}</div>
          <div className="text-xs text-rose-700 font-medium mt-1">Perdidos</div>
          <div className="text-xs text-rose-400 mt-0.5">3 o menos</div>
        </div>
      </div>

      {/* Per-habit stats */}
      <div className="space-y-3 mb-8">
        {habitStats.map((h) => (
          <div key={h.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">{h.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{h.name}</span>
                  <span className="text-slate-500">{h.completed}/{h.total} días · {h.pct}%</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${h.pct}%`, backgroundColor: h.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Weekly score chart */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6">
        <h2 className="font-semibold mb-4">Score semanal</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={recentWeeks} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              tickFormatter={(v: string) => v.split("-")[0]}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
            <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {recentWeeks.map((w, i) => (
                <Cell
                  key={i}
                  fill={
                    w.label === currentWeek?.label
                      ? "#6366f1"
                      : "#c7d2fe"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <h2 className="font-semibold">Resumen (últimas 8 semanas)</h2>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Mejor semana</span>
          <span className="font-medium text-emerald-600">{best?.label} · {best?.score}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Peor semana</span>
          <span className="font-medium text-rose-500">{poorest?.label} · {poorest?.score}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Hábito más difícil</span>
          <span className="font-medium text-amber-600">{worst?.icon} {worst?.name} ({worst?.pct}%)</span>
        </div>
      </div>
    </div>
  );
}
