/*
  Warnings:

  - You are about to drop the column `shippingFee` on the `CustomOrder` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Gender" ADD VALUE 'BOY';
ALTER TYPE "public"."Gender" ADD VALUE 'GIRL';

-- AlterTable
ALTER TABLE "public"."CustomOrder" DROP COLUMN "shippingFee",
ADD COLUMN     "gelatoOrderId" TEXT,
ADD COLUMN     "gelatoStatus" TEXT;
