import { librenms } from '../librenms.js';

export async function searchBgpSessions(keyword) {
  try {
    // Note: LibreNMS /api/v0/bgp fetches ALL BGP sessions. 
    // We fetch them all and filter locally because the API lacks advanced search parameters for BGP.
    const [bgpResponse, devicesResponse] = await Promise.all([
      librenms.get('/bgp'),
      librenms.get('/devices')
    ]).catch(err => {
      console.error('Error fetching data for BGP:', err.message);
      throw err;
    });

    let sessions = bgpResponse.data.bgp || bgpResponse.data || [];
    if (!Array.isArray(sessions)) {
      sessions = Object.values(sessions).flat();
    }

    const devices = devicesResponse.data.devices || [];
    const deviceMap = {};
    devices.forEach(d => {
      deviceMap[d.device_id] = {
        hostname: d.hostname || d.sysName,
        ip: d.ip
      };
    });

    sessions = sessions.map(session => {
      const dev = deviceMap[session.device_id];
      if (dev) {
        session.device_hostname = dev.hostname;
        session.device_ip = dev.ip;
      }
      return session;
    });

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
        (session.device_hostname && session.device_hostname.toLowerCase().includes(lowerKeyword)) ||
        (session.astext && session.astext.toLowerCase().includes(lowerKeyword))
      );
    });
  } catch (error) {
    console.error('Error fetching BGP sessions from LibreNMS:', error.message);
    throw error;
  }
}
