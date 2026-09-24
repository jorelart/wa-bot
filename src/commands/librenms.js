import { searchBgpSessions } from '../api/librenms/bgp.js';
import { getActiveAlerts } from '../api/librenms/alerts.js';
import { searchDevice } from '../api/librenms/devices.js';
import { searchPort } from '../api/librenms/ports.js';
import { searchMac, searchIp } from '../api/librenms/resources.js';

import {
  formatBgpSessions,
  formatAlerts,
  formatDevice,
  formatPorts,
  formatMacSearch,
  formatIpSearch
} from '../formatters/librenms.js';

export async function handleLibrenms({ reply, args }) {
  const subcommand = args[0]?.toLowerCase();
  const param = args.slice(1).join(' ').trim();

  // !libre bgp <keyword>
  if (subcommand === 'bgp') {
    if (!param) {
      await reply('📡 *LIBRENMS BGP*\n\nFormat: `!libre bgp <keyword>`\nContoh: `!libre bgp 131090`');
      return;
    }
    await reply('⏳ _Mencari data BGP di LibreNMS..._');
    try {
      const sessions = await searchBgpSessions(param);
      await reply(formatBgpSessions(sessions, param));
    } catch (error) {
      console.error('LibreNMS BGP search error:', error);
      await reply('❌ *LIBRENMS*\n\nGagal mencari BGP session.');
    }
    return;
  }

  // !libre alerts
  if (subcommand === 'alerts') {
    await reply('⏳ _Mengambil data alert aktif..._');
    try {
      const alerts = await getActiveAlerts();
      await reply(formatAlerts(alerts));
    } catch (error) {
      console.error('LibreNMS alerts error:', error);
      await reply('❌ *LIBRENMS*\n\nGagal mengambil data alert.');
    }
    return;
  }

  // !libre device <hostname>
  if (subcommand === 'device') {
    if (!param) {
      await reply('🖥️ *LIBRENMS DEVICE*\n\nFormat: `!libre device <hostname>`\nContoh: `!libre device router-core-1`');
      return;
    }
    await reply('⏳ _Mencari status device..._');
    try {
      const device = await searchDevice(param);
      await reply(formatDevice(device, param));
    } catch (error) {
      console.error('LibreNMS device search error:', error);
      await reply('❌ *LIBRENMS*\n\nGagal mencari status device.');
    }
    return;
  }

  // !libre port <keyword>
  if (subcommand === 'port') {
    if (!param) {
      await reply('🔌 *LIBRENMS PORT*\n\nFormat: `!libre port <keyword>`\nContoh: `!libre port ether1`');
      return;
    }
    await reply('⏳ _Mencari data port..._');
    try {
      const ports = await searchPort(param);
      await reply(formatPorts(ports, param));
    } catch (error) {
      console.error('LibreNMS port search error:', error);
      await reply('❌ *LIBRENMS*\n\nGagal mencari data port.');
    }
    return;
  }

  // !libre mac <mac>
  if (subcommand === 'mac') {
    if (!param) {
      await reply('🔍 *LIBRENMS MAC LOCATOR*\n\nFormat: `!libre mac <mac_address>`\nContoh: `!libre mac 00:11:22:33:44:55`');
      return;
    }
    await reply('⏳ _Melacak lokasi MAC Address..._');
    try {
      const macs = await searchMac(param);
      await reply(formatMacSearch(macs, param));
    } catch (error) {
      console.error('LibreNMS MAC locator error:', error);
      await reply('❌ *LIBRENMS*\n\nGagal melacak MAC Address.');
    }
    return;
  }

  // !libre arp <ip>
  if (subcommand === 'arp' || subcommand === 'ip') {
    if (!param) {
      await reply('🔍 *LIBRENMS IP LOCATOR*\n\nFormat: `!libre arp <ip_address>`\nContoh: `!libre arp 192.168.1.5`');
      return;
    }
    await reply('⏳ _Melacak lokasi IP Address..._');
    try {
      const ips = await searchIp(param);
      await reply(formatIpSearch(ips, param));
    } catch (error) {
      console.error('LibreNMS IP locator error:', error);
      await reply('❌ *LIBRENMS*\n\nGagal melacak IP Address.');
    }
    return;
  }

  // !libre (default help)
  await reply(
    [
      '📊 *LIBRENMS*',
      '',
      '*Command tersedia:*',
      '',
      '• `!libre alerts`',
      '  Menampilkan alert jaringan aktif.',
      '• `!libre device <hostname>`',
      '  Cek status uptime & info device.',
      '• `!libre port <keyword>`',
      '  Cari status interface (UP/DOWN).',
      '• `!libre mac <mac>`',
      '  Melacak port switch dari sebuah MAC.',
      '• `!libre arp <ip>`',
      '  Melacak port switch dari sebuah IP.',
      '• `!libre bgp <keyword>`',
      '  Mencari BGP session (berdasarkan AS/IP).',
      '',
      '💡 Ketik `!help` untuk melihat semua command bot.',
    ].join('\n')
  );
}
