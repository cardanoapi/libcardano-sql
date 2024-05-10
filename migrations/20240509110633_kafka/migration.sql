-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KafkaData" (
    "headerHash" BLOB NOT NULL PRIMARY KEY,
    "blockNo" INTEGER NOT NULL,
    "slotNo" INTEGER NOT NULL
);
INSERT INTO "new_KafkaData" ("blockNo", "headerHash", "slotNo") SELECT "blockNo", "headerHash", "slotNo" FROM "KafkaData";
DROP TABLE "KafkaData";
ALTER TABLE "new_KafkaData" RENAME TO "KafkaData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
