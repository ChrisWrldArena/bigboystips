-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('vIP_GAME', 'BET_OF_THE_DAY', 'FREE_GAME', 'CORRECT_SCORE', 'DRAW_GAME');

-- AlterTable
ALTER TABLE "Prediction" ADD COLUMN     "gameType" "GameType" NOT NULL DEFAULT 'FREE_GAME';
