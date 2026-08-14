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
      // By default send a minimal reply payload to avoid large/raw binary data
      // that some Evolution instances reject. To send the full original context
      // set `options.rawContext = true`.
      const orig = options.context;
      const key = orig?.key || orig;

      const quotedId = key?.id || key?.stanzaId || key?.messageId || key?.remoteJid || null;

      if (quotedId) {
        body.quotedMessageId = quotedId;
      }

      body.contextInfo = {
        stanzaId: quotedId || null,
        participant: key?.participant || null,
      };

      if (options.rawContext) {
        // include raw context and expanded aliases only when explicitly requested
        body.context = orig;

        const origMessage = orig?.message || null;

        if (quotedId) {
          body.stanzaId = quotedId;
          body.quoted_msg_id = quotedId;
          body.quotedMessageID = quotedId;
          body.quotedMsgId = quotedId;
        }

        if (origMessage) {
          body.quotedMessage = origMessage;
          body.quoted_message = origMessage;
          body.quoted_message_obj = origMessage;
          body.quoted = origMessage;
          body.quoted_message_obj = origMessage;
        }
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