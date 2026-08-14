import { sendMessage } from '../api/evolution.js';

export async function handleInfo({ chatId, sender, isGroup }) {
  const type = isGroup ? 'Group' : 'Private';

  const message = [
    'ℹ️ *Chat Information*',
    '',
    `Type   : ${type}`,
    `Chat ID: ${chatId}`,
    `Sender : ${sender}`,
  ].join('\n');

  await sendMessage(chatId, message);
}