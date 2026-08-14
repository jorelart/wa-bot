import { sendReply } from '../api/evolution.js';

export async function handleWaid({ chatId, isGroup, payload }) {
  const type = isGroup ? 'Group' : 'Private';

  const message = [
    '📱 *WhatsApp Information*',
    '',
    `Type: ${type}`,
    '',
    '*JID:*',
    chatId,
  ].join('\n');

  await sendReply(chatId, message, payload?.data);
}
