CREATE TYPE "RespuestaAsistencia" AS ENUM ('SIN_RESPUESTA', 'ASISTIRE');
CREATE TYPE "EstadoSyncCalendario" AS ENUM ('PENDIENTE', 'SINCRONIZADO', 'ERROR');

ALTER TABLE "Usuario"
  ADD COLUMN "aceptaRecordatoriosWhatsapp" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Cita"
  ADD COLUMN "respuestaAsistencia" "RespuestaAsistencia" NOT NULL DEFAULT 'SIN_RESPUESTA',
  ADD COLUMN "recordatorioEnviadoAt" TIMESTAMP(3),
  ADD COLUMN "recordatorioIntentadoAt" TIMESTAMP(3),
  ADD COLUMN "recordatorioIntentos" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "ultimoErrorRecordatorio" TEXT,
  ADD COLUMN "googleCalendarEventId" TEXT,
  ADD COLUMN "calendarSyncStatus" "EstadoSyncCalendario" NOT NULL DEFAULT 'PENDIENTE',
  ADD COLUMN "calendarSyncIntentos" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "calendarSyncError" TEXT;

CREATE UNIQUE INDEX "Cita_googleCalendarEventId_key" ON "Cita"("googleCalendarEventId");
CREATE INDEX "Cita_fecha_hora_estado_idx" ON "Cita"("fecha", "hora", "estado");

CREATE TABLE "HorarioAtencion" (
  "id" SERIAL NOT NULL,
  "diaSemana" INTEGER NOT NULL,
  "abierto" BOOLEAN NOT NULL DEFAULT true,
  "horaApertura" TEXT NOT NULL DEFAULT '09:00',
  "horaCierre" TEXT NOT NULL DEFAULT '21:00',
  CONSTRAINT "HorarioAtencion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HorarioAtencion_diaSemana_key" ON "HorarioAtencion"("diaSemana");

INSERT INTO "HorarioAtencion" ("diaSemana", "abierto", "horaApertura", "horaCierre") VALUES
  (0, true,  '09:00', '16:00'),
  (1, true,  '09:00', '21:00'),
  (2, true,  '09:00', '21:00'),
  (3, true,  '09:00', '21:00'),
  (4, true,  '09:00', '21:00'),
  (5, true,  '09:00', '21:00'),
  (6, true,  '09:00', '21:00');

CREATE TABLE "GoogleCalendarIntegration" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "calendarId" TEXT NOT NULL,
  "calendarName" TEXT NOT NULL,
  "accountEmail" TEXT,
  "refreshTokenEncrypted" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GoogleCalendarIntegration_pkey" PRIMARY KEY ("id")
);
