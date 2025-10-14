-- CreateEnum
CREATE TYPE "public"."TShirtCategory" AS ENUM ('Premium_Kids_Crewneck_TShirt', 'Ultra_Cotton_Unisex_Crewneck_TShirt', 'Toddler_Cotton_Jersey_TShirt', 'Recycled_Blend_Kids_Sweatshirt');

-- AlterTable
ALTER TABLE "public"."CustomOrder" ADD COLUMN     "category" "public"."TShirtCategory";
