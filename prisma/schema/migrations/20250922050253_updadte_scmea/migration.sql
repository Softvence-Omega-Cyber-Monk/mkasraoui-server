-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "confirm_inviation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "invitation_send" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parties_planed" DOUBLE PRECISION NOT NULL DEFAULT 0;
