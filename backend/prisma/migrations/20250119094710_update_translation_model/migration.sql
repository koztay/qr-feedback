/*
  Warnings:

  - You are about to drop the column `en` on the `Translation` table. All the data in the column will be lost.
  - You are about to drop the column `tr` on the `Translation` table. All the data in the column will be lost.
  - Added the required column `translations` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the translations column allowing NULL values
ALTER TABLE "Translation" ADD COLUMN "translations" JSONB;

-- Update existing rows to convert tr and en columns to translations JSON
UPDATE "Translation"
SET "translations" = jsonb_build_object(
  'TR', "tr",
  'EN', "en"
);

-- Now make translations column NOT NULL since all rows have been updated
ALTER TABLE "Translation" ALTER COLUMN "translations" SET NOT NULL;

-- Finally, drop the old columns
ALTER TABLE "Translation" DROP COLUMN "tr";
ALTER TABLE "Translation" DROP COLUMN "en";

-- Drop the indexes that are no longer needed
DROP INDEX IF EXISTS "Translation_key_idx";
DROP INDEX IF EXISTS "Translation_category_idx";
