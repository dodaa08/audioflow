/*
  Warnings:

  - A unique constraint covering the columns `[inputUrl]` on the table `jobs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "jobs_inputUrl_key" ON "jobs"("inputUrl");
