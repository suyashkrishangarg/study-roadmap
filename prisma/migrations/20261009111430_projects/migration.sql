-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "stageRef" TEXT,
    "weekWhen" TEXT,
    "priority" TEXT,
    "difficulty" TEXT,
    "estHours" TEXT,
    "dependency" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_sourceKey_key" ON "Project"("sourceKey");

-- CreateIndex
CREATE INDEX "Project_workspaceId_category_idx" ON "Project"("workspaceId", "category");

-- CreateIndex
CREATE INDEX "Project_workspaceId_favorite_idx" ON "Project"("workspaceId", "favorite");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
