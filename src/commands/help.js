import { sendReply } from '../api/evolution.js';
import { getCommands } from './registry.js';

export async function handleHelp({ chatId, payload }) {
  const commands = getCommands();

  const message = [
    '🤖 *WA NOC Bot*',
    '',
    '*Available commands:*',
    '',
    ...commands.map((command) => `📌 !${command}`),
  ].join('\n');

  await sendReply(chatId, message, payload?.data);
}