-- CreateTable
CREATE TABLE "Meta" (
    "fkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updatedByName" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL,
    "deletedBy" TEXT NOT NULL,
    "deletedByName" TEXT NOT NULL,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("fkId")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Meta"("fkId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_id_fkey" FOREIGN KEY ("id") REFERENCES "Meta"("fkId") ON DELETE RESTRICT ON UPDATE CASCADE;
