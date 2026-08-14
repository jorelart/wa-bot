import { handleHelp } from './help.js';
import { handleWaid } from './waid.js';
import { handlePing } from './ping.js';

export const commands = {
  help: handleHelp,
  waid: handleWaid,
  ping: handlePing,
};

export function getCommands() {
  return Object.keys(commands);
}