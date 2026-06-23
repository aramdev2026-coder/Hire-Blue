/*
  Warnings:

  - The `location` column on the `JobRequirement` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `expRequired` column on the `JobRequirement` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "shortlistedCompany" TEXT;

-- AlterTable
ALTER TABLE "JobRequirement" DROP COLUMN "location",
ADD COLUMN     "location" TEXT[],
DROP COLUMN "expRequired",
ADD COLUMN     "expRequired" INTEGER NOT NULL DEFAULT 0;
