import { prisma } from "../lib/prisma";

export async function getCattle() {
  return await prisma.cattle.findMany({
    include: {
      farmer: {
        include: {
          user: true,
        },
      },
      treatments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}