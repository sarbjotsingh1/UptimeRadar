-- AlterTable
ALTER TABLE "public"."Endpoint" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "public"."EndpointCheck" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EndpointCheck_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."EndpointCheck" ADD CONSTRAINT "EndpointCheck_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "public"."Endpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
