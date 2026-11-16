const prisma = require('../prisma')

const cancelarCitasPendientes = async () => {
  try {
    // Cancelar membresías vencidas por fecha
    const hoy = new Date()
    const membresiasVencidas = await prisma.usuarioMembresia.updateMany({
      where: {
        estado: 'ACTIVA',
        fechaFin: { lt: hoy }
      },
      data: { estado: 'VENCIDA' }
    })
    if (membresiasVencidas.count > 0) {
      console.log(`✅ ${membresiasVencidas.count} membresía(s) marcadas como VENCIDA por fecha`)
    }

    // Cancelar membresías agotadas por cortes
    const membresiasActivas = await prisma.usuarioMembresia.findMany({
      where: { estado: 'ACTIVA' },
      include: { membresia: true }
    })
    for (const m of membresiasActivas) {
      if (m.cortesUsados >= m.membresia.cortesIncluidos) {
        await prisma.usuarioMembresia.update({
          where: { id: m.id },
          data: { estado: 'AGOTADA' }
        })
        console.log(`✅ Membresía ${m.id} marcada como AGOTADA por cortes`)
      }
    }

  } catch (e) {
    console.error('Error en job de cancelación:', e)
  }
}

module.exports = cancelarCitasPendientes
