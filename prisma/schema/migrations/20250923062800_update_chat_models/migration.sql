-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "fileUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
