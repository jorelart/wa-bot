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
      // add common alternative field names used by different providers
      if (quotedId) {
        body.stanzaId = quotedId;
        body.quoted_msg_id = quotedId;
        body.quotedMessageID = quotedId;
        body.quotedMsgId = quotedId;
      }

      if (origMessage) {
        body.quoted_message = origMessage;
        body.quoted_message_obj = origMessage;
        body.quoted = origMessage;
      }
    }

    if (process.env.DEBUG_EVOLUTION === 'true') {
      try {
        console.log('DEBUG_EVOLUTION: REQUEST body=', JSON.stringify(body));
      } catch (e) {
        console.log('DEBUG_EVOLUTION: Failed to stringify request body');
      }
    }

    const response = await evolution.post(
      `/message/sendText/${config.evolution.instance}`,
      body
    );

    if (process.env.DEBUG_EVOLUTION === 'true') {
      console.log('DEBUG_EVOLUTION: RESPONSE status=', response.status);
      console.log('DEBUG_EVOLUTION: RESPONSE data=', response.data);
    }

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