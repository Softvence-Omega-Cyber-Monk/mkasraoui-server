/*
  Warnings:

  - The `plan_name` column on the `Subscription` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "plan_name",
ADD COLUMN     "plan_name" TEXT NOT NULL DEFAULT 'FREE';

-- DropEnum
DROP TYPE "public"."Plan_name";
