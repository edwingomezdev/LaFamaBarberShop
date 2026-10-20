# Despliegue de La Fama Barber

La aplicación sirve el frontend y la API desde el mismo servicio. El frontend usa `/api` en producción, así que no requiere una URL de API aparte si ambos quedan bajo el mismo dominio.

## Configuración del servicio

- Usa Node.js 20 o superior.
- Comando de compilación: `npm run build`.
- Comando de inicio: `npm start` (aplica las migraciones pendientes y luego inicia la API).
- Comprueba el servicio en `/health`.
- Conecta una base de datos PostgreSQL y configura `DATABASE_URL`.

## Variables necesarias

- `DATABASE_URL`: conexión PostgreSQL de producción.
- `JWT_SECRET` y `SESSION_SECRET`: valores aleatorios distintos, de al menos 16 caracteres.
- `NODE_ENV=production`.
- `CORS_ORIGIN`: dominio del sitio, por ejemplo `https://barberia.example`.
- `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` y `META_APP_SECRET`: credenciales de Meta. No publiques estos valores en el repositorio.
- `UPLOADS_DIR`: ruta dentro de un volumen persistente montado por el proveedor, por ejemplo `/data/uploads`. Sin volumen, las imágenes subidas pueden perderse cuando se reemplace la instancia.

`PORT` lo debe asignar el proveedor. `GRAPH_API_VERSION` puede conservar `v23.0`. Google OAuth es opcional; si se habilita, configura también `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` (dominio público + `/api/auth/google/callback`) y `FRONTEND_URL` (dominio público del sitio).

## Webhook de WhatsApp

En la configuración de Meta, registra `https://<dominio>/api/whatsapp/webhook` para las suscripciones `messages`. Usa el mismo `WHATSAPP_VERIFY_TOKEN` configurado en el servicio y suscribe la app al número de WhatsApp. Meta requiere que el dominio público tenga HTTPS.

## Antes del primer despliegue

1. Configura las variables y la base de datos.
2. Monta el volumen persistente y establece `UPLOADS_DIR`.
3. Despliega y confirma que `/health` responda con `status: ok`.
4. Registra el webhook de Meta y realiza una reserva de prueba de principio a fin.

Las migraciones se ejecutan al iniciar el servicio. No ejecutes este proyecto contra la base de producción hasta revisar que `DATABASE_URL` apunta a la base correcta.
