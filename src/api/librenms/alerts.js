import { librenms } from '../librenms.js';

export async function getActiveAlerts() {
  try {
    const response = await librenms.get('/alerts?state=1');
    
    // Some versions return { status: 'ok', alerts: [...] }
    return response.data.alerts || response.data || [];
  } catch (error) {
    console.error('Error fetching alerts from LibreNMS:', error.message);
    throw error;
  }
}
