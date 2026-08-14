import axios from 'axios';
import { config } from '../config.js';

const client = axios.create({
  baseURL: config.zabbix.url,
  headers: {
    'Content-Type': 'application/json-rpc',
  },
});

export async function zabbixRequest(method, params = {}, options = {}) {
  const request = {
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now(),
  };

  const headers = {};

  if (options.auth !== false && config.zabbix.token) {
    headers.Authorization = `Bearer ${config.zabbix.token}`;
  }

  try {
    const response = await client.post('', request, {
      headers,
    });

    if (response.data.error) {
      const error = response.data.error;

      throw new Error(
        `${error.message}: ${error.data || ''}`.trim()
      );
    }

    return response.data.result;
  } catch (error) {
    console.error(
      `Zabbix API [${method}]:`,
      error.response?.data || error.message
    );

    throw error;
  }
}