/*
  Warnings:

  - You are about to drop the column `stripe_account_id` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ProviderProfile" ADD COLUMN     "stripe_account_id" TEXT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "stripe_account_id";
