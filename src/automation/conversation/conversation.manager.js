const prisma = require('../../prisma')
const { createInitialState } = require('./conversationState')

class ConversationManager {
  constructor() {
    this.sessionTtlMs = 2 * 60 * 60 * 1000
  }

  async get(phone) {
    const now = new Date()
    const saved = await prisma.conversacionWhatsapp.findUnique({ where: { telefono: phone } })

    if (!saved || saved.expiresAt <= now) {
      if (saved) await this.clear(phone)
      return createInitialState()
    }

    await prisma.conversacionWhatsapp.update({
      where: { telefono: phone },
      data: { expiresAt: new Date(Date.now() + this.sessionTtlMs) },
    })
    return saved.estado
  }

  async update(phone, updates) {
    const current = await this.get(phone)
    const next = { ...current, ...updates }
    await prisma.conversacionWhatsapp.upsert({
      where: { telefono: phone },
      create: {
        telefono: phone,
        estado: next,
        expiresAt: new Date(Date.now() + this.sessionTtlMs),
      },
      update: {
        estado: next,
        expiresAt: new Date(Date.now() + this.sessionTtlMs),
      },
    })
    return next
  }

  async clear(phone) {
    await prisma.conversacionWhatsapp.deleteMany({ where: { telefono: phone } })
  }
}

module.exports = new ConversationManager()
