"use client";

import { useEffect, useState } from "react";

type Habit = { id: number; name: string; color: string; icon: string };

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f59e0b", "#10b981", "#06b6d4", "#3b82f6",
];

const ICONS = ["⭐", "🧘", "🏃", "🥗", "🚫", "💪", "📚", "😴", "💧", "🎯", "🧠", "❤️"];

const EMPTY_FORM = { name: "", color: "#6366f1", icon: "⭐" };

export default function HabitosPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  async function loadHabits() {
    const r = await fetch("/api/habits");
    setHabits(await r.json());
  }

  useEffect(() => { loadHabits(); }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(h: Habit) {
    setEditing(h);
    setForm({ name: h.name, color: h.color, icon: h.icon });
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) return;
    if (editing) {
      await fetch(`/api/habits/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    loadHabits();
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar este hábito y todo su historial?")) return;
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    loadHabits();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hábitos</h1>
        <button
          onClick={openNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nuevo
        </button>
      </div>

      <div className="space-y-3">
        {habits.map((h) => (
          <div
            key={h.id}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: h.color + "33" }}
            >
              {h.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{h.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: h.color }} />
                <span className="text-xs text-slate-400">{h.color}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEdit(h)}
                className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                ✏️
              </button>
              <button
                onClick={() => remove(h.id)}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold mb-4">{editing ? "Editar hábito" : "Nuevo hábito"}</h2>

            <label className="block text-sm text-slate-600 mb-1">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Meditación"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />

            <label className="block text-sm text-slate-600 mb-2">Ícono</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setForm((f) => ({ ...f, icon }))}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    form.icon === icon ? "bg-indigo-100 ring-2 ring-indigo-500" : "bg-slate-100"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <label className="block text-sm text-slate-600 mb-2">Color</label>
            <div className="flex flex-wrap gap-2 mb-6">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.color === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: form.color + "33" }}
              >
                {form.icon}
              </div>
              <span className="font-medium">{form.name || "Nombre del hábito"}</span>
              <div className="w-2.5 h-2.5 rounded-full ml-auto" style={{ backgroundColor: form.color }} />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={!form.name.trim()}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium disabled:opacity-40 hover:bg-indigo-700 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
