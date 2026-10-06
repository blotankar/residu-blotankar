-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FARMER', 'VETERINARIAN', 'COLLECTION_CENTRE', 'FACTORY', 'AUTHORITY', 'CONSUMER');

-- CreateEnum
CREATE TYPE "MilkBatchStatus" AS ENUM ('SAFE', 'HOLD', 'PROCESSING', 'DISPATCHED');

-- CreateEnum
CREATE TYPE "ProcessingBatchStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'DISPATCHED', 'HOLD');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "organization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veterinarians" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veterinarians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_centres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "village" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_centres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cattle" (
    "id" TEXT NOT NULL,
    "cattleId" TEXT NOT NULL,
    "name" TEXT,
    "breed" TEXT,
    "farmerId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "sex" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cattle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" TEXT NOT NULL,
    "cattleId" TEXT NOT NULL,
    "veterinarianId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT,
    "administeredAt" TIMESTAMP(3) NOT NULL,
    "withdrawalEnds" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milk_batches" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "collectionCentreId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "volumeL" DOUBLE PRECISION NOT NULL,
    "status" "MilkBatchStatus" NOT NULL DEFAULT 'SAFE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milk_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milk_batch_animals" (
    "id" TEXT NOT NULL,
    "milkBatchId" TEXT NOT NULL,
    "cattleId" TEXT NOT NULL,

    CONSTRAINT "milk_batch_animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processing_batches" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "volumeL" DOUBLE PRECISION NOT NULL,
    "product" TEXT NOT NULL,
    "packs" INTEGER NOT NULL,
    "status" "ProcessingBatchStatus" NOT NULL DEFAULT 'PROCESSING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processing_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processing_milk_batches" (
    "id" TEXT NOT NULL,
    "processingBatchId" TEXT NOT NULL,
    "milkBatchId" TEXT NOT NULL,

    CONSTRAINT "processing_milk_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "processingBatchId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "volumeMl" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traceability_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "blockchainTxId" TEXT,
    "blockNumber" TEXT,
    "blockchainStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traceability_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "farmers_userId_key" ON "farmers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "veterinarians_licenseNo_key" ON "veterinarians"("licenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "collection_centres_code_key" ON "collection_centres"("code");

-- CreateIndex
CREATE UNIQUE INDEX "factories_code_key" ON "factories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cattle_cattleId_key" ON "cattle"("cattleId");

-- CreateIndex
CREATE UNIQUE INDEX "milk_batches_batchId_key" ON "milk_batches"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "milk_batch_animals_milkBatchId_cattleId_key" ON "milk_batch_animals"("milkBatchId", "cattleId");

-- CreateIndex
CREATE UNIQUE INDEX "processing_batches_batchId_key" ON "processing_batches"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "processing_milk_batches_processingBatchId_milkBatchId_key" ON "processing_milk_batches"("processingBatchId", "milkBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "packages_packageId_key" ON "packages"("packageId");

-- CreateIndex
CREATE INDEX "traceability_events_entityType_entityId_idx" ON "traceability_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "traceability_events_eventType_idx" ON "traceability_events"("eventType");

-- AddForeignKey
ALTER TABLE "farmers" ADD CONSTRAINT "farmers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cattle" ADD CONSTRAINT "cattle_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_cattleId_fkey" FOREIGN KEY ("cattleId") REFERENCES "cattle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "veterinarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milk_batches" ADD CONSTRAINT "milk_batches_collectionCentreId_fkey" FOREIGN KEY ("collectionCentreId") REFERENCES "collection_centres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milk_batch_animals" ADD CONSTRAINT "milk_batch_animals_milkBatchId_fkey" FOREIGN KEY ("milkBatchId") REFERENCES "milk_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milk_batch_animals" ADD CONSTRAINT "milk_batch_animals_cattleId_fkey" FOREIGN KEY ("cattleId") REFERENCES "cattle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_batches" ADD CONSTRAINT "processing_batches_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "factories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_milk_batches" ADD CONSTRAINT "processing_milk_batches_processingBatchId_fkey" FOREIGN KEY ("processingBatchId") REFERENCES "processing_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processing_milk_batches" ADD CONSTRAINT "processing_milk_batches_milkBatchId_fkey" FOREIGN KEY ("milkBatchId") REFERENCES "milk_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages" ADD CONSTRAINT "packages_processingBatchId_fkey" FOREIGN KEY ("processingBatchId") REFERENCES "processing_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
