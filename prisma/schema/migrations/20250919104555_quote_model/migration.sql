-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'CANCELLED', 'BOOKED');

-- CreateEnum
CREATE TYPE "PartyType" AS ENUM ('BIRTHDAY', 'WEDDING', 'ENGAGEMENT', 'ANNIVERSARY', 'BABY_SHOWER', 'GRADUATION', 'HOLIDAY', 'HOUSE_PARTY', 'POOL_PARTY', 'FESTIVAL', 'CORPORATE_EVENT', 'FAREWELL');

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "numberOfGuest" INTEGER NOT NULL,
    "partyTheme" TEXT,
    "partyType" "PartyType" NOT NULL,
    "partyLocation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budgetRange" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_email_key" ON "Quote"("email");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
