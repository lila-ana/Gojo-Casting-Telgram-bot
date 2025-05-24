-- AlterTable
ALTER TABLE "Training" ADD COLUMN     "course" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "level" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "paymentProof" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "startDate" TIMESTAMP(3);
