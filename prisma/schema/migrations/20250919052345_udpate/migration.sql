/*
  Warnings:

  - Made the column `avg_rating` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "avg_rating" SET NOT NULL,
ALTER COLUMN "avg_rating" SET DEFAULT 0;
