const cancelarCitasPendientes = require('./cancelarCitas.job')

const iniciarJobs = () => {
  console.log('🧠 Iniciando jobs...')

  // Ejecutar al iniciar
  cancelarCitasPendientes()

  // Ejecutar cada 15 minutos
  setInterval(() => {
    cancelarCitasPendientes()
  }, 15 * 60 * 1000)
}

module.exports = iniciarJobs