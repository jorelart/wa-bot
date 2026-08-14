import { handleCommand } from '../commands/index.js';
import { sendMessage } from '../evolution/client.js';


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

    const handled = await handleCommand(command, context);

  if (!handled) {
    await sendUnknownCommand(chatId, command);
  }
}

async function sendUnknownCommand(chatId, command) {
  const message = [
    '❌ *Unknown command*',
    '',
    `Command \`!${command}\` tidak ditemukan.`,
    '',
    'Ketik *!help* untuk melihat daftar command.',
  ].join('\n');

  await sendMessage(chatId, message);
}
