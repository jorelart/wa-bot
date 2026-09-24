export function formatBgpSessions(sessions, keyword) {
  if (!sessions || sessions.length === 0) {
    return [
      '🔎 *LIBRENMS BGP SEARCH*',
      '',
      `Tidak ditemukan BGP session untuk keyword: *${keyword}*`,
    ].join('\n');
  }

  const lines = [
    '🔎 *LIBRENMS BGP SEARCH*',
    '',
    `Keyword: *${keyword}*`,
    `Ditemukan: *${sessions.length} sessions*`,
    '',
  ];

  sessions.forEach((session, index) => {
    // Determine state
    let stateIcon = '⚪'; // Default unknown
    let stateStr = session.bgpPeerState || 'Unknown';
    const adminStatus = session.bgpPeerAdminStatus;

    if (adminStatus === 'stop' || adminStatus === 'halted' || adminStatus === 2) {
      stateIcon = '🔴';
      stateStr = 'Admin Down';
    } else if (stateStr.toLowerCase() === 'established') {
      stateIcon = '🟢';
    } else if (stateStr.toLowerCase() === 'idle') {
      stateIcon = '🟡';
    } else if (stateStr.toLowerCase() === 'active') {
      stateIcon = '🟠'; // active in BGP means it's trying to connect, not established
    } else if (stateStr.toLowerCase() === 'connect') {
        stateIcon = '🔵';
    }

    const localAs = session.bgpLocalAs || '-';
    const remoteAs = session.bgpPeerRemoteAs || '-';
    const peerIp = session.bgpPeerIdentifier || '-';
    // try to get hostname if available or fallback to device id
    const deviceName = session.device_hostname || `Device ID: ${session.device_id || '-'}`;
    
    // Add extra details if available (like uptime/downtime)
    const uptimeStr = session.bgpPeerFsmEstablishedTime ? ` | Uptime: ${session.bgpPeerFsmEstablishedTime}s` : '';

    lines.push(
      `${index + 1}. ${stateIcon} *${peerIp}* (AS: ${remoteAs})`,
      `Device: ${deviceName}`,
      `Local AS: ${localAs}`,
      `State: ${stateStr}${uptimeStr}`,
      ''
    );
  });

  return lines.join('\n');
}

export function formatAlerts(alerts) {
  if (!alerts || alerts.length === 0) {
    return '✅ *LIBRENMS ALERTS*\n\nTidak ada alert aktif. Jaringan aman!';
  }

  const lines = [
    '🚨 *LIBRENMS ACTIVE ALERTS*',
    `Total: *${alerts.length}* alerts`,
    ''
  ];

  alerts.slice(0, 10).forEach((alert, i) => {
    const severity = alert.severity === 'critical' ? '🔴' : (alert.severity === 'warning' ? '🟡' : '🔵');
    const title = alert.rule || alert.title || 'Unknown Alert';
    const device = alert.hostname || alert.sysName || 'Unknown Device';
    const duration = alert.time_elapsed || '-';
    
    lines.push(`${i + 1}. ${severity} *${device}*`);
    lines.push(`   Rule: ${title}`);
    lines.push(`   Duration: ${duration}`);
    lines.push('');
  });

  if (alerts.length > 10) {
    lines.push(`_...dan ${alerts.length - 10} alert lainnya._`);
  }

  return lines.join('\n');
}

export function formatDevice(device, hostname) {
  if (!device) {
    return `❌ *LIBRENMS DEVICE*\n\nDevice dengan hostname *${hostname}* tidak ditemukan.`;
  }

  const statusIcon = device.status === 1 ? '🟢 UP' : '🔴 DOWN';
  const os = device.os || 'Unknown OS';
  const hardware = device.hardware || '-';
  const uptime = device.uptime || '-';

  return [
    '🖥️ *LIBRENMS DEVICE*',
    '',
    `Hostname: *${device.hostname}*`,
    `Status: ${statusIcon}`,
    `OS: ${os} ${device.version || ''}`,
    `Hardware: ${hardware}`,
    `Uptime: ${uptime}`,
    `IP: ${device.ip || '-'}`,
  ].join('\n');
}

export function formatPorts(ports, query) {
  if (!ports || ports.length === 0) {
    return `❌ *LIBRENMS PORT*\n\nPort dengan keyword *${query}* tidak ditemukan.`;
  }

  const lines = [
    '🔌 *LIBRENMS PORT SEARCH*',
    `Query: *${query}*`,
    `Ditemukan: *${ports.length} ports*`,
    ''
  ];

  ports.slice(0, 10).forEach((port, i) => {
    const adminStatus = port.ifAdminStatus === 'up' ? '🟢' : '🔴';
    const operStatus = port.ifOperStatus === 'up' ? '🟢' : '🔴';
    const device = port.hostname || `Device ID: ${port.device_id}`;
    
    lines.push(`${i + 1}. *${device}* - ${port.ifDescr || port.ifName || 'Unknown Port'}`);
    lines.push(`   Admin: ${adminStatus} | Oper: ${operStatus}`);
    if (port.ifAlias) {
      lines.push(`   Desc: ${port.ifAlias}`);
    }
    lines.push(`   Speed: ${port.ifSpeed ? (port.ifSpeed / 1000000) + ' Mbps' : '-'}`);
    lines.push('');
  });

  if (ports.length > 10) {
    lines.push(`_...dan ${ports.length - 10} port lainnya._`);
  }

  return lines.join('\n');
}

export function formatMacSearch(macs, macQuery) {
  if (!macs || macs.length === 0) {
    return `❌ *LIBRENMS MAC SEARCH*\n\nMAC Address *${macQuery}* tidak ditemukan.`;
  }

  const lines = [
    '🔍 *LIBRENMS MAC LOCATOR*',
    `MAC: *${macQuery}*`,
    ''
  ];

  macs.slice(0, 5).forEach((m, i) => {
    lines.push(`${i + 1}. *${m.hostname || m.device_id}*`);
    lines.push(`   Port: ${m.ifName || m.ifDescr || m.port_id}`);
    lines.push(`   VLAN: ${m.vlan || '-'}`);
    lines.push('');
  });

  return lines.join('\n');
}

export function formatIpSearch(ips, ipQuery) {
  if (!ips || ips.length === 0) {
    return `❌ *LIBRENMS IP SEARCH*\n\nIP Address *${ipQuery}* tidak ditemukan.`;
  }

  const lines = [
    '🔍 *LIBRENMS IP LOCATOR*',
    `IP: *${ipQuery}*`,
    ''
  ];

  ips.slice(0, 5).forEach((ip, i) => {
    lines.push(`${i + 1}. *${ip.hostname || ip.device_id}*`);
    lines.push(`   Port: ${ip.ifName || ip.ifDescr || ip.port_id}`);
    lines.push(`   MAC: ${ip.mac_address || '-'}`);
    lines.push('');
  });

  return lines.join('\n');
}
