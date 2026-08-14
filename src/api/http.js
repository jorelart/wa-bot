import axios from 'axios';

export function createHttpClient({
  baseURL,
  headers = {},
  timeout = 10000,
}) {
  return axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}