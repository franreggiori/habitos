"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Hoy", icon: "✅" },
  { href: "/calendario", label: "Calendario", icon: "📅" },
  { href: "/estadisticas", label: "Stats", icon: "📊" },
  { href: "/habitos", label: "Hábitos", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
      <div className="max-w-lg mx-auto flex">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs transition-colors ${
                active ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              <span className="text-xl leading-none">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
