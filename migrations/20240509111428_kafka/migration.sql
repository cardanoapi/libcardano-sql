/*
  Warnings:

  - The primary key for the `KafkaData` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `blockNo` on the `KafkaData` table. All the data in the column will be lost.
  - You are about to drop the column `headerHash` on the `KafkaData` table. All the data in the column will be lost.
  - You are about to drop the column `slotNo` on the `KafkaData` table. All the data in the column will be lost.
  - Added the required column `kafkaBlockNo` to the `KafkaData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kafkaHeaderHash` to the `KafkaData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kafkaSlotNo` to the `KafkaData` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KafkaData" (
    "kafkaHeaderHash" BLOB NOT NULL PRIMARY KEY,
    "kafkaBlockNo" INTEGER NOT NULL,
    "kafkaSlotNo" INTEGER NOT NULL
);
DROP TABLE "KafkaData";
ALTER TABLE "new_KafkaData" RENAME TO "KafkaData";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
