import { librenms } from '../librenms.js';

export async function searchBgpSessions(keyword) {
  try {
    // Note: LibreNMS /api/v0/bgp fetches ALL BGP sessions. 
    // We fetch them all and filter locally because the API lacks advanced search parameters for BGP.
    const response = await librenms.get('/bgp');
    
    // LibreNMS returns data usually inside `response.data.bgp` or similar structure depending on API version.
    // If it's an array directly in data or in an object, we need to handle it safely.
    let sessions = response.data.bgp || response.data || [];
    
    if (!Array.isArray(sessions)) {
      // Some versions return an object with device IP keys
      sessions = Object.values(sessions).flat();
    }

    if (!keyword) {
        return sessions;
    }

    const lowerKeyword = keyword.toLowerCase();

    return sessions.filter((session) => {
      return (
        session.bgpLocalAs?.toString() === lowerKeyword ||
        session.bgpPeerIdentifier?.toLowerCase().includes(lowerKeyword) ||
        session.bgpPeerRemoteAs?.toString() === lowerKeyword ||
        session.device_id?.toString() === lowerKeyword ||
        (session.device_hostname && session.device_hostname.toLowerCase().includes(lowerKeyword))
      );
    });
  } catch (error) {
    console.error('Error fetching BGP sessions from LibreNMS:', error.message);
    throw error;
  }
}
