import {
  searchAddress,
  searchHostname,
} from '../api/phpipam/addresses.js';

import {
  searchSubnet,
  getSubnetUsage,
  getFirstFreeIp,
  getChildSubnets,
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

    // Tambahkan status loading karena kita melakukan double-fetch (Subnet + Subnet Anak)
    await reply('⏳ _Mencari data subnet dan strukturnya..._');

    try {
      const subnets = await searchSubnet(param);
      
      if (!subnets || subnets.length === 0) {
        await reply(`📡 *IPAM SUBNET*\n\nSubnet *${param}* tidak ditemukan.`);
        return;
      }

      // Format hasil utama dari subnet yang dicari
      let responseMsg = formatSubnets(subnets);

      // Ambil ID subnet pertama yang ditemukan untuk mengecek anak-anaknya
      const parentSubnet = subnets[0];
      
      try {
        const childSubnets = await getChildSubnets(parentSubnet.id);
        
        if (childSubnets && childSubnets.length > 0) {
          const childSubnetsMsg = childSubnets.map(s => `• \`${s.subnet}/${s.mask}\` - ${s.description || 'Tanpa Deskripsi'}`).join('\n');
          responseMsg += `\n\n*Daftar Child Subnet:*\n${childSubnetsMsg}`;
        } else {
          responseMsg += `\n\n_Subnet ini tidak memiliki child subnet._`;
        }
      } catch (childErr) {
        console.error('Gagal mengambil daftar child subnet:', childErr.message);
      }

      await reply(responseMsg);
    } catch (error) {
      console.error('IPAM subnet search error:', error);
      await reply('❌ *IPAM*\n\nGagal mencari subnet.');
    }
    return;
  }

 // 5. !ipam usage <subnet>
  if (subcommand === 'usage') {
    if (!param) {
      await reply('📡 *IPAM USAGE*\n\nFormat: `!ipam usage <subnet>`\nContoh: `!ipam usage 103.80.81.0/24`');
      return;
    }

    await reply('⏳ _Mengambil statistik subnet..._');

    try {
      const subnets = await searchSubnet(param);
      if (!subnets.length) {
        await reply(`❌ Subnet *${param}* tidak ditemukan.`);
        return;
      }

      const subnet = subnets[0];
      const usage = await getSubnetUsage(subnet.id);

      // Bypass formatter eksternal, kita format langsung secara aman di sini
      const msg = [
        '📊 *IPAM USAGE*',
        '',
        `Subnet: *${subnet.subnet}/${subnet.mask}*`,
        `Deskripsi: ${subnet.description || '-'}`,
        '',
        `Total IP: ${usage.maxhosts || 0}`,
        `🔴 Terpakai: ${usage.Used || 0} (${usage.Used_percent || 0}%)`,
        `🟡 Reserved: ${usage.Reserved || 0} (${usage.Reserved_percent || 0}%)`,
        `🟢 Tersedia: ${usage.freehosts || 0} (${usage.freehosts_percent || 0}%)`
      ].join('\n');

      await reply(msg);
    } catch (error) {
      console.error('IPAM usage error:', error);
      await reply('❌ *IPAM*\n\nGagal mengambil usage subnet.');
    }
    return;
  }

  // 6. !ipam free <subnet>
  if (subcommand === 'free') {
    if (!param) {
      await reply('📡 *IPAM FREE*\n\nFormat: `!ipam free <subnet>`\nContoh: `!ipam free 103.80.81.0/24`');
      return;
    }

    await reply('⏳ _Mencari IP kosong..._');

    try {
      const subnets = await searchSubnet(param);
      if (!subnets.length) {
        await reply(`❌ Subnet *${param}* tidak ditemukan.`);
        return;
      }

      const subnet = subnets[0];
      let freeIp = 'Tidak diketahui';

      try {
        const freeIpData = await getFirstFreeIp(subnet.id);
        freeIp = typeof freeIpData === 'object' ? freeIpData?.ip || freeIpData?.data : freeIpData;
      } catch (apiError) {
        // Tangkap error 409 jika Subnet adalah Folder/Master Subnet
        if (apiError.response?.status === 409) {
          let childSubnetsMsg = '';
          
          try {
            // Tarik daftar subnet anak
            const childSubnets = await getChildSubnets(subnet.id);
            if (childSubnets && childSubnets.length > 0) {
              childSubnetsMsg = '\n\n*Daftar Child Subnet:*\n' + childSubnets.map(s => `• \`${s.subnet}/${s.mask}\` - ${s.description || 'Tanpa Deskripsi'}`).join('\n');
            }
          } catch (childErr) {
            console.error('Gagal mengambil daftar child subnet:', childErr.message);
          }

          await reply(
            `❌ *Gagal mencari IP:* \n\nSubnet *${subnet.subnet}/${subnet.mask}* merupakan Master Subnet (mengandung child subnet di dalamnya). Silakan cari IP kosong di level child subnet.${childSubnetsMsg}`
          );
          return;
        }
        throw apiError; // Lempar error lain ke blok catch utama
      }

      await reply(
        [
          '✅ *IPAM FREE*',
          '',
          `Subnet: *${subnet.subnet}/${subnet.mask}*`,
          `Deskripsi: ${subnet.description || '-'}`,
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
      '*Command tersedia:*',
      '',
      '• `!ipam ip <ip>`',
      '• `!ipam host <hostname>`',
      '• `!ipam subnet <subnet>`',
      '• `!ipam usage <subnet>`',
      '• `!ipam free <subnet>`',
    ].join('\n')
  );
}
