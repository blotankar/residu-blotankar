/*
  Warnings:

  - You are about to drop the `cattle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cattle" DROP CONSTRAINT "cattle_farmerId_fkey";

-- DropForeignKey
ALTER TABLE "milk_batch_animals" DROP CONSTRAINT "milk_batch_animals_cattleId_fkey";

-- DropForeignKey
ALTER TABLE "treatments" DROP CONSTRAINT "treatments_cattleId_fkey";

-- DropTable
DROP TABLE "cattle";

-- CreateTable
CREATE TABLE "Cattle" (
    "id" TEXT NOT NULL,
    "cattleId" TEXT NOT NULL,
    "name" TEXT,
    "breed" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "sex" TEXT,
    "farmerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cattle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cattle_farmerId_cattleId_key" ON "Cattle"("farmerId", "cattleId");

-- AddForeignKey
ALTER TABLE "Cattle" ADD CONSTRAINT "Cattle_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_cattleId_fkey" FOREIGN KEY ("cattleId") REFERENCES "Cattle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milk_batch_animals" ADD CONSTRAINT "milk_batch_animals_cattleId_fkey" FOREIGN KEY ("cattleId") REFERENCES "Cattle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
