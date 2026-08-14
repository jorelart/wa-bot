import { sendMessage } from '../evolution/client.js';

export async function handleWaid({ chatId, isGroup }) {
  const type = isGroup ? 'Group' : 'Private';

  const message = [
    '📱 *WhatsApp Information*',
    '',
    `Type: ${type}`,
    '',
    '*JID:*',
    chatId,
  ].join('\n');

  await sendMessage(chatId, message);
}
