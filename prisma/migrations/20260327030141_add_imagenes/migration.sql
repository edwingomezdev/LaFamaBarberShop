-- AlterTable
ALTER TABLE "Servicio" ADD COLUMN     "imagen" TEXT;

-- CreateTable
CREATE TABLE "ImagenCarrusel" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImagenCarrusel_pkey" PRIMARY KEY ("id")
);
