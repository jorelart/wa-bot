import { handleCommand } from '../commands/index.js';
import { sendReply } from '../api/evolution.js';
import { config } from '../config.js';
import { isBotMessage } from '../utils/bot-messages.js';

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

function getMentionedJids(data) {
  return data?.contextInfo?.mentionedJid || [];
}

function isBotMentioned(data) {
  const mentionedJid = getMentionedJids(data);

  return (
    Array.isArray(mentionedJid) &&
    mentionedJid.includes(config.bot.lid)
  );
}

function isReplyToBot(data) {
  const contextInfo = data?.contextInfo;

  if (!contextInfo) {
    return false;
  }

  const quotedMessageId = contextInfo.stanzaId;

  if (!quotedMessageId) {
    return false;
  }

  return isBotMessage(quotedMessageId);
}

function removeBotMention(text, data) {
  if (!isBotMentioned(data)) {
    return text;
  }

  // WhatsApp mengirim mention sebagai @<LID>
  const botLid = config.bot.lid.split('@')[0];

  return text
    .replace(new RegExp(`@${botLid}\\s*`, 'i'), '')
    .trim();
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

  const isGroup = chatId.endsWith('@g.us');
  const mentioned = isBotMentioned(data);

  /*
   * GROUP:
   * Bot hanya merespons jika di-mention.
   *
   * PRIVATE:
   * Bot langsung merespons tanpa mention.
   */
  const repliedToBot = isReplyToBot(data);

  if (
    isGroup &&
    !mentioned &&
    !repliedToBot
  ) {
    return;
  }

  /*
   * Contoh:
   *
   * @87970057089061 !ping
   *
   * menjadi:
   *
   * !ping
   */
  const text = removeBotMention(message.trim(), data);

  if (!text.startsWith('!')) {
    return;
  }

  const parts = text.slice(1).trim().split(/\s+/);

  const command = parts.shift()?.toLowerCase();

  if (!command) {
    return;
  }

  const reply = async (replyText) => {
    return sendReply(chatId, replyText, data);
  };

  const context = {
    chatId,

    sender:
      key.participantAlt ||
      key.participant ||
      key.remoteJid,

    isGroup,

    command,
    args: parts,
    rawMessage: text,
    payload,

    reply,

    quoted: data,
  };

  console.log(
    `Command: !${command} | Chat: ${chatId} | Group: ${isGroup} | Mentioned: ${mentioned} | ReplyToBot: ${repliedToBot} | Sender: ${context.sender}`
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
