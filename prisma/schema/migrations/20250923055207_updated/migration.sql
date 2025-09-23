-- CreateTable
CREATE TABLE "public"."NewsLetter" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsLetter_pkey" PRIMARY KEY ("id")
);
