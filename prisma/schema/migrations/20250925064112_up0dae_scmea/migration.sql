/*
  Warnings:

  - You are about to drop the column `plan_name` on the `Plan` table. All the data in the column will be lost.
  - Added the required column `name` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Plan" DROP COLUMN "plan_name",
ADD COLUMN     "name" TEXT NOT NULL;
