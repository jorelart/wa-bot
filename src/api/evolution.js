import { createHttpClient } from './http.js';
import { config } from '../config.js';

const evolution = createHttpClient({
  baseURL: config.evolution.url,
  headers: {
    apikey: config.evolution.apiKey,
  },
});

export async function sendMessage(number, text) {
  try {
    const response = await evolution.post(
      `/message/sendText/${config.evolution.instance}`,
      {
        number,
        text,
      }
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

export async function sendReply(number, text, originalMessage) {
  const context = {
    key: originalMessage?.key || null,
    message: originalMessage?.message || originalMessage || null,
  };

  return sendMessage(number, text, {
    context,
  });
}