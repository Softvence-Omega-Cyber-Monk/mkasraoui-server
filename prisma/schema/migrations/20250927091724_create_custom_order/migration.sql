-- CreateEnum
CREATE TYPE "public"."TShirtType" AS ENUM ('CHILD', 'ADULT');

-- CreateTable
CREATE TABLE "public"."CustomOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tShirtType" "public"."TShirtType" NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentIntentId" TEXT,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING',
    "shippingAddress" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."CustomOrder" ADD CONSTRAINT "CustomOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
