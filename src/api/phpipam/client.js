import { createHttpClient } from '../http.js';
import { config } from '../../config.js';

const phpipam = createHttpClient({
  baseURL: config.phpipam.url,
  headers: {
    token: config.phpipam.token,
  },
});

async function request(method, url, options = {}) {
  try {
    const response = await phpipam.request({
      method,
      url,
      ...options,
    });

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || 'phpIPAM API request failed'
      );
    }

    return response.data;
  } catch (error) {
    console.error(
      'phpIPAM API error:',
      error.response?.status || error.message,
      error.response?.data || ''
    );

    throw error;
  }
}

export async function get(url, params = {}) {
  return request('GET', url, {
    params,
  });
}
