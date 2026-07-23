import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/logs?date=YYYY-MM-DD  OR  ?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (date) {
    const logs = await prisma.habitLog.findMany({ where: { date } });
    return NextResponse.json(logs);
  }

  if (from && to) {
    const logs = await prisma.habitLog.findMany({
      where: { date: { gte: from, lte: to } },
      include: { habit: true },
    });
    return NextResponse.json(logs);
  }

  return NextResponse.json({ error: "Provide date or from/to params" }, { status: 400 });
}

// POST /api/logs  { habitId, date, completed }
export async function POST(req: Request) {
  const body = await req.json();
  const log = await prisma.habitLog.upsert({
    where: { habitId_date: { habitId: body.habitId, date: body.date } },
    update: { completed: body.completed },
    create: { habitId: body.habitId, date: body.date, completed: body.completed },
  });
  return NextResponse.json(log);
}
