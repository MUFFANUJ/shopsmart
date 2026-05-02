let PrismaClient;
try {
  ({ PrismaClient } = require("@prisma/client"));
} catch {
  ({ PrismaClient } = require("../server/node_modules/@prisma/client"));
}

const prisma = new PrismaClient();

async function main() {
  const seedTasks = [
    {
      title: "Review weekly budget",
      description: "Check spending categories and adjust limits.",
      completed: false
    },
    {
      title: "Create grocery list",
      description: "Add items for the upcoming week.",
      completed: false
    },
    {
      title: "Pay utility bills",
      description: "Complete electricity and internet payments.",
      completed: false
    }
  ];

  await prisma.task.deleteMany();
  await prisma.task.createMany({ data: seedTasks });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
