-- Add profile userId columns if they do not already exist.
ALTER TABLE "veterinarians"
ADD COLUMN IF NOT EXISTS "userId" TEXT;

ALTER TABLE "collection_centres"
ADD COLUMN IF NOT EXISTS "userId" TEXT;

ALTER TABLE "factories"
ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Make the profile relationships mandatory.
ALTER TABLE "veterinarians"
ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "collection_centres"
ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "factories"
ALTER COLUMN "userId" SET NOT NULL;

-- Ensure profile userId fields are unique.
CREATE UNIQUE INDEX IF NOT EXISTS "veterinarians_userId_key"
ON "veterinarians"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "collection_centres_userId_key"
ON "collection_centres"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "factories_userId_key"
ON "factories"("userId");

-- Align the farmer relationship with the Prisma schema.
ALTER TABLE "farmers"
DROP CONSTRAINT IF EXISTS "farmers_userId_fkey";

ALTER TABLE "farmers"
ADD CONSTRAINT "farmers_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Align other profile relationships with the Prisma schema.
ALTER TABLE "veterinarians"
DROP CONSTRAINT IF EXISTS "veterinarians_userId_fkey";

ALTER TABLE "veterinarians"
ADD CONSTRAINT "veterinarians_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "collection_centres"
DROP CONSTRAINT IF EXISTS "collection_centres_userId_fkey";

ALTER TABLE "collection_centres"
ADD CONSTRAINT "collection_centres_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "factories"
DROP CONSTRAINT IF EXISTS "factories_userId_fkey";

ALTER TABLE "factories"
ADD CONSTRAINT "factories_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Create the authority profile table if it is missing.
CREATE TABLE IF NOT EXISTS "authorities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "designation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "authorities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "authorities_userId_key"
ON "authorities"("userId");

ALTER TABLE "authorities"
DROP CONSTRAINT IF EXISTS "authorities_userId_fkey";

ALTER TABLE "authorities"
ADD CONSTRAINT "authorities_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;