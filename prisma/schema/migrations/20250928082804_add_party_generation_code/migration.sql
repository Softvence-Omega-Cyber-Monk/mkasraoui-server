-- CreateTable
CREATE TABLE "public"."PartyPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Superhero Party',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledDate" TIMESTAMP(3) NOT NULL DEFAULT '2025-09-28 14:06:00 +00:00',

    CONSTRAINT "PartyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "partyPlanId" TEXT NOT NULL,

    CONSTRAINT "PlanSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlanItem" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "planSectionId" TEXT NOT NULL,

    CONSTRAINT "PlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PartyTimeline" (
    "id" TEXT NOT NULL,
    "partyPlanId" TEXT NOT NULL,

    CONSTRAINT "PartyTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TimelineEvent" (
    "id" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "partyTimelineId" TEXT NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SuggestedGiftId" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "partyPlanId" TEXT NOT NULL,

    CONSTRAINT "SuggestedGiftId_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanSection_partyPlanId_name_key" ON "public"."PlanSection"("partyPlanId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PartyTimeline_partyPlanId_key" ON "public"."PartyTimeline"("partyPlanId");

-- AddForeignKey
ALTER TABLE "public"."PlanSection" ADD CONSTRAINT "PlanSection_partyPlanId_fkey" FOREIGN KEY ("partyPlanId") REFERENCES "public"."PartyPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanItem" ADD CONSTRAINT "PlanItem_planSectionId_fkey" FOREIGN KEY ("planSectionId") REFERENCES "public"."PlanSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PartyTimeline" ADD CONSTRAINT "PartyTimeline_partyPlanId_fkey" FOREIGN KEY ("partyPlanId") REFERENCES "public"."PartyPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimelineEvent" ADD CONSTRAINT "TimelineEvent_partyTimelineId_fkey" FOREIGN KEY ("partyTimelineId") REFERENCES "public"."PartyTimeline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SuggestedGiftId" ADD CONSTRAINT "SuggestedGiftId_partyPlanId_fkey" FOREIGN KEY ("partyPlanId") REFERENCES "public"."PartyPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
