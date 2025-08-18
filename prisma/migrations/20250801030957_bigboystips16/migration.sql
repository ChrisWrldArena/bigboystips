/*
  Warnings:

  - You are about to drop the `League` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Prediction" DROP CONSTRAINT "Prediction_league_fkey";

-- DropTable
DROP TABLE "League";
