/*
  Warnings:

  - Added the required column `Age` to the `CustomOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `CustomOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `CustomOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `CustomOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CustomOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `CustomOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingFee` to the `CustomOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `CustomOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterEnum
ALTER TYPE "public"."Theme" ADD VALUE 'JUNGLE';

-- AlterTable
ALTER TABLE "public"."CustomOrder" ADD COLUMN     "Age" TEXT NOT NULL,
ADD COLUMN     "age" TEXT NOT NULL,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "gender" "public"."Gender" NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "optionalMessage" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "shippingFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL,
ADD COLUMN     "theme" "public"."Theme";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0;
