import { config } from '../config.js';

// Buat URL dasar Web phpIPAM (mengubah URL API ke URL Web)
const BASE_WEB_URL = config.phpipam.url.split('/api')[0]; 

export function formatAddresses(addresses) {
  if (!addresses?.length) {
    return '📡 *IPAM*\n\nTidak ditemukan IP address.';
  }

  const lines = ['✅ *IP Found!*', ''];

  addresses.forEach((item) => {
    lines.push(`Hostname : ${item.hostname || '-'} (${item.ip || '-'})`);
    lines.push(`Desc : ${item.description || '-'}`);

    // Tampilkan Hierarki Subnet jika ada
    if (item.subnetsHierarchy && item.subnetsHierarchy.length > 0) {
      item.subnetsHierarchy.forEach((sub) => {
        // Cek jika subnet dan mask benar-benar ada
        if (sub.subnet && sub.mask) {
          const cidr = `${sub.subnet}/${sub.mask}`;
          const desc = sub.description ? ` (${sub.description})` : '';
          lines.push(`Subnet : ${cidr}${desc}`);
        }
      });

      // Ambil ID subnet terkecil (paling spesifik) untuk buat link langsung
      const lowestSubnet = item.subnetsHierarchy[item.subnetsHierarchy.length - 1];
      const directLink = `${BASE_WEB_URL}/index.php?page=subnets&section=${lowestSubnet.sectionId}&subnetId=${lowestSubnet.id}`;
      
      lines.push(''); // Jarak spasi sebelum link
      lines.push(`🔗 ${directLink}`);
    } else {
      lines.push(`Subnet : -`);
    }

    lines.push(''); // Spasi antar hasil
  });

  return lines.join('\n').trim();
}

export function formatSubnets(subnets) {
  if (!subnets?.length) {
    return '📡 *IPAM SUBNET*\n\nSubnet tidak ditemukan.';
  }

  const lines = ['📡 *IPAM SUBNET*', ''];

  subnets.slice(0, 10).forEach((subnet, index) => {
    const directLink = `${BASE_WEB_URL}/index.php?page=subnets&section=${subnet.sectionId}&subnetId=${subnet.id}`;
    
    lines.push(
      `Subnet: *${subnet.subnet}/${subnet.mask}*`,
      `ID: ${subnet.id}`,
      `Description: ${subnet.description || '-'}`,
      '', // Spasi sebelum link
      `🔗 ${directLink}`,
      ''
    );
  });

  return lines.join('\n').trim();
}

export function formatSubnetUsage(subnet, usage) {
  const total = Number(usage?.total || 0);
  const used = Number(usage?.used || 0);
  const free = Number(usage?.free || 0);

  const percentage =
    total > 0
      ? ((used / total) * 100).toFixed(1)
      : '0.0';

  const directLink = `${BASE_WEB_URL}/index.php?page=subnets&section=${subnet.sectionId}&subnetId=${subnet.id}`;

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
    '', // Jarak spasi sebelum link
    `🔗 ${directLink}`,
  ].join('\n');
}