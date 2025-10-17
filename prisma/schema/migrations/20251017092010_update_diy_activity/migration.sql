-- AlterTable
ALTER TABLE "public"."DIY_activity" ADD COLUMN     "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total_review" INTEGER NOT NULL DEFAULT 0;
