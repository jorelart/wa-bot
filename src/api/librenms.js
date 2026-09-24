import { createHttpClient } from './http.js';
import { config } from '../config.js';

export const librenms = createHttpClient({
  baseURL: config.librenms.url,
  headers: {
    'X-Auth-Token': config.librenms.token,
  },
});
