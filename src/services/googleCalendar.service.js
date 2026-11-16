const axios = require('axios')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const prisma = require('../prisma')
const { getGoogleCalendarCallbackUrl } = require('../config/publicUrls')

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email'
let warnedMissingMigration = false
const key = () => crypto.createHash('sha256').update(`${process.env.JWT_SECRET}:google-calendar`).digest()
const encrypt = (value) => {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return `${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${encrypted.toString('base64')}`
}
const decrypt = (value) => {
  const [iv, tag, data] = value.split('.').map((part) => Buffer.from(part, 'base64'))
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}
const todayStartUtc = () => {
  const bogota = new Date(Date.now() - 5 * 60 * 60 * 1000)
  return new Date(Date.UTC(bogota.getUTCFullYear(), bogota.getUTCMonth(), bogota.getUTCDate()))
}

const callbackUrl = getGoogleCalendarCallbackUrl
const getConnectUrl = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) throw new Error('Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET')
  const state = jwt.sign({ scope: 'calendar-connect' }, process.env.JWT_SECRET, { expiresIn: '10m' })
  const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: callbackUrl(), response_type: 'code', scope: CALENDAR_SCOPE, access_type: 'offline', prompt: 'consent', state })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

const connect = async (code, state) => {
  const stateData = jwt.verify(state, process.env.JWT_SECRET)
  if (stateData.scope !== 'calendar-connect') throw new Error('Estado de autorización inválido')
  const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: callbackUrl(), grant_type: 'authorization_code' }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  const tokens = tokenResponse.data
  const old = await prisma.googleCalendarIntegration.findUnique({ where: { id: 1 } })
  const refreshToken = tokens.refresh_token || (old ? decrypt(old.refreshTokenEncrypted) : null)
  if (!refreshToken) throw new Error('Google no entregó refresh token. Revoca el acceso anterior y vuelve a conectar el calendario.')
  const calendarResponse = old
    ? { data: { id: old.calendarId, summary: old.calendarName } }
    : await axios.post('https://www.googleapis.com/calendar/v3/calendars', { summary: 'La Fama Barber — Citas', timeZone: 'America/Bogota' }, { headers: { Authorization: `Bearer ${tokens.access_token}` } })
  const calendar = calendarResponse.data
  const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } }).catch(() => ({ data: {} }))
  await prisma.googleCalendarIntegration.upsert({
    where: { id: 1 },
    create: { id: 1, calendarId: calendar.id, calendarName: calendar.summary, accountEmail: userResponse.data.email || null, refreshTokenEncrypted: encrypt(refreshToken) },
    update: { calendarId: calendar.id, calendarName: calendar.summary, accountEmail: userResponse.data.email || null, refreshTokenEncrypted: encrypt(refreshToken) },
  })
  await prisma.cita.updateMany({
    where: { OR: [{ estado: { in: ['PENDIENTE', 'CONFIRMADA'] }, fecha: { gte: todayStartUtc() } }, { estado: 'CANCELADA', googleCalendarEventId: { not: null } }] },
    data: { calendarSyncStatus: 'PENDIENTE', calendarSyncIntentos: 0, calendarSyncError: null },
  })
}

const getAccess = async (integration) => {
  const response = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: decrypt(integration.refreshTokenEncrypted), grant_type: 'refresh_token' }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  return response.data.access_token
}

const status = async () => {
  const integration = await prisma.googleCalendarIntegration.findUnique({ where: { id: 1 } })
  return integration ? { connected: true, calendarName: integration.calendarName, accountEmail: integration.accountEmail } : { connected: false }
}

const syncPending = async () => {
  let integration
  try {
    integration = await prisma.googleCalendarIntegration.findUnique({ where: { id: 1 } })
  } catch (error) {
    if (['P1001', 'P1017', 'P2021', 'P2022'].includes(error.code)) {
      if (!warnedMissingMigration) {
        console.warn('Google Calendar está en espera: inicia PostgreSQL y aplica las migraciones con `npx prisma migrate deploy`.')
        warnedMissingMigration = true
      }
      return
    }
    throw error
  }
  if (!integration) return
  const citas = await prisma.cita.findMany({ where: { calendarSyncStatus: { in: ['PENDIENTE', 'ERROR'] }, calendarSyncIntentos: { lt: 8 }, OR: [{ estado: { in: ['PENDIENTE', 'CONFIRMADA'] }, fecha: { gte: todayStartUtc() } }, { estado: 'CANCELADA', googleCalendarEventId: { not: null } }] }, include: { usuario: true, barbero: true, servicios: { include: { servicio: true } } }, orderBy: { id: 'asc' }, take: 20 })
  if (!citas.length) return
  const accessToken = await getAccess(integration)
  const api = axios.create({ baseURL: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(integration.calendarId)}/events`, headers: { Authorization: `Bearer ${accessToken}` } })
  for (const cita of citas) {
    const eventId = `lafama${cita.id.toString(16)}`
    try {
      if (cita.estado === 'CANCELADA') {
        if (cita.googleCalendarEventId) await api.delete(`/${cita.googleCalendarEventId}`).catch((e) => { if (e.response?.status !== 404) throw e })
      } else {
        const [hour, minute] = cita.hora.split(':').map(Number)
        const duration = cita.servicios.reduce((sum, item) => sum + Number(item.servicio.duracion || 0), 0)
        const endTotal = hour * 60 + minute + duration
        const endHour = Math.floor(endTotal / 60) % 24
        const endMinute = endTotal % 60
        const local = `${cita.fecha.toISOString().slice(0, 10)}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
        const end = `${cita.fecha.toISOString().slice(0, 10)}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`
        const event = { id: eventId, summary: `Cita ${cita.usuario.nombre} — ${cita.servicios.map((item) => item.servicio.nombre).join(', ')}`, description: `Barbero: ${cita.barbero.nombre}\nCliente: ${cita.usuario.nombre}${cita.usuario.telefono ? `\nTeléfono: ${cita.usuario.telefono}` : ''}\nEstado: ${cita.estado}${cita.nota ? `\nNota: ${cita.nota}` : ''}`, start: { dateTime: local, timeZone: 'America/Bogota' }, end: { dateTime: end, timeZone: 'America/Bogota' } }
        const current = await api.get(`/${eventId}`).catch((e) => { if (e.response?.status === 404) return null; throw e })
        if (current) await api.put(`/${eventId}`, event)
        else await api.post('', event)
      }
      await prisma.cita.update({ where: { id: cita.id }, data: { googleCalendarEventId: cita.estado === 'CANCELADA' ? null : eventId, calendarSyncStatus: 'SINCRONIZADO', calendarSyncIntentos: { increment: 1 }, calendarSyncError: null } })
    } catch (error) {
      await prisma.cita.update({ where: { id: cita.id }, data: { calendarSyncStatus: 'ERROR', calendarSyncIntentos: { increment: 1 }, calendarSyncError: String(error.response?.data?.error?.message || error.message).slice(0, 500) } })
    }
  }
}

module.exports = { getConnectUrl, connect, status, syncPending }
