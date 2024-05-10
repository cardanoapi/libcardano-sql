-- CreateTable
CREATE TABLE "KafkaData" (
    "headerHash" BLOB NOT NULL PRIMARY KEY,
    "blockNo" INTEGER NOT NULL,
    "slotNo" INTEGER NOT NULL
);
