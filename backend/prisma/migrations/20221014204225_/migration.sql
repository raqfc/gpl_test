/*
  Warnings:

  - You are about to drop the `Meta` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdAt` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByName` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletedAt` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletedBy` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletedByName` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByName` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletedBy` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletedByName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_id_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "createdByName" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deletedBy" TEXT NOT NULL,
ADD COLUMN     "deletedByName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" TEXT NOT NULL,
ADD COLUMN     "updatedByName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "createdByName" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "deletedBy" TEXT NOT NULL,
ADD COLUMN     "deletedByName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" TEXT NOT NULL,
ADD COLUMN     "updatedByName" TEXT NOT NULL;

-- DropTable
DROP TABLE "Meta";
