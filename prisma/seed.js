const { PrismaClient } = require('../server/node_modules/@prisma/client');

const prisma = new PrismaClient();

const seed = async () => {
  await prisma.task.deleteMany();

  await prisma.task.createMany({
    data: [
      {
        title: 'Plan weekly grocery list',
        description: 'Capture everything needed for this week.',
      },
      {
        title: 'Compare laptop prices',
        description: 'Track deals from shortlisted vendors.',
        completed: true,
      },
      {
        title: 'Review utility bills',
        description: 'Validate due dates and payment status.',
      },
    ],
  });
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
