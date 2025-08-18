-- CreateTable
CREATE TABLE "BettingCode" (
    "id" TEXT NOT NULL,
    "bettingPlatform" TEXT NOT NULL,
    "bettingCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BettingCode_pkey" PRIMARY KEY ("id")
);
