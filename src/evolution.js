import { handleCommand } from '../commands/index.js';

export async function handleEvolutionBot(payload) {
  const query = String(payload?.query || '').trim();

  if (!query) {
    return '❌ Pesan kosong.';
  }

  console.log(
    `EvolutionBot query: ${query}`
  );

  /*
   * EvolutionBot menggunakan query sebagai input.
   *
   * Kita tetap menggunakan command router yang sudah ada.
   *
   * Contoh:
   * AI !zabbix problems
   * AI !zabbix search bgp
   */

  let commandText = query;

  /*
   * Jika query diawali "AI", buang keyword tersebut.
   */
  if (/^AI\b/i.test(commandText)) {
    commandText = commandText.replace(/^AI\b/i, '').trim();
  }

  /*
   * EvolutionBot nantinya bisa digunakan untuk
   * command seperti:
   *
   * !ping
   * !info
   * !waid
   * !zabbix
   * !zabbix problems
   * !zabbix search bgp
   */
  if (!commandText.startsWith('!')) {
    return [
      '🤖 *WA NOC Bot*',
      '',
      'Command harus diawali `!`.',
      '',
      'Contoh:',
      '`!ping`',
      '`!zabbix`',
      '`!zabbix search bgp`',
    ].join('\n');
  }

  const parts = commandText
    .slice(1)
    .trim()
    .split(/\s+/);

  const command = parts.shift()?.toLowerCase();

  if (!command) {
    return '❌ Command tidak ditemukan.';
  }

  /*
   * Context dibuat mirip dengan webhook WhatsApp
   * supaya command yang sudah ada tetap bisa digunakan.
   */
  const context = {
    chatId: payload?.remoteJid || payload?.inputs?.remoteJid,
    sender: payload?.pushName || 'EvolutionBot',
    isGroup: String(
      payload?.remoteJid ||
      payload?.inputs?.remoteJid ||
      ''
    ).endsWith('@g.us'),
    command,
    args: parts,
    rawMessage: commandText,
    payload,
    fromEvolutionBot: true,
  };

  console.log(
    `EvolutionBot command: !${command} | Args: ${parts.join(' ')}`
  );

  /*
   * Karena command lama menggunakan sendReply()
   * yang mengirim langsung ke WhatsApp, kita belum ingin
   * menjalankan command tersebut di sini.
   *
   * Untuk EvolutionBot, kita butuh hasil berupa STRING.
   *
   * Tahap berikutnya kita pisahkan "logic" command
   * dari "delivery" WhatsApp.
   */

  if (command === 'ping') {
    return '🏓 Pong!';
  }

  if (command === 'help') {
    return [
      '🤖 *WA NOC Bot*',
      '',
      '*Available commands:*',
      '',
      '📱 `!waid`',
      '❓ `!help`',
      '🏓 `!ping`',
      'ℹ️ `!info`',
      '📊 `!zabbix`',
      '',
      '*Zabbix:*',
      '`!zabbix problems`',
      '`!zabbix problem <eventid>`',
      '`!zabbix search <keyword>`',
    ].join('\n');
  }

  /*
   * Untuk sementara command yang sudah memiliki
   * output langsung ke WhatsApp tidak kita panggil
   * dari EvolutionBot.
   *
   * Kita akan refactor Zabbix agar dapat:
   *
   * command -> return text
   *
   * kemudian:
   *
   * webhook -> sendReply()
   * EvolutionBot -> return { message }
   */

  return [
    `⚠️ Command \`!${command}\` belum tersedia melalui Evolution Bot.`,
    '',
    'Gunakan webhook WhatsApp langsung untuk command tersebut.',
  ].join('\n');
}