-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'INSTRUCTOR';

-- CreateTable
CREATE TABLE "exam_comments" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exam_comments" ADD CONSTRAINT "exam_comments_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_comments" ADD CONSTRAINT "exam_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
