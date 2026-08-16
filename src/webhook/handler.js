import { handleCommand } from '../commands/index.js';
import { sendReply } from '../api/evolution.js';

function extractMessageText(data) {
  const message = data?.message;

  if (!message) {
    return null;
  }

  if (typeof message.conversation === 'string') {
    return message.conversation;
  }

  if (typeof message.extendedTextMessage?.text === 'string') {
    return message.extendedTextMessage.text;
  }

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

async function sendUnknownCommand(reply, command) {
  const message = [
    '❌ *Unknown command*',
    '',
    `Command \`!${command}\` tidak ditemukan.`,
    '',
    'Ketik *!help* untuk melihat daftar command.',
  ].join('\n');

  await reply(message);
}

export async function handleWebhook(payload) {
  if (payload?.event !== 'messages.upsert') {
    return;
  }

  const data = payload.data;
  console.log(JSON.stringify(data, null, 2));

  if (!data) {
    return;
  }

  const key = data.key;

  // Jangan proses pesan dari bot sendiri
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

  /*
   * Semua command mendapatkan fungsi reply.
   *
   * Contoh:
   * await reply('Pong!');
   *
   * reply otomatis akan mencoba membalas
   * pesan WhatsApp yang menjadi trigger command.
   */
  const reply = async (replyText) => {
    return sendReply(chatId, replyText, data);
  };

  const context = {
    chatId,

    sender:
      key.participantAlt ||
      key.participant ||
      key.remoteJid,

    isGroup:
      typeof chatId === 'string' &&
      chatId.endsWith('@g.us'),

    command,
    args: parts,
    rawMessage: text,
    payload,

    // Fungsi reply terpusat
    reply,

    // Tetap tersedia jika suatu saat command
    // membutuhkan data webhook asli.
    quoted: data,
  };

  console.log(
    `Command: !${command} | Chat: ${chatId} | Sender: ${context.sender}`
  );

  try {
    const handled = await handleCommand(
      command,
      context
    );

    if (!handled) {
      await sendUnknownCommand(reply, command);
    }
  } catch (error) {
    console.error(
      `Command !${command} error:`,
      error
    );

    try {
      await reply(
        '❌ Terjadi kesalahan saat menjalankan command.'
      );
    } catch (sendError) {
      console.error(
        'Failed to send error message:',
        sendError
      );
    }
  }
}