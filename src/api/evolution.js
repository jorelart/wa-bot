import { createHttpClient } from './http.js';
import { config } from '../config.js';

const evolution = createHttpClient({
  baseURL: config.evolution.url,
  headers: {
    apikey: config.evolution.apiKey,
  },
});

export async function sendMessage(number, text, options = {}) {
  try {
    const body = {
      number,
      text,
    };

    if (options.context) {
      // include raw context (some Evolution instances accept this)
      body.context = options.context;

      // try to extract common identifiers to support different reply implementations
      const orig = options.context;
      const key = orig?.key || orig;
      const origMessage = orig?.message || orig?.message || null;

      const quotedId = key?.id || key?.stanzaId || key?.messageId || key?.remoteJid || null;

      if (quotedId) {
        body.quotedMessageId = quotedId;
      }

      if (origMessage) {
        body.quotedMessage = origMessage;
        body.contextInfo = {
          quotedMessage: origMessage,
          participant: key?.participant || null,
          stanzaId: quotedId || null,
        };
      }
    }

    const response = await evolution.post(
      `/message/sendText/${config.evolution.instance}`,
      body
    );

    return response.data;
  } catch (error) {
    console.error(
      'Evolution API error:',
      error.response?.status || error.message,
      error.response?.data || ''
    );

    throw error;
  }
}

export async function sendReply(number, text, originalMessage, opts = {}) {
  const context = {
    key: originalMessage?.key || null,
    message: originalMessage?.message || originalMessage || null,
    ...opts,
  };

  return sendMessage(number, text, { context });
}