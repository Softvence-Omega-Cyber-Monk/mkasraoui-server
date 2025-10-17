-- AlterTable
ALTER TABLE "public"."DIY_activity" ADD COLUMN     "material" TEXT,
ADD COLUMN     "pdfFile" TEXT;

-- CreateTable
CREATE TABLE "public"."ActivityReview" (
    "id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityReview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ActivityReview" ADD CONSTRAINT "ActivityReview_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."DIY_activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityReview" ADD CONSTRAINT "ActivityReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
