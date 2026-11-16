const isLoopbackUrl = (value) => {
  try {
    const hostname = new URL(value).hostname.toLowerCase()
    return hostname === 'localhost' || hostname === '::1' || /^127(?:\.\d{1,3}){3}$/.test(hostname)
  } catch {
    return false
  }
}

const getAppBaseUrl = () => {
  const configured = process.env.FRONTEND_URL?.trim().replace(/\/+$/, '')
  if (configured && !(process.env.NODE_ENV === 'production' && isLoopbackUrl(configured))) return configured
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim()
  if (railwayDomain) return `https://${railwayDomain.replace(/^https?:\/\//i, '').replace(/\/+$/, '')}`
  return process.env.NODE_ENV === 'production' ? null : 'http://localhost:5173'
}

const getApiBaseUrl = () => process.env.NODE_ENV === 'production'
  ? getAppBaseUrl()
  : `http://localhost:${process.env.PORT || 3000}`

const getGoogleLoginCallbackUrl = () => {
  const configured = process.env.GOOGLE_CALLBACK_URL?.trim()
  if (configured && !(process.env.NODE_ENV === 'production' && isLoopbackUrl(configured))) return configured
  const base = getApiBaseUrl()
  return base ? `${base}/api/auth/google/callback` : 'http://localhost:3000/api/auth/google/callback'
}

const getGoogleCalendarCallbackUrl = () => {
  const configured = process.env.GOOGLE_CALENDAR_CALLBACK_URL?.trim()
  if (configured && !(process.env.NODE_ENV === 'production' && isLoopbackUrl(configured))) return configured
  const loginCallback = process.env.GOOGLE_CALLBACK_URL?.trim()
  if (loginCallback && !(process.env.NODE_ENV === 'production' && isLoopbackUrl(loginCallback))) {
    return loginCallback.replace(/\/api\/auth\/google\/callback\/?$/, '/api/calendar/callback')
  }
  const base = getApiBaseUrl()
  return base ? `${base}/api/calendar/callback` : 'http://localhost:3000/api/calendar/callback'
}

module.exports = { getAppBaseUrl, getApiBaseUrl, getGoogleLoginCallbackUrl, getGoogleCalendarCallbackUrl }
