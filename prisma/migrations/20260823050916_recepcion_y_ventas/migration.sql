-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "citaId" INTEGER,
    "barberoId" INTEGER,
    "subtotalServicios" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotalExtras" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotalProductos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "metodoPago" "MetodoPago",
    "cobrado" BOOLEAN NOT NULL DEFAULT false,
    "cobradoPorId" INTEGER,
    "fechaCobro" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaExtra" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VentaExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaProducto" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnit" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VentaProducto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venta_citaId_key" ON "Venta"("citaId");

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_barberoId_fkey" FOREIGN KEY ("barberoId") REFERENCES "Barbero"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_cobradoPorId_fkey" FOREIGN KEY ("cobradoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaExtra" ADD CONSTRAINT "VentaExtra_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaProducto" ADD CONSTRAINT "VentaProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
