-- AlterTable
ALTER TABLE "public"."PartyPlan" ADD COLUMN     "totalInvitation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalInvitationCancel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalInvitationConfirm" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalPendingInvitaion" INTEGER NOT NULL DEFAULT 0;
