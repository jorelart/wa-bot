import { handleHelp } from './help.js';
import { handleWaid } from './waid.js';

const commands = {
  help: handleHelp,
  waid: handleWaid,
};

export async function handleCommand(command, context) {
  const handler = commands[command];

  if (!handler) {
    return false;
  }

  await handler(context);

  return true;
}
