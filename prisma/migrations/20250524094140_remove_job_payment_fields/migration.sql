/*
  Warnings:

  - You are about to drop the column `isPaid` on the `JobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `JobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `paymentProof` on the `JobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `JobApplication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "isPaid",
DROP COLUMN "paymentMethod",
DROP COLUMN "paymentProof",
DROP COLUMN "paymentStatus";
