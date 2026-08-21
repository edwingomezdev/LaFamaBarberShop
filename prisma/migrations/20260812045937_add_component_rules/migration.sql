-- CreateEnum
CREATE TYPE "TipoReglaComponente" AS ENUM ('PERMITIR', 'PROHIBIR');

-- CreateTable
CREATE TABLE "ReglaComponente" (
    "id" SERIAL NOT NULL,
    "componenteId" INTEGER NOT NULL,
    "relacionadoId" INTEGER NOT NULL,
    "tipo" "TipoReglaComponente" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReglaComponente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReglaComponente_componenteId_relacionadoId_key" ON "ReglaComponente"("componenteId", "relacionadoId");

-- AddForeignKey
ALTER TABLE "ReglaComponente" ADD CONSTRAINT "ReglaComponente_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "ComponenteServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReglaComponente" ADD CONSTRAINT "ReglaComponente_relacionadoId_fkey" FOREIGN KEY ("relacionadoId") REFERENCES "ComponenteServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
