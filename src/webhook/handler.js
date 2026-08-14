import { handleCommand } from '../commands/index.js';
import { sendReply } from '../api/evolution.js';

function extractMessageText(data) {
  const message = data?.message;

  if (!message) {
    return null;
  }

  // Pesan teks biasa
  if (typeof message.conversation === 'string') {
    return message.conversation;
  }

  // Pesan teks dengan extended message
  if (typeof message.extendedTextMessage?.text === 'string') {
    return message.extendedTextMessage.text;
  }

  // Caption pada image/video/document
  if (typeof message.imageMessage?.caption === 'string') {
    return message.imageMessage.caption;
  }

  if (typeof message.videoMessage?.caption === 'string') {
    return message.videoMessage.caption;
  }

  if (typeof message.documentMessage?.caption === 'string') {
    return message.documentMessage.caption;
  }

  return null;
}

async function sendUnknownCommand(chatId, command, originalData = null) {
  const message = [
    '❌ *Unknown command*',
    '',
    `Command \`!${command}\` tidak ditemukan.`,
    '',
    'Ketik *!help* untuk melihat daftar command.',
  ].join('\n');

  await sendReply(chatId, message, originalData || null);
}

export async function handleWebhook(payload) {
  if (process.env.DEBUG_WEBHOOK === 'true') {
    try {
      console.log('DEBUG_WEBHOOK: Incoming webhook payload:', JSON.stringify(payload));
      console.log('DEBUG_WEBHOOK: Incoming data:', JSON.stringify(payload?.data));
    } catch (e) {
      console.log('DEBUG_WEBHOOK: Failed to stringify payload', e.message);
    }
  }
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

  const message = extractMessageText(data);

  if (!message) {
    return;
  }

  const chatId = key?.remoteJid;

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

  try {
    const handled = await handleCommand(command, context);

    if (!handled) {
      await sendUnknownCommand(chatId, command, data);
    }
  } catch (error) {
    console.error(`Command !${command} error:`, error);

    try {
      await sendReply(
        chatId,
        '❌ Terjadi kesalahan saat menjalankan command.',
        data
      );
    } catch (sendError) {
      console.error('Failed to send error message:', sendError);
    }
  }
}