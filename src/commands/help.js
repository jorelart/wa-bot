import { sendMessage } from '../evolution/client.js';

export async function handleHelp({ chatId }) {
  const message = [
    '🤖 *WA NOC Bot*',
    '',
    '*Available commands:*',
    '',
    '📱 !waid',
    '❓ !help',
  ].join('\n');

  await sendMessage(chatId, message);
}
