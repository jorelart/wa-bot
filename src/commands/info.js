import { sendReply } from '../api/evolution.js';

export async function handleInfo({ chatId, sender, isGroup, payload }) {
  const type = isGroup ? 'Group' : 'Private';

  const message = [
    'ℹ️ *Chat Information*',
    '',
    `Type   : ${type}`,
    `Chat ID: ${chatId}`,
    `Sender : ${sender}`,
  ].join('\n');

  await sendReply(chatId, message, payload?.data);
}