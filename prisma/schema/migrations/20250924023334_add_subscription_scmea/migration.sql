-- CreateEnum
CREATE TYPE "public"."Subscription_status" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "status" "public"."Subscription_status" NOT NULL,
    "start_data" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "stripe_subscription_id" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
