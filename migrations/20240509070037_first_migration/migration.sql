-- CreateTable
CREATE TABLE "Blockchain" (
    "slotNo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "blockNo" INTEGER NOT NULL,
    "headerHash" BLOB NOT NULL,
    CONSTRAINT "Blockchain_headerHash_fkey" FOREIGN KEY ("headerHash") REFERENCES "Blocks" ("headerHash") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Blocks" (
    "headerHash" BLOB NOT NULL PRIMARY KEY,
    "header" BLOB NOT NULL,
    "body" BLOB
);

-- CreateTable
CREATE TABLE "Transactions" (
    "hash" BLOB NOT NULL PRIMARY KEY,
    "content" BLOB,
    "firstSeen" DATETIME NOT NULL
);
