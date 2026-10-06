import { prisma } from "./lib/prisma";

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Ramesh Patil",
      email: "ramesh@example.com",
      passwordHash: "demo-hash",
      role: "FARMER",
      organization: "ResiduGuard Demo Farm",
    },
  });

  const farmer = await prisma.farmer.create({
    data: {
      userId: user.id,
      village: "Pune",
      phone: "9876543210",
    },
  });

  const cattle = await prisma.cattle.create({
    data: {
      cattleId: "CATTLE-001",
      name: "Ganga",
      breed: "Gir",
      farmerId: farmer.id,
      sex: "FEMALE",
    },
  });

  console.log("Test data created successfully!");
  console.log({ user, farmer, cattle });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });