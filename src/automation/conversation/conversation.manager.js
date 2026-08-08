const { createInitialState } = require("./conversationState");

class ConversationManager {

  constructor() {
    this.sessions = new Map();
  }

  get(phone) {

    if (!this.sessions.has(phone)) {

      const state = createInitialState();

      this.sessions.set(phone, state);

    }

    return this.sessions.get(phone);

  }

  set(phone, context) {
    this.sessions.set(phone, context);
  }


  update(phone, updates) {

    const current = this.get(phone);

    const next = {
      ...current,
      ...updates,
    };

    this.sessions.set(phone, next);

    return next;

  }
  clear(phone) {
    this.sessions.delete(phone);
  }
}

module.exports = new ConversationManager();