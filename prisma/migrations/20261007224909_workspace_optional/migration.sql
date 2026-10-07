-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_workspaceId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "workspaceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
