import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const habits = await prisma.habit.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(habits);
}

export async function POST(req: Request) {
  const body = await req.json();
  const maxOrder = await prisma.habit.aggregate({ _max: { order: true } });
  const habit = await prisma.habit.create({
    data: {
      name: body.name,
      color: body.color ?? "#6366f1",
      icon: body.icon ?? "⭐",
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
  return NextResponse.json(habit, { status: 201 });
}
