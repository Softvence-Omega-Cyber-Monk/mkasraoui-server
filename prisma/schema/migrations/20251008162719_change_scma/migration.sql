/*
  Warnings:

  - The values [GIFT] on the enum `ProductType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProductType_new" AS ENUM ('DIY_BOX');
ALTER TABLE "public"."Product" ALTER COLUMN "product_type" DROP DEFAULT;
ALTER TABLE "public"."Product" ALTER COLUMN "product_type" TYPE "public"."ProductType_new" USING ("product_type"::text::"public"."ProductType_new");
ALTER TYPE "public"."ProductType" RENAME TO "ProductType_old";
ALTER TYPE "public"."ProductType_new" RENAME TO "ProductType";
DROP TYPE "public"."ProductType_old";
ALTER TABLE "public"."Product" ALTER COLUMN "product_type" SET DEFAULT 'DIY_BOX';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "product_type" SET DEFAULT 'DIY_BOX';
