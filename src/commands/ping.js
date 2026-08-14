import { sendMessage } from '../api/evolution.js';

export async function handlePing({ chatId }) {
  await sendMessage(chatId, '🏓 *Pong!*');
}