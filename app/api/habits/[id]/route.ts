import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const habit = await prisma.habit.update({
    where: { id: Number(id) },
    data: {
      name: body.name,
      color: body.color,
      icon: body.icon,
    },
  });
  return NextResponse.json(habit);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.habit.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
