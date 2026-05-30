DO $$
BEGIN
  CREATE TYPE "EstadoMembresia" AS ENUM ('ACTIVA', 'CANCELADA', 'VENCIDA', 'AGOTADA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE "EstadoMembresia" ADD VALUE IF NOT EXISTS 'AGOTADA';
END $$;

ALTER TABLE "UsuarioMembresia" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "UsuarioMembresia"
  ALTER COLUMN "estado" TYPE "EstadoMembresia"
  USING "estado"::"EstadoMembresia";
ALTER TABLE "UsuarioMembresia" ALTER COLUMN "estado" SET DEFAULT 'ACTIVA';
