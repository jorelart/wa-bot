import { createHttpClient } from '../http.js';
import { config } from '../../config.js';

// Buat URL lengkap yang menggabungkan URL API dan App ID
const formattedBaseUrl = `${config.phpipam.url.replace(/\/$/, '')}/${config.phpipam.app}/`;

const phpipam = createHttpClient({
  baseURL: formattedBaseUrl, // Hasil akhir: https://monitor.jsn.net.id/phpipam/api/jorel-bot/
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
    // Tangkap status 404 dari phpIPAM (ketika IP/Subnet tidak ditemukan di DB phpIPAM)
    if (error.response?.status === 404 || error.response?.data?.code === 404) {
      return { success: true, data: [] };
    }

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