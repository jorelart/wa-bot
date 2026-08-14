import { zabbixRequest } from '../zabbix.js';

export async function getProblems(params = {}) {
  return zabbixRequest('problem.get', {
    output: 'extend',
    selectAcknowledges: 'extend',
    selectTags: 'extend',
    sortfield: 'eventid',
    sortorder: 'DESC',
    ...params,
  });
}