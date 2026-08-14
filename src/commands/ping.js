import { sendMessage } from '../evolution/client.js';

export async function handlePing({ chatId }) {
  await sendMessage(chatId, '🏓 *Pong!*');
}