import { prisma } from "./lib/prisma";

async function main() {
  const users = await prisma.user.findMany();

  console.log("PostgreSQL connection successful!");
  console.log("Users:", users);
}

main()
  .catch((error) => {
    console.error("Database connection failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });