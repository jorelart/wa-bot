const botMessages = new Set();

const MAX_MESSAGES = 1000;

export function rememberBotMessage(messageId) {
  if (!messageId) {
    return;
  }

  botMessages.add(messageId);

  // Batasi memory
  if (botMessages.size > MAX_MESSAGES) {
    const first = botMessages.values().next().value;

    if (first) {
      botMessages.delete(first);
    }
  }
}

export function isBotMessage(messageId) {
  if (!messageId) {
    return false;
  }

  return botMessages.has(messageId);
}
