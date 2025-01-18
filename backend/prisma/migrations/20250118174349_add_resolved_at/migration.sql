-- DropIndex
DROP INDEX "Feedback_category_idx";

-- DropIndex
DROP INDEX "Feedback_status_idx";

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ALTER COLUMN "images" SET DEFAULT ARRAY[]::TEXT[];
