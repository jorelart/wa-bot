import {
  searchAddress,
  searchHostname,
} from '../api/phpipam/addresses.js';

import {
  searchSubnet,
  getSubnetUsage,
  getFirstFreeIp,
} from '../api/phpipam/subnets.js';

import {
  formatAddresses,
  formatSubnets,
  formatSubnetUsage,
} from '../formatters/phpipam.js';

export async function handleIpam({ reply, args }) {
  const subcommand = args[0]?.toLowerCase();
  // Mengambil sisa argumen sebagai nilai parameter (IP, Hostname, atau Subnet)
  const param = args.slice(1).join(' ').trim();

  // 1. !ipam (tanpa argumen)
  if (!subcommand) {
    await reply(
      [
        '📡 *IPAM*',
        '*Command tersedia:*',
        '',
        '• `!ipam ip <ip>`',
        '• `!ipam host <hostname>`',
        '• `!ipam subnet <subnet>`',
        '• `!ipam usage <subnet>`',
        '• `!ipam free <subnet>`',
      ].join('\n')
    );
    return;
  }

  // 2. !ipam ip <ip>
  if (subcommand === 'ip') {
    if (!param) {
      await reply('📡 *IPAM SEARCH*\n\nFormat: `!ipam ip <ip>`\nContoh: `!ipam ip 103.80.81.81`');
      return;
    }

    try {
      const addresses = await searchAddress(param);
      await reply(formatAddresses(addresses));
    } catch (error) {
      console.error('IPAM search error:', error);
      await reply('❌ *IPAM*\n\nGagal mencari IP address.');
    }
    return;
  }

  // 3. !ipam host <hostname>
  if (subcommand === 'host') {
    if (!param) {
      await reply('📡 *IPAM HOST*\n\nFormat: `!ipam host <hostname>`\nContoh: `!ipam host mx204`');
      return;
    }

    // --- TAMBAHKAN PESAN LOADING DI SINI ---
    await reply('⏳ _Searching for the host, please wait a moment..._');

    try {
      const addresses = await searchHostname(param);
      await reply(formatAddresses(addresses));
    } catch (error) {
      console.error('IPAM hostname search error:', error);
      await reply('❌ *IPAM*\n\nGagal mencari hostname.');
    }
    return;
  }

  // 4. !ipam subnet <subnet>
  if (subcommand === 'subnet') {
    if (!param) {
      await reply('📡 *IPAM SUBNET*\n\nFormat: `!ipam subnet <subnet>`\nContoh: `!ipam subnet 103.80.83.0/24`');
      return;
    }

    try {
      const subnets = await searchSubnet(param);
      await reply(formatSubnets(subnets));
    } catch (error) {
      console.error('IPAM subnet search error:', error);
      await reply('❌ *IPAM*\n\nGagal mencari subnet.');
    }
    return;
  }

  // 5. !ipam usage <subnet>
  if (subcommand === 'usage') {
    if (!param) {
      await reply('📡 *IPAM USAGE*\n\nFormat: `!ipam usage <subnet>`\nContoh: `!ipam usage 103.80.83.0/24`');
      return;
    }

    try {
      const subnets = await searchSubnet(param);
      if (!subnets.length) {
        await reply(`❌ Subnet *${param}* tidak ditemukan.`);
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

  // 6. !ipam free <subnet>
  if (subcommand === 'free') {
    if (!param) {
      await reply('📡 *IPAM FREE*\n\nFormat: `!ipam free <subnet>`\nContoh: `!ipam free 103.80.83.0/24`');
      return;
    }

    try {
      const subnets = await searchSubnet(param);
      if (!subnets.length) {
        await reply(`❌ Subnet *${param}* tidak ditemukan.`);
        return;
      }

      const subnet = subnets[0];
      const freeIpData = await getFirstFreeIp(subnet.id);
      const freeIp = typeof freeIpData === 'object' ? freeIpData?.ip || freeIpData?.data : freeIpData;

      await reply(
        [
          '📡 *IPAM FREE*',
          '',
          `Subnet: *${subnet.subnet}/${subnet.mask}*`,
          `Description: ${subnet.description || '-'}`,
          '',
          `First free IP: *${freeIp || 'Tidak ada IP tersedia'}*`,
        ].join('\n')
      );
    } catch (error) {
      console.error('IPAM free error:', error);
      await reply('❌ *IPAM*\n\nGagal mencari IP yang tersedia.');
    }
    return;
  }

  // Fallback bantuan jika subcommand salah
  await reply(
    [
      '📡 *IPAM*',
      '',
      '*Command tersedia:*',
      '',
      '• `!ipam search <ip>`',
      '• `!ipam host <hostname>`',
      '• `!ipam subnet <subnet>`',
      '• `!ipam usage <subnet>`',
      '• `!ipam free <subnet>`',
    ].join('\n')
  );
}