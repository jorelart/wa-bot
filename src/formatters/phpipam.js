export function formatSubnets(subnets) {
  if (!subnets?.length) {
    return '📡 *IPAM SUBNET*\n\nSubnet tidak ditemukan.';
  }

  const lines = ['📡 *IPAM SUBNET*', ''];

  subnets.slice(0, 10).forEach((subnet, index) => {
    const directLink = `${BASE_WEB_URL}/index.php?page=subnets&section=${subnet.sectionId}&subnetId=${subnet.id}`;
    
    lines.push(
      `${index + 1}. *${subnet.subnet}/${subnet.mask}*`,
      `ID: ${subnet.id}`,
      `Description: ${subnet.description || '-'}`,
      '', // Spasi sebelum link
      `🔗 ${directLink}`,
      ''
    );
  });

  return lines.join('\n').trim();
}