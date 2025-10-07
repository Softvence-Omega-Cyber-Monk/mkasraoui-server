/*
  Warnings:

  - You are about to drop the column `priceRange` on the `ProviderProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ProviderProfile" DROP COLUMN "priceRange",
ADD COLUMN     "price" DOUBLE PRECISION DEFAULT 0;
