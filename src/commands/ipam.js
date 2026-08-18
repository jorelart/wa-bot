// !ipam subnet <cidr>
  if (subcommand === 'subnet') {
    const cidr = args.slice(1).join(' ').trim(); // Ubah dari args[1] ke ini

    if (!cidr) {
      await reply([
        '📡 *IPAM SUBNET*',
        '',
        'Format:',
        '`!ipam subnet <subnet>`',
        '',
        'Contoh:',
        '`!ipam subnet 103.80.83.0/24`',
      ].join('\n'));
      return;
    }

    try {
      const subnets = await searchSubnet(cidr);
      await reply(formatSubnets(subnets));
    } catch (error) {
      console.error('IPAM subnet search error:', error);
      await reply('❌ *IPAM*\n\nGagal mencari subnet.');
    }
    return;
  }

  // !ipam usage <cidr>
  if (subcommand === 'usage') {
    const cidr = args.slice(1).join(' ').trim(); // Ubah dari args[1] ke ini

    if (!cidr) {
      await reply([
        '📡 *IPAM USAGE*',
        '',
        'Format:',
        '`!ipam usage <subnet>`',
        '',
        'Contoh:',
        '`!ipam usage 103.80.83.0/24`',
      ].join('\n'));
      return;
    }

    try {
      const subnets = await searchSubnet(cidr);
      if (!subnets.length) {
        await reply(`❌ Subnet *${cidr}* tidak ditemukan.`);
        return;
      }
      const subnet = subnets[0];
      const usage = await getSubnetUsage(subnet.id);
      await reply(formatSubnetUsage(subnet, usage));
    } catch (error) {
      console.error('IPAM usage error:', error);
      await reply('❌ *IPAM*\n\nGagal mengambil usage subnet.');
    }
    return;
  }

  // !ipam free <cidr>
  if (subcommand === 'free') {
    const cidr = args.slice(1).join(' ').trim(); // Ubah dari args[1] ke ini

    if (!cidr) {
      await reply([
        '📡 *IPAM FREE*',
        '',
        'Format:',
        '`!ipam free <subnet>`',
        '',
        'Contoh:',
        '`!ipam free 103.80.83.0/24`',
      ].join('\n'));
      return;
    }

    try {
      const subnets = await searchSubnet(cidr);
      if (!subnets.length) {
        await reply(`❌ Subnet *${cidr}* tidak ditemukan.`);
        return;
      }
      const subnet = subnets[0];
      const freeIpData = await getFirstFreeIp(subnet.id);
      const freeIp = typeof freeIpData === 'object' ? freeIpData?.ip || freeIpData?.data : freeIpData;

      await reply([
        '📡 *IPAM FREE*',
        '',
        `Subnet: *${subnet.subnet}/${subnet.mask}*`,
        `Description: ${subnet.description || '-'}`,
        '',
        `First free IP: *${freeIp || 'Tidak ada IP tersedia'}*`,
      ].join('\n'));
    } catch (error) {
      console.error('IPAM free error:', error);
      await reply('❌ *IPAM*\n\nGagal mencari IP yang tersedia.');
    }
    return;
  }