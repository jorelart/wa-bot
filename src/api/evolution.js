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

      // also include a small `context` object with only the text (conversation)
      // to increase chance provider renders it as a reply without sending
      // the full raw message which may be rejected.
      const origMessage = orig?.message || null;

      if (origMessage?.conversation) {
        body.context = {
          quotedMessage: {
            conversation: origMessage.conversation,
          },
          stanzaId: quotedId || null,
          participant: key?.participant || null,
        };
      }
      // Also include quotedMessage inside contextInfo (some providers expect this)
      body.contextInfo = {
        ...body.contextInfo,
        quotedMessage: origMessage?.conversation
          ? {
              conversation: origMessage.conversation,
              stanzaId: quotedId || null,
              key: {
                id: quotedId || null,
                remoteJid: number || null,
              },
            }
          : undefined,
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

    try {
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
      // If Evolution rejects with 400 Bad Request, retry once with rawContext
      const status = error.response?.status;

      if (status === 400 && !options.rawContext) {
        if (process.env.DEBUG_EVOLUTION === 'true') {
          console.log('DEBUG_EVOLUTION: Received 400, retrying with rawContext=true');
        }

        return sendMessage(number, text, { ...options, rawContext: true });
      }

      console.error(
        'Evolution API error:',
        error.response?.status || error.message,
        error.response?.data || ''
      );

      throw error;
    }
  } catch (error) {
    // network/other errors
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

  const asQuotedText = process.env.REPLY_AS_TEXT === 'true' || opts.asQuotedText === true;

  if (asQuotedText) {
    const origText = String(context.message?.conversation || '').replace(/\s+/g, ' ').trim();
    const preview = origText ? (origText.length > 120 ? origText.slice(0, 117) + '...' : origText) : null;

    const newText = preview
      ? `↪️ Replying to: "${preview}"\n\n${text}`
      : text;

    // send as plain message without context to ensure visible quoted text
    return sendMessage(number, newText);
  }

  return sendMessage(number, text, { context });
}