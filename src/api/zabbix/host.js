import { zabbixRequest } from '../zabbix.js';

export async function getHosts(params = {}) {
  return zabbixRequest('host.get', {
    output: [
      'hostid',
      'host',
      'name',
      'status',
    ],
    ...params,
  });
}