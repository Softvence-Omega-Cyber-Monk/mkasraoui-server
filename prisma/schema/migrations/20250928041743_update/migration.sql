/*
  Warnings:

  - You are about to drop the column `shippingAddress` on the `CustomOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."CustomOrder" DROP COLUMN "shippingAddress",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;
