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
  try {
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

    console.log('Globalping create measurement:', {
      status: response.status,
      id: response.data?.id,
      target,
      location,
    });

    return response.data;
  } catch (error) {
    console.error(
      'Globalping create measurement error:',
      error.response?.status || error.message,
      error.response?.data || ''
    );

    throw error;
  }
}

export async function getMeasurement(id) {
  try {
    const response = await globalping.get(
      `/measurements/${id}`
    );

    console.log(
      `Globalping measurement ${id}:`,
      response.data?.status
    );

    if (response.data?.status !== 'in-progress') {
      console.log(
        'Globalping final result:',
        JSON.stringify(response.data, null, 2)
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      `Globalping get measurement error [${id}]:`,
      error.response?.status || error.message,
      error.response?.data || ''
    );

    throw error;
  }
}