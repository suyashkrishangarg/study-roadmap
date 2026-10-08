-- CreateIndex
CREATE INDEX "Marathon_workspaceId_startsAt_idx" ON "Marathon"("workspaceId", "startsAt");

-- CreateIndex
CREATE INDEX "PracticeQuestion_workspaceId_createdAt_idx" ON "PracticeQuestion"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_completedAt_idx" ON "QuizAttempt"("userId", "completedAt");
