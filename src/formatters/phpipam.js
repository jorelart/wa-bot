function statusIcon(status) {
  switch (String(status)) {
    case '1':
      return '🔴 Used';

    case '2':
      return '🟢 Reserved';

    default:
      return '⚪ Unknown';
  }
}

export function formatAddresses(addresses) {
  if (!addresses?.length) {
    return '📡 *IPAM*\n\nTidak ditemukan IP address.';
  }

  const lines = [
    '📡 *IPAM SEARCH*',
    '',
  ];

  addresses.slice(0, 10).forEach((address, index) => {
    lines.push(
      `${index + 1}. *${address.ip || '-'}*`,
      `Status: ${statusIcon(address.state)}`,
      `Hostname: ${address.hostname || '-'}`,
      `Description: ${address.description || '-'}`,
      ''
    );
  });

  if (addresses.length > 10) {
    lines.push(
      `Menampilkan 10 dari ${addresses.length} hasil.`
    );
  }

  return lines.join('\n');
}

export function formatSubnets(subnets) {
  if (!subnets?.length) {
    return '📡 *IPAM SUBNET*\n\nSubnet tidak ditemukan.';
  }

  const lines = [
    '📡 *IPAM SUBNET*',
    '',
  ];

  subnets.slice(0, 10).forEach((subnet, index) => {
    lines.push(
      `${index + 1}. *${subnet.subnet}/${subnet.mask}*`,
      `ID: ${subnet.id}`,
      `Name: ${subnet.description || '-'}`,
      ''
    );
  });

  return lines.join('\n');
}

export function formatSubnetUsage(subnet, usage) {
  const total = Number(usage?.total || 0);
  const used = Number(usage?.used || 0);
  const free = Number(usage?.free || 0);

  const percentage =
    total > 0
      ? ((used / total) * 100).toFixed(1)
      : '0.0';

  return [
    '📡 *IPAM USAGE*',
    '',
    `Subnet: *${subnet.subnet}/${subnet.mask}*`,
    `Description: ${subnet.description || '-'}`,
    '',
    `Total: ${total}`,
    `Used: ${used}`,
    `Free: ${free}`,
    `Usage: *${percentage}%*`,
  ].join('\n');
}
