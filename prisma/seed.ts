import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const habits = [
    { name: "Yoga", color: "#8b5cf6", icon: "🧘", order: 0 },
    { name: "Deportes", color: "#10b981", icon: "🏃", order: 1 },
    { name: "Alimentación", color: "#f59e0b", icon: "🥗", order: 2 },
    { name: "Alcohol", color: "#ef4444", icon: "🚫", order: 3 },
  ];

  for (const habit of habits) {
    await prisma.habit.upsert({
      where: { id: habits.indexOf(habit) + 1 },
      update: {},
      create: habit,
    });
  }

  console.log("Hábitos iniciales creados.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
