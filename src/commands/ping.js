import { sendReply } from '../api/evolution.js';

export async function handlePing({ chatId, payload }) {
  await sendReply(chatId, '🏓 *Pong!*', payload?.data);
}