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

export async function searchProblems(keyword) {
  if (!keyword) return [];

  return getProblems({
    search: { name: String(keyword) },
    limit: 50,
  });
}