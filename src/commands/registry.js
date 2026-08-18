import { handleHelp } from './help.js';
import { handleWaid } from './waid.js';
import { handlePing } from './ping.js';
import { handleInfo } from './info.js';
import { handleZabbix } from './zabbix.js';
import { handleGlobalping } from './globalping.js';
import { handleIpam } from './ipam.js';

export const commands = {
  help: handleHelp,
  waid: handleWaid,
  ping: handlePing,
  info: handleInfo,
  zbx: handleZabbix,
  gp: handleGlobalping,
  ipam: handleIpam,
};

export function getCommands() {
  return Object.keys(commands);
}