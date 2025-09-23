/*
  Warnings:

  - You are about to drop the column `partyType` on the `Quote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Quote" DROP COLUMN "partyType";

-- DropEnum
DROP TYPE "public"."PartyType";
