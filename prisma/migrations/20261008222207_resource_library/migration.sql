-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('video', 'playlist', 'website', 'channel', 'link');

-- CreateEnum
CREATE TYPE "ResourceLevel" AS ENUM ('Beginner', 'Intermediate', 'Advanced');

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "sourceIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "source" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "level" "ResourceLevel" NOT NULL,
    "durationMin" INTEGER,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resource_sourceIndex_key" ON "Resource"("sourceIndex");

-- CreateIndex
CREATE INDEX "Resource_workspaceId_group_idx" ON "Resource"("workspaceId", "group");

-- CreateIndex
CREATE INDEX "Resource_workspaceId_level_idx" ON "Resource"("workspaceId", "level");

-- CreateIndex
CREATE INDEX "Resource_workspaceId_type_idx" ON "Resource"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "Resource_workspaceId_favorite_idx" ON "Resource"("workspaceId", "favorite");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
