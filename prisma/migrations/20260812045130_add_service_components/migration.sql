-- CreateTable
CREATE TABLE "ComponenteServicio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ComponenteServicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicioComponente" (
    "servicioId" INTEGER NOT NULL,
    "componenteId" INTEGER NOT NULL,

    CONSTRAINT "ServicioComponente_pkey" PRIMARY KEY ("servicioId","componenteId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ComponenteServicio_nombre_key" ON "ComponenteServicio"("nombre");

-- AddForeignKey
ALTER TABLE "ServicioComponente" ADD CONSTRAINT "ServicioComponente_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicioComponente" ADD CONSTRAINT "ServicioComponente_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "ComponenteServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
