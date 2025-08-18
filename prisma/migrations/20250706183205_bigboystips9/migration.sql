-- AlterTable
ALTER TABLE "Prediction" ADD COLUMN     "customRange" TEXT,
ADD COLUMN     "customTitle" TEXT DEFAULT '',
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false;
