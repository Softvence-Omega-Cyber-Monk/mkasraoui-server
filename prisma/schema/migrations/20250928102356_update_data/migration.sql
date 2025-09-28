-- AlterTable
ALTER TABLE "public"."Invitation" ADD COLUMN     "guest_name" TEXT,
ADD COLUMN     "guest_phone" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "public"."PartyPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
