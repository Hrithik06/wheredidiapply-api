/*
  Warnings:

  - You are about to drop the column `appliedDate` on the `Job` table. All the data in the column will be lost.
  - Added the required column `appliedAt` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "appliedDate",
ADD COLUMN     "appliedAt" DATE NOT NULL,
ADD COLUMN     "receivedAt" TIMESTAMP(3);
