-- CreateTable
CREATE TABLE "public"."Plan" (
    "id" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "features" TEXT[],
    "price_id" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);
