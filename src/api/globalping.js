import { createHttpClient } from './http.js';
import { config } from '../config.js';

const headers = {
  'Content-Type': 'application/json',
};

if (config.globalping.apiKey) {
  headers.Authorization = `Bearer ${config.globalping.apiKey}`;
}

const globalping = createHttpClient({
  baseURL: config.globalping.url,
  headers,
});

export async function createPing(target, location) {
  const response = await globalping.post('/measurements', {
    target,
    type: 'ping',
    locations: [
      {
        magic: location,
        limit: 1,
      },
    ],
    measurementOptions: {
      packets: 4,
    },
  });

  return response.data;
}

export async function getMeasurement(id) {
  const response = await globalping.get(`/measurements/${id}`);

  return response.data;
}