-- CreateTable
CREATE TABLE "public"."AffiliatedProduct" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_review" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AffiliatedProduct_pkey" PRIMARY KEY ("id")
);
