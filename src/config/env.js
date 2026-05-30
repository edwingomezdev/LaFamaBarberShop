require('dotenv/config')
const { z } = require('zod')

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL es requerida' }).min(1),
  JWT_SECRET: z.string({ required_error: 'JWT_SECRET es requerida' }).min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  SESSION_SECRET: z.string({ required_error: 'SESSION_SECRET es requerida' }).min(16, 'SESSION_SECRET debe tener al menos 16 caracteres'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

const _parsed = envSchema.safeParse(process.env)

if (!_parsed.success) {
  const errors = (_parsed.error.issues || [])
    .map(e => `  - ${e.path.join('.')}: ${e.message}`)
    .join('\n')
  console.error(`\n❌ Variables de entorno inválidas:\n${errors}\n`)
  process.exit(1)
}

module.exports = _parsed.data
