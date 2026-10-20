CREATE TABLE "ConversacionWhatsapp" (
    "telefono" TEXT NOT NULL,
    "estado" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversacionWhatsapp_pkey" PRIMARY KEY ("telefono")
);

CREATE INDEX "ConversacionWhatsapp_expiresAt_idx" ON "ConversacionWhatsapp"("expiresAt");
