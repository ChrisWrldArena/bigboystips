/*
  Warnings:

  - You are about to drop the column `customRange` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `customTitle` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `isCustom` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `isFree` on the `Prediction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Prediction" DROP COLUMN "customRange",
DROP COLUMN "customTitle",
DROP COLUMN "isCustom",
DROP COLUMN "isFree";
