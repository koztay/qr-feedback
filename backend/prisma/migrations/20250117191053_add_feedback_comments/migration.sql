-- CreateTable
CREATE TABLE "FeedbackComment" (
    "id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackComment_feedbackId_idx" ON "FeedbackComment"("feedbackId");

-- CreateIndex
CREATE INDEX "FeedbackComment_userId_idx" ON "FeedbackComment"("userId");

-- AddForeignKey
ALTER TABLE "FeedbackComment" ADD CONSTRAINT "FeedbackComment_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackComment" ADD CONSTRAINT "FeedbackComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
