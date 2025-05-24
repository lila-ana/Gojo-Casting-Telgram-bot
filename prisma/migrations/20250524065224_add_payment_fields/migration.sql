-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentProof" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending';
