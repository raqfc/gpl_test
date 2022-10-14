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
    "userId" TEXT,
    "appointmentId" TEXT,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("fkId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Meta_userId_key" ON "Meta"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Meta_appointmentId_key" ON "Meta"("appointmentId");

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
