import { sendReply } from '../api/evolution.js';

export async function handleInfo({ reply }) {

  const message = [
    'ℹ️ *Chat Information*',
    '',
    `Type   : ${type}`,
    `Chat ID: ${chatId}`,
    `Sender : ${sender}`,
  ].join('\n');

  await reply(message);
}