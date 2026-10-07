/*
  Warnings:

  - Added the required column `authorId` to the `Roadmap` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `RoadmapItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "authorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RoadmapItem" ADD COLUMN     "authorId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Roadmap_authorId_idx" ON "Roadmap"("authorId");

-- CreateIndex
CREATE INDEX "RoadmapItem_authorId_idx" ON "RoadmapItem"("authorId");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
