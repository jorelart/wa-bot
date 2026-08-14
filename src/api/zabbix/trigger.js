import { zabbixRequest } from '../zabbix.js';

export async function getTriggers(params = {}) {
  return zabbixRequest('trigger.get', {
    output: [
      'triggerid',
      'description',
      'priority',
      'status',
      'value',
    ],
    selectHosts: [
      'hostid',
      'host',
      'name',
    ],
    ...params,
  });
}