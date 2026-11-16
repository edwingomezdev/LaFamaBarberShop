const prisma = require('../prisma')

// Fila única (id fijo 1). Si no existe todavía, se crea con los
// valores por defecto la primera vez que se pide.
const obtener = async () => {
  const existente = await prisma.configuracion.findUnique({ where: { id: 1 } })
  if (existente) return existente
  return prisma.configuracion.create({ data: { id: 1 } })
}

const actualizar = async (data) => {
  await obtener() // asegura que la fila exista antes de actualizarla
  return prisma.configuracion.update({
    where: { id: 1 },
    data: {
      mostrarProductos: data.mostrarProductos,
      mostrarMembresias: data.mostrarMembresias,
    },
  })
}

const obtenerHorarios = () => prisma.horarioAtencion.findMany({ orderBy: { diaSemana: 'asc' } })

const actualizarHorarios = async (horarios) => prisma.$transaction(
  horarios.map((horario) => prisma.horarioAtencion.upsert({
    where: { diaSemana: horario.diaSemana },
    create: horario,
    update: { abierto: horario.abierto, horaApertura: horario.horaApertura, horaCierre: horario.horaCierre },
  }))
)

module.exports = { obtener, actualizar, obtenerHorarios, actualizarHorarios }
