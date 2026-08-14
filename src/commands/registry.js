import { handleHelp } from './help.js';
import { handleWaid } from './waid.js';

export const commands = {
  help: handleHelp,
  waid: handleWaid,
};

export function getCommands() {
  return Object.keys(commands);
}