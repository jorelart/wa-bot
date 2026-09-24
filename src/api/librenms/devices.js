import { librenms } from '../librenms.js';

export async function searchDevice(hostname) {
  try {
    const response = await librenms.get(`/devices/${encodeURIComponent(hostname)}`);
    
    // Usually response.data.devices is an array
    const devices = response.data.devices || [];
    return devices.length > 0 ? devices[0] : null;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching device from LibreNMS:', error.message);
    throw error;
  }
}
