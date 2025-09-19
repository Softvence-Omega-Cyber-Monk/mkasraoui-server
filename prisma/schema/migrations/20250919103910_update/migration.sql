/*
  Warnings:

  - You are about to drop the column `productId` on the `ProviderReview` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ProviderReview" DROP CONSTRAINT "ProviderReview_productId_fkey";

-- AlterTable
ALTER TABLE "public"."ProviderReview" DROP COLUMN "productId";

-- AddForeignKey
ALTER TABLE "public"."ProviderReview" ADD CONSTRAINT "ProviderReview_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "public"."ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
