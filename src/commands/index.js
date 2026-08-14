import { commands } from './registry.js';

export async function handleCommand(command, context) {
  const handler = commands[command];

  if (!handler) {
    return false;
  }

  await handler(context);

  return true;
}