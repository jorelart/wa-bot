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

export async function createPing(
  target,
  location,
  probeCount = 3
) {
  const response = await globalping.post('/measurements', {
    target,
    type: 'ping',
    locations: [
      {
        magic: location,
        limit: probeCount,
      },
    ],
    measurementOptions: {
      packets: 4,
    },
  });

  return response.data;
}

export async function createTraceroute(
  target,
  location,
  probeCount = 3
) {
  const response = await globalping.post('/measurements', {
    target,
    type: 'traceroute',
    locations: [
      {
        magic: location,
        limit: probeCount,
      },
    ],
  });

  return response.data;
}

export async function createDns(
  target,
  location,
  probeCount = 3
) {
  const response = await globalping.post('/measurements', {
    target,
    type: 'dns',
    locations: [
      {
        magic: location,
        limit: probeCount,
      },
    ],
  });

  return response.data;
}

export async function getMeasurement(id) {
  const response = await globalping.get(
    `/measurements/${id}`
  );

  return response.data;
}