export function formatAddresses(addresses) {
  if (!addresses?.length) {
    return '📡 *IPAM*\n\nTidak ditemukan IP address.';
  }

  const lines = ['IP Found!', ''];

  addresses.forEach((item) => {
    lines.push(`Hostname : ${item.hostname || '-'} (${item.ip || '-'})`);
    lines.push(`Desc : ${item.description || '-'}`);
    
    // Tampilkan informasi Subnet jika tersedia
    if (item.subnetInfo) {
      const sub = item.subnetInfo;
      const subnetCidr = `${sub.subnet}/${sub.mask}`;
      const subnetDesc = sub.description ? ` (${sub.description})` : '';
      lines.push(`Subnet : ${subnetCidr}${subnetDesc}`);
    } else {
      lines.push(`Subnet : -`);
    }

    lines.push(''); // Baris pemisah jika ada lebih dari 1 hasil
  });

  return lines.join('\n').trim();
}