-- AlterTable
ALTER TABLE "Barbero" ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DiaDescanso" (
    "id" SERIAL NOT NULL,
    "barberoId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiaDescanso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "mostrarProductos" BOOLEAN NOT NULL DEFAULT true,
    "mostrarMembresias" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiaDescanso_barberoId_fecha_key" ON "DiaDescanso"("barberoId", "fecha");

-- AddForeignKey
ALTER TABLE "DiaDescanso" ADD CONSTRAINT "DiaDescanso_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "Barbero"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
