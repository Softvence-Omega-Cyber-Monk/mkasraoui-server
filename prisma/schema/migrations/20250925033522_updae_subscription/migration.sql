-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "plan_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
