/*
  Warnings:

  - The primary key for the `KafkaData` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KafkaData" (
    "headerHash" BLOB NOT NULL,
    "blockNo" INTEGER NOT NULL,
    "slotNo" INTEGER NOT NULL
);
INSERT INTO "new_KafkaData" ("blockNo", "headerHash", "slotNo") SELECT "blockNo", "headerHash", "slotNo" FROM "KafkaData";
DROP TABLE "KafkaData";
ALTER TABLE "new_KafkaData" RENAME TO "KafkaData";
CREATE UNIQUE INDEX "KafkaData_headerHash_key" ON "KafkaData"("headerHash");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
