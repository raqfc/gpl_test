/*
  Warnings:

  - You are about to drop the column `appointmentId` on the `Meta` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Meta` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Meta" DROP CONSTRAINT "Meta_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "Meta" DROP CONSTRAINT "Meta_userId_fkey";

-- DropIndex
DROP INDEX "Meta_appointmentId_key";

-- DropIndex
DROP INDEX "Meta_userId_key";

-- AlterTable
ALTER TABLE "Meta" DROP COLUMN "appointmentId",
DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Meta"("fkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_id_fkey" FOREIGN KEY ("id") REFERENCES "Meta"("fkId") ON DELETE RESTRICT ON UPDATE CASCADE;
