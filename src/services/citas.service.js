const prisma = require('../prisma')
const { createError } = require('../middlewares/error.middleware')
const availabilityEngine = require('../automation/availability/availability.engine')

const CITA_INCLUDE = {
  barbero: true,
  usuario: {
    select: {
      id: true,
      nombre: true,
      email: true,
      telefono: true,
    },
  },
  servicios: {
    include: {
      servicio: true,
    },
  },
}

/**
 * Obtiene los servicios activos junto con sus componentes.
 */
const obtenerServiciosConComponentes = async (servicioIds) => {
  return prisma.servicio.findMany({
    where: {
      id: {
        in: servicioIds,
      },
      activo: true,
    },
    include: {
      componentes: {
        include: {
          componente: true,
        },
      },
    },
  })
}

/**
 * Valida que no existan servicios repetidos.
 */
const validarServiciosRepetidos = (servicioIds) => {
  const idsUnicos = new Set(servicioIds)

  if (idsUnicos.size !== servicioIds.length) {
    throw createError(
      400,
      'No puedes seleccionar el mismo servicio más de una vez'
    )
  }
}

/**
 * Comprueba que todos los servicios solicitados
 * existan y estén activos.
 */
const validarServiciosExistentes = (servicioIds, servicios) => {
  const encontrados = new Set(
    servicios.map((servicio) => servicio.id)
  )

  const faltantes = servicioIds.filter(
    (id) => !encontrados.has(id)
  )

  if (faltantes.length > 0) {
    throw createError(
      400,
      `Los siguientes servicios no están disponibles: ${faltantes.join(', ')}`
    )
  }
}

/**
 * Obtiene todos los componentes involucrados
 * en los servicios seleccionados.
 */
const obtenerComponentes = (servicios) => {
  const componentesMap = new Map()

  for (const servicio of servicios) {
    for (const relacion of servicio.componentes) {
      const componente = relacion.componente

      if (!componente.activo) {
        continue
      }

      componentesMap.set(componente.id, componente)
    }
  }

  return [...componentesMap.values()]
}

/**
 * Busca reglas PROHIBIR entre componentes
 * pertenecientes a servicios diferentes.
 *
 * Importante:
 * Los componentes internos de un mismo servicio
 * no se consideran incompatibles entre sí.
 *
 * Ejemplo:
 *
 * Servicio "Corte + Barba"
 * ├── CORTE
 * └── BARBA
 *
 * Es válido porque CORTE + BARBA forma parte
 * explícitamente del mismo servicio.
 *
 * Pero:
 *
 * Servicio "Corte"
 * +
 * Servicio "Afeitado Real"
 *
 * sí debe bloquearse porque CORTE y BARBA
 * pertenecen a servicios diferentes.
 */
const buscarReglasProhibidas = async (servicios) => {
  const paresComponentes = []

  for (let i = 0; i < servicios.length; i++) {
    const servicioA = servicios[i]

    for (let j = i + 1; j < servicios.length; j++) {
      const servicioB = servicios[j]

      for (const relacionA of servicioA.componentes) {
        const componenteA = relacionA.componente

        if (!componenteA?.activo) {
          continue
        }

        for (const relacionB of servicioB.componentes) {
          const componenteB = relacionB.componente

          if (!componenteB?.activo) {
            continue
          }

          paresComponentes.push({
            componenteId: componenteA.id,
            relacionadoId: componenteB.id,
          })

          paresComponentes.push({
            componenteId: componenteB.id,
            relacionadoId: componenteA.id,
          })
        }
      }
    }
  }

  if (paresComponentes.length === 0) {
    return []
  }

  return prisma.reglaComponente.findMany({
    where: {
      activo: true,
      tipo: 'PROHIBIR',
      OR: paresComponentes,
    },
    include: {
      componente: true,
      relacionado: true,
    },
  })
}

/**
 * Busca reglas PROHIBIR entre dos grupos de componentes
 * pertenecientes a servicios diferentes.
 *
 * Esto evita bloquear un servicio compuesto válido.
 *
 * Ejemplo:
 *
 * Servicio A:
 *   CORTE + BARBA
 *
 * Servicio B:
 *   FACIAL
 *
 * No se evalúa CORTE + BARBA entre sí porque pertenecen
 * al mismo servicio.
 */
const buscarReglasProhibidasEntreServicios = async (
  componentesA,
  componentesB
) => {
  const componenteIdsA = componentesA.map(
    (componente) => componente.id
  )

  const componenteIdsB = componentesB.map(
    (componente) => componente.id
  )

  if (
    componenteIdsA.length === 0 ||
    componenteIdsB.length === 0
  ) {
    return []
  }

  return prisma.reglaComponente.findMany({
    where: {
      activo: true,
      tipo: 'PROHIBIR',

      OR: [
        {
          componenteId: {
            in: componenteIdsA,
          },
          relacionadoId: {
            in: componenteIdsB,
          },
        },
        {
          componenteId: {
            in: componenteIdsB,
          },
          relacionadoId: {
            in: componenteIdsA,
          },
        },
      ],
    },
    include: {
      componente: true,
      relacionado: true,
    },
  })
}

/**
 * Valida las reglas configuradas por el administrador.
 */
const validarCompatibilidad = async (servicios) => {
  const componentesPorServicio = servicios.map((servicio) => ({
    servicio,
    componentes: servicio.componentes
      .filter(({ componente }) => componente.activo)
      .map(({ componente }) => componente),
  }))

  /**
   * 1. Detectar componentes repetidos entre servicios diferentes.
   */
  for (let i = 0; i < componentesPorServicio.length; i++) {
    for (let j = i + 1; j < componentesPorServicio.length; j++) {
      const servicioA = componentesPorServicio[i]
      const servicioB = componentesPorServicio[j]

      for (const componenteA of servicioA.componentes) {
        const componenteRepetido = servicioB.componentes.find(
          (componenteB) => componenteB.id === componenteA.id
        )

        if (componenteRepetido) {
          throw createError(
            400,
            `El componente ${componenteA.nombre} ya está incluido en otro servicio seleccionado`
          )
        }
      }
    }
  }

  /**
   * 2. Detectar incompatibilidades entre servicios diferentes.
   */
  for (let i = 0; i < componentesPorServicio.length; i++) {
    for (let j = i + 1; j < componentesPorServicio.length; j++) {
      const servicioA = componentesPorServicio[i]
      const servicioB = componentesPorServicio[j]

      const reglasProhibidas =
        await buscarReglasProhibidasEntreServicios(
          servicioA.componentes,
          servicioB.componentes
        )

      if (reglasProhibidas.length === 0) {
        continue
      }

      const regla = reglasProhibidas[0]

      throw createError(
        400,
        `Los servicios seleccionados no son compatibles: ${regla.componente.nombre} no puede combinarse con ${regla.relacionado.nombre}`
      )
    }
  }
}

/**
 * Calcula la duración total de los servicios.
 */
const calcularDuracionTotal = (servicios) => {
  return servicios.reduce(
    (total, servicio) => total + servicio.duracion,
    0
  )
}

/**
 * Agenda una nueva cita.
 */
const agendar = async ({
  barberoId,
  fecha,
  hora,
  servicioIds,
  nota,
  usuarioId,
}) => {
  const barberoIdNumber = Number(barberoId)

  if (!Number.isInteger(barberoIdNumber)) {
    throw createError(
      400,
      'barberoId no es válido'
    )
  }

  if (!fecha || !hora) {
    throw createError(
      400,
      'fecha y hora son requeridos'
    )
  }

  if (!Array.isArray(servicioIds) || servicioIds.length === 0) {
    throw createError(
      400,
      'Debes seleccionar al menos un servicio'
    )
  }

  const servicioIdsNumber = servicioIds.map(Number)

  if (
    servicioIdsNumber.some(
      (id) => !Number.isInteger(id) || id <= 0
    )
  ) {
    throw createError(
      400,
      'Uno o más IDs de servicio no son válidos'
    )
  }

  validarServiciosRepetidos(servicioIdsNumber)

  /*
   * 1. Verificar barbero.
   */
  const barbero = await prisma.barbero.findUnique({
    where: {
      id: barberoIdNumber,
    },
  })

  if (!barbero) {
    throw createError(
      404,
      'Barbero no encontrado'
    )
  }

  if (!barbero.activo) {
    throw createError(
      400,
      'El barbero seleccionado no está disponible'
    )
  }

  /*
   * 2. Obtener servicios y componentes.
   */
  const servicios =
    await obtenerServiciosConComponentes(
      servicioIdsNumber
    )

  validarServiciosExistentes(
    servicioIdsNumber,
    servicios
  )

  /*
   * 3. Validar reglas configuradas por el administrador.
   */
  await validarCompatibilidad(servicios)

  /*
   * 4. Calcular duración total.
   *
   * Ejemplo:
   *
   * Corte Clásico      = 45 min
   * Limpieza Facial    = 60 min
   * ----------------------------
   * Total              = 105 min
   */
  const duracionTotal =
    calcularDuracionTotal(servicios)

  /*
   * 5. Consultar disponibilidad.
   */
  const slotsDisponibles =
    await availabilityEngine.getAvailableSlots(
      barberoIdNumber,
      fecha,
      duracionTotal
    )

  if (!slotsDisponibles.includes(hora)) {
    throw createError(
      400,
      `El horario ${hora} no está disponible para los servicios seleccionados`
    )
  }

  /*
   * 6. Crear la cita.
   */
  return prisma.cita.create({
    data: {
      usuarioId,
      barberoId: barberoIdNumber,
      fecha: new Date(fecha),
      hora,
      nota,

      servicios: {
        create: servicioIdsNumber.map(
          (servicioId) => ({
            servicio: {
              connect: {
                id: servicioId,
              },
            },
          })
        ),
      },
    },

    include: CITA_INCLUDE,
  })
}

const listar = () =>
  prisma.cita.findMany({
    include: CITA_INCLUDE,
    orderBy: {
      fecha: 'asc',
    },
  })

const listarPorUsuario = (usuarioId) =>
  prisma.cita.findMany({
    where: {
      usuarioId,
    },
    include: {
      barbero: true,
      servicios: {
        include: {
          servicio: true,
        },
      },
    },
    orderBy: {
      fecha: 'asc',
    },
  })

const obtener = async (id) => {
  const cita = await prisma.cita.findUnique({
    where: {
      id: Number(id),
    },
    include: CITA_INCLUDE,
  })

  if (!cita) {
    throw createError(
      404,
      'Cita no encontrada'
    )
  }

  return cita
}

const cambiarEstado = (id, estado) =>
  prisma.cita.update({
    where: {
      id: Number(id),
    },
    data: {
      estado,
    },
  })

const cancelar = async (id, usuarioId) => {
  const cita = await prisma.cita.findUnique({
    where: {
      id: Number(id),
    },
  })

  if (!cita) {
    throw createError(
      404,
      'Cita no encontrada'
    )
  }

  if (cita.usuarioId !== usuarioId) {
    throw createError(
      403,
      'No puedes cancelar una cita que no es tuya'
    )
  }

  return prisma.cita.update({
    where: {
      id: Number(id),
    },
    data: {
      estado: 'CANCELADA',
    },
  })
}

const horasOcupadas = async ({
  barberoId,
  fecha,
}) => {
  if (!barberoId || !fecha) {
    throw createError(
      400,
      'barberoId y fecha son requeridos'
    )
  }

  const citas = await prisma.cita.findMany({
    where: {
      barberoId: Number(barberoId),
      fecha: new Date(fecha),
      estado: {
        not: 'CANCELADA',
      },
    },
    select: {
      hora: true,
    },
  })

  return citas.map((cita) => cita.hora)
}

module.exports = {
  agendar,
  listar,
  listarPorUsuario,
  obtener,
  cambiarEstado,
  cancelar,
  horasOcupadas,
}