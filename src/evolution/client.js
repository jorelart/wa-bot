import axios from 'axios';
import { config } from '../config.js';

const evolution = axios.create({
  baseURL: config.evolution.url,
  headers: {
    'Content-Type': 'application/json',
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
    const status = error.response?.status;
    const data = error.response?.data;

    console.error(
      'Evolution API error:',
      status || error.message,
      data || ''
    );

    throw error;
  }
}
