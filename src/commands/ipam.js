import {
  searchAddress,
  searchHostname,
} from '../api/phpipam/addresses.js';

import {
  searchSubnet,
  getSubnet,
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

  // !ipam
  if (!subcommand) {
    await reply(
      [
        '📡 *IPAM*',
        '',
        '*Command tersedia:*',
        '',
        '• `!ipam search <ip>`',
        '  Cari IP address',
        '',
        '• `!ipam host <hostname>`',
        '  Cari berdasarkan hostname',
        '',
        '• `!ipam subnet <subnet>`',
        '  Cari subnet',
        '',
        '• `!ipam usage <subnet>`',
        '  Lihat penggunaan subnet',
        '',
        '• `!ipam free <subnet>`',
        '  Cari IP pertama yang masih tersedia',
        '',
        '*Contoh:*',
        '`!ipam search 103.80.81.81`',
        '`!ipam host mx204`',
        '`!ipam subnet 103.80.81.0/24`',
        '`!ipam usage 103.80.81.0/24`',
        '`!ipam free 103.80.81.0/24`',
      ].join('\n')
    );

    return;
  }

  // !ipam search <ip>
  if (subcommand === 'search') {
    const keyword = args.slice(1).join(' ').trim();

    if (!keyword) {
      await reply(
        [
          '📡 *IPAM SEARCH*',
          '',
          'Format:',
          '`!ipam search <ip>`',
          '',
          'Contoh:',
          '`!ipam search 103.80.81.81`',
        ].join('\n')
      );

      return;
    }

    try {
      const addresses = await searchAddress(keyword);

      await reply(formatAddresses(addresses));
    } catch (error) {
      console.error('IPAM search error:', error);

      await reply(
        '❌ *IPAM*\n\nGagal mencari IP address.'
      );
    }

    return;
  }

  // !ipam host <hostname>
  if (subcommand === 'host') {
    const hostname = args.slice(1).join(' ').trim();

    if (!hostname) {
      await reply(
        [
          '📡 *IPAM HOST*',
          '',
          'Format:',
          '`!ipam host <hostname>`',
          '',
          'Contoh:',
          '`!ipam host mx204`',
        ].join('\n')
      );

      return;
    }

    try {
      const addresses = await searchHostname(hostname);

      await reply(formatAddresses(addresses));
    } catch (error) {
      console.error('IPAM hostname search error:', error);

      await reply(
        '❌ *IPAM*\n\nGagal mencari hostname.'
      );
    }

    return;
  }

  // !ipam subnet <cidr>
  if (subcommand === 'subnet') {
    const cidr = args[1];

    if (!cidr) {
      await reply(
        [
          '📡 *IPAM SUBNET*',
          '',
          'Format:',
          '`!ipam subnet <subnet>`',
          '',
          'Contoh:',
          '`!ipam subnet 103.80.81.0/24`',
        ].join('\n')
      );

      return;
    }

    try {
      const subnets = await searchSubnet(cidr);

      await reply(formatSubnets(subnets));
    } catch (error) {
      console.error('IPAM subnet search error:', error);

      await reply(
        '❌ *IPAM*\n\nGagal mencari subnet.'
      );
    }

    return;
  }

  // !ipam usage <cidr>
  if (subcommand === 'usage') {
    const cidr = args[1];

    if (!cidr) {
      await reply(
        [
          '📡 *IPAM USAGE*',
          '',
          'Format:',
          '`!ipam usage <subnet>`',
          '',
          'Contoh:',
          '`!ipam usage 103.80.81.0/24`',
        ].join('\n')
      );

      return;
    }

    try {
      const subnets = await searchSubnet(cidr);

      if (!subnets.length) {
        await reply(
          `❌ Subnet *${cidr}* tidak ditemukan.`
        );

        return;
      }

      const subnet = subnets[0];

      const usage = await getSubnetUsage(subnet.id);

      await reply(
        formatSubnetUsage(subnet, usage)
      );
    } catch (error) {
      console.error('IPAM usage error:', error);

      await reply(
        '❌ *IPAM*\n\nGagal mengambil usage subnet.'
      );
    }

    return;
  }

  // !ipam free <cidr>
  if (subcommand === 'free') {
    const cidr = args[1];

    if (!cidr) {
      await reply(
        [
          '📡 *IPAM FREE*',
          '',
          'Format:',
          '`!ipam free <subnet>`',
          '',
          'Contoh:',
          '`!ipam free 103.80.81.0/24`',
        ].join('\n')
      );

      return;
    }

    try {
      const subnets = await searchSubnet(cidr);

      if (!subnets.length) {
        await reply(
          `❌ Subnet *${cidr}* tidak ditemukan.`
        );

        return;
      }

      const subnet = subnets[0];

      const freeIp = await getFirstFreeIp(subnet.id);

      await reply(
        [
          '📡 *IPAM FREE*',
          '',
          `Subnet: *${subnet.subnet}/${subnet.mask}*`,
          '',
          `First free IP: *${freeIp?.ip || freeIp || '-'}*`,
        ].join('\n')
      );
    } catch (error) {
      console.error('IPAM free error:', error);

      await reply(
        '❌ *IPAM*\n\nGagal mencari IP yang tersedia.'
      );
    }

    return;
  }

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
