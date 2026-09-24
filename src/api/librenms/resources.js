import { librenms } from '../librenms.js';

export async function searchMac(mac) {
  try {
    const response = await librenms.get(`/resources/fdb/search/${encodeURIComponent(mac)}`);
    
    // Usually response.data contains the fdb array
    let results = response.data.fdb || response.data || [];
    
    // Kadang response adalah object key value, jadi di flat
    if (!Array.isArray(results) && typeof results === 'object') {
        results = Object.values(results).flat();
    }
    return results;
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error('Error fetching MAC from LibreNMS:', error.message);
    throw error;
  }
}

export async function searchIp(ip) {
  try {
    const response = await librenms.get(`/resources/ip/search/${encodeURIComponent(ip)}`);
    
    let results = response.data.ip || response.data || [];
    
    if (!Array.isArray(results) && typeof results === 'object') {
        results = Object.values(results).flat();
    }
    return results;
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error('Error fetching IP from LibreNMS:', error.message);
    throw error;
  }
}
