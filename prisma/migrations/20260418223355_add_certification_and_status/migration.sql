-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('PENDING', 'READY');

-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "certification" TEXT,
ADD COLUMN     "status" "ExamStatus" NOT NULL DEFAULT 'PENDING';
