-- AlterTable
ALTER TABLE "exam_comments" ADD COLUMN     "sessionId" TEXT;

-- AddForeignKey
ALTER TABLE "exam_comments" ADD CONSTRAINT "exam_comments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "exam_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
