// One-time-safe bootstrap for the hosted Render database.
// The catalog entries are created only when missing. An admin is created only
// when both private BOOTSTRAP_ADMIN_* variables are provided by the operator.
const bcrypt = require('bcryptjs')
const prisma = require('../src/prisma')

async function main() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Render bootstrap omitido fuera de producción.')
    return
  }

  const service = await prisma.servicio.findFirst({ where: { nombre: 'Corte clásico' } })
  if (!service) {
    await prisma.servicio.create({
      data: { nombre: 'Corte clásico', precio: 20000, duracion: 30, orden: 0 },
    })
  }

  const barber = await prisma.barbero.findFirst({ where: { nombre: 'Daniel Gómez' } })
  if (!barber) {
    await prisma.barbero.create({
      data: { nombre: 'Daniel Gómez', especialidad: 'Cortes clásicos, fade y estilos', orden: 0 },
    })
  }

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD
  if (!email || !password) {
    console.log('Catálogo inicial listo. Se omitió crear administrador: faltan las variables BOOTSTRAP_ADMIN_EMAIL y BOOTSTRAP_ADMIN_PASSWORD.')
    return
  }
  if (password.length < 6) {
    console.warn('Se omitió crear administrador: BOOTSTRAP_ADMIN_PASSWORD debe tener al menos 6 caracteres.')
    return
  }

  const existing = await prisma.usuario.findUnique({ where: { email } })
  if (existing) {
    if (existing.rol !== 'ADMIN') {
      console.warn('La cuenta indicada ya existe en Render con un rol distinto de ADMIN; no se cambió su rol.')
    } else {
      console.log('La cuenta administradora indicada ya existe; no se modificó su contraseña.')
    }
    return
  }

  const anyAdmin = await prisma.usuario.findFirst({ where: { rol: 'ADMIN' } })
  if (anyAdmin) {
    console.warn('Render ya tiene una cuenta ADMIN con otro email; no se creó otra cuenta.')
    return
  }

  const nombre = process.env.BOOTSTRAP_ADMIN_NAME?.trim() || 'Administrador'
  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.usuario.create({ data: { nombre, email, password: hashedPassword, rol: 'ADMIN' } })
  console.log('Cuenta administradora inicial creada. Retira las variables BOOTSTRAP_ADMIN_* de Render después de confirmar el acceso.')
}

main()
  .catch((error) => {
    console.error('Falló el bootstrap inicial de Render:', error.message)
    process.exitCode = 1
  })
  .finally(async () => prisma.$disconnect())
