import { handleHelp } from './help.js';
import { handleWaid } from './waid.js';
import { handlePing } from './ping.js';
import { handleInfo } from './info.js';
import { handleZabbix } from './zabbix.js';
import { handleGlobalping } from './globalping.js';

export const commands = {
  help: handleHelp,
  waid: handleWaid,
  ping: handlePing,
  info: handleInfo,
  zabbix: handleZabbix,
  gp: handleGlobalping,
};

export function getCommands() {
  return Object.keys(commands);
}