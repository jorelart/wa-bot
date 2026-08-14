import { handleCommand } from '../commands/index.js';

export async function handleWebhook(payload) {
  if (payload?.event !== 'messages.upsert') {
    return;
  }

  const data = payload.data;

  if (!data) {
    return;
  }

  const key = data.key;

  // Abaikan pesan yang dikirim oleh bot sendiri
  if (key?.fromMe) {
    return;
  }

  const message = data.message?.conversation;

  if (!message) {
    return;
  }

  const chatId = key.remoteJid;

  if (!chatId) {
    return;
  }

  const text = message.trim();

  if (!text.startsWith('!')) {
    return;
  }

  const parts = text.slice(1).trim().split(/\s+/);

  const command = parts.shift()?.toLowerCase();

  if (!command) {
    return;
  }

  const context = {
    chatId,
    sender: key.participantAlt || key.participant || key.remoteJid,
    isGroup: chatId.endsWith('@g.us'),
    command,
    args: parts,
    rawMessage: text,
    payload,
  };

  console.log(
    `Command: !${command} | Chat: ${chatId} | Sender: ${context.sender}`
  );

  await handleCommand(command, context);
}
