import { librenms } from '../librenms.js';

export async function searchPort(query) {
  try {
    const response = await librenms.get(`/ports/search/${encodeURIComponent(query)}`);
    
    return response.data.ports || response.data || [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error('Error fetching ports from LibreNMS:', error.message);
    throw error;
  }
}
