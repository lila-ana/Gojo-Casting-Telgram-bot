/*
  Warnings:

  - You are about to drop the column `nationalIdPath` on the `JobApplication` table. All the data in the column will be lost.
  - You are about to drop the column `photoPath` on the `JobApplication` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "nationalIdPath",
DROP COLUMN "photoPath",
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentProof" TEXT,
ADD COLUMN     "paymentStatus" TEXT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "nationalIdPath" TEXT,
ADD COLUMN     "photoPath" TEXT;
