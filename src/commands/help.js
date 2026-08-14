import { sendMessage } from '../api/evolution.js';
import { getCommands } from './registry.js';

export async function handleHelp({ chatId }) {
  const commands = getCommands();

  const message = [
    '🤖 *WA NOC Bot*',
    '',
    '*Available commands:*',
    '',
    ...commands.map((command) => `📌 !${command}`),
  ].join('\n');

  await sendMessage(chatId, message);
}