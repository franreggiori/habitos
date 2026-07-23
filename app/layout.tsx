import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hábitos",
  description: "Tracker de hábitos personal",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${geist.className} h-full bg-slate-50 text-slate-800`}>
        <main className="max-w-lg mx-auto px-4 pt-6 pb-24 min-h-full">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
