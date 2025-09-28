-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('PLANNING', 'FOOD', 'VENUE', 'INVITATIONS', 'DECORATIONS', 'ACTIVITIES', 'ENTERTAINMENT');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "category" "public"."Category" NOT NULL,
    "priority" "public"."Priority" NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "daysAhead" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
