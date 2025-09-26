-- AlterTable
ALTER TABLE "public"."Subscription" ADD COLUMN     "provider_plan_id" TEXT;

-- CreateTable
CREATE TABLE "public"."Provider_plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "features" TEXT[],
    "price_id" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "plan_duration" TEXT,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_plan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Provider_plan" ADD CONSTRAINT "Provider_plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_provider_plan_id_fkey" FOREIGN KEY ("provider_plan_id") REFERENCES "public"."Provider_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
