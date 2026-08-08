const CONVERSATION_STEPS = require("./conversationSteps");

const createInitialState = () => ({
  step: CONVERSATION_STEPS.START,
  service: null,
  barber: null,
  date: null,
  time: null,
  customerName: null,
});

module.exports = {
  createInitialState,
};