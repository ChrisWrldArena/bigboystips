/*
  Warnings:

  - The values [vIP_GAME] on the enum `GameType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameType_new" AS ENUM ('VIP_GAME', 'BET_OF_THE_DAY', 'FREE_GAME', 'CORRECT_SCORE', 'DRAW_GAME');
ALTER TABLE "Prediction" ALTER COLUMN "gameType" DROP DEFAULT;
ALTER TABLE "Prediction" ALTER COLUMN "gameType" TYPE "GameType_new" USING ("gameType"::text::"GameType_new");
ALTER TYPE "GameType" RENAME TO "GameType_old";
ALTER TYPE "GameType_new" RENAME TO "GameType";
DROP TYPE "GameType_old";
ALTER TABLE "Prediction" ALTER COLUMN "gameType" SET DEFAULT 'FREE_GAME';
COMMIT;
