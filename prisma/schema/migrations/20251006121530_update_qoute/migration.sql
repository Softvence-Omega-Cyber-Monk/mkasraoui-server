/*
  Warnings:

  - You are about to drop the column `budgetRange` on the `Quote` table. All the data in the column will be lost.
  - Added the required column `price` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."QuoteStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "public"."Quote" DROP COLUMN "budgetRange",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
