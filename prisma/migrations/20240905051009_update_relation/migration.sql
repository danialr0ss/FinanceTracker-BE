/*
  Warnings:

  - A unique constraint covering the columns `[account_id]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Purchase_account_id_key` ON `Purchase`(`account_id`);
