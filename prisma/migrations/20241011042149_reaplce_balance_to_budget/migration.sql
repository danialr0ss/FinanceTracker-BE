/*
  Warnings:

  - You are about to drop the column `balance` on the `account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `account` DROP COLUMN `balance`,
    ADD COLUMN `budget` DECIMAL(10, 2) NOT NULL DEFAULT 1000;
