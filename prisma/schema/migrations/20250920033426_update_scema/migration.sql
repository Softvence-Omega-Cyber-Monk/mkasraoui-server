-- AlterTable
ALTER TABLE "public"."Invitation" ALTER COLUMN "invitationToken" DROP NOT NULL,
ALTER COLUMN "invitationToken" DROP DEFAULT;
