-- DropForeignKey
ALTER TABLE "public"."PartyTimeline" DROP CONSTRAINT "PartyTimeline_partyPlanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlanItem" DROP CONSTRAINT "PlanItem_planSectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlanSection" DROP CONSTRAINT "PlanSection_partyPlanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SuggestedGiftId" DROP CONSTRAINT "SuggestedGiftId_partyPlanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TimelineEvent" DROP CONSTRAINT "TimelineEvent_partyTimelineId_fkey";

-- AddForeignKey
ALTER TABLE "public"."PlanSection" ADD CONSTRAINT "PlanSection_partyPlanId_fkey" FOREIGN KEY ("partyPlanId") REFERENCES "public"."PartyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanItem" ADD CONSTRAINT "PlanItem_planSectionId_fkey" FOREIGN KEY ("planSectionId") REFERENCES "public"."PlanSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyTimeline" ADD CONSTRAINT "PartyTimeline_partyPlanId_fkey" FOREIGN KEY ("partyPlanId") REFERENCES "public"."PartyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimelineEvent" ADD CONSTRAINT "TimelineEvent_partyTimelineId_fkey" FOREIGN KEY ("partyTimelineId") REFERENCES "public"."PartyTimeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SuggestedGiftId" ADD CONSTRAINT "SuggestedGiftId_partyPlanId_fkey" FOREIGN KEY ("partyPlanId") REFERENCES "public"."PartyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
