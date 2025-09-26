/*
  Warnings:

  - Changed the type of `plan_name` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."Plan_name" AS ENUM ('FREE', 'PREMIUM');

-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "plan_name",
ADD COLUMN     "plan_name" "public"."Plan_name" NOT NULL;
