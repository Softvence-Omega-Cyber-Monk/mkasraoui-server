/*
  Warnings:

  - The `product_type` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('GIFT', 'DIY_BOX');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "up_to_kids" INTEGER,
DROP COLUMN "product_type",
ADD COLUMN     "product_type" "public"."ProductType" NOT NULL DEFAULT 'GIFT';
