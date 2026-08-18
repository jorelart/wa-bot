// Status Icon untuk IP
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

// 1. Formatter Hasil Pencarian IP
export function formatAddresses(addresses) {
  if (!addresses?.length) {
    return '📡 *IPAM*\n\nTidak ditemukan IP address.';
  }

  const lines = ['IP Found!', ''];

  addresses.forEach((item) => {
    lines.push(`Hostname : ${item.hostname || '-'} (${item.ip || '-'})`);
    lines.push(`Desc : ${item.description || '-'}`);
    
    // Tampilkan informasi Subnet jika tersedia dari addresses.js
    if (item.subnetInfo) {
      const sub = item.subnetInfo;
      const subnetCidr = `${sub.subnet}/${sub.mask}`;
      const subnetDesc = sub.description ? ` (${sub.description})` : '';
      lines.push(`Subnet : ${subnetCidr}${subnetDesc}`);
    } else {
      lines.push(`Subnet : -`);
    }

    lines.push(''); // Spasi antar hasil
  });

  return lines.join('\n').trim();
}

// 2. Formatter List Subnet (!ipam subnet <cidr>)
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

  return lines.join('\n').trim();
}

// 3. Formatter Penggunaan Subnet (!ipam usage <cidr>)
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