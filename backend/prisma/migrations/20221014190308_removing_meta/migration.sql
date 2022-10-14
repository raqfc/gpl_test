/*
  Warnings:

  - You are about to drop the `Meta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_id_fkey";

-- DropTable
DROP TABLE "Meta";
