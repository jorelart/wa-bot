const processedMessages = new Map();

const DEDUPE_TTL = 10_000; // 10 detik

function getMessageKey(payload) {
  const messageId =
    payload?.key?.id ||
    payload?.messageId ||
    payload?.id;

  const remoteJid =
    payload?.key?.remoteJid ||
    payload?.remoteJid ||
    '';

  const query = String(payload?.query || '').trim();

  // Prioritas utama: message ID
  if (messageId) {
    return `message:${remoteJid}:${messageId}`;
  }

  // Fallback jika Evolution Bot tidak mengirim message ID
  return `query:${remoteJid}:${query}`;
}

function isDuplicate(payload) {
  const key = getMessageKey(payload);

  const now = Date.now();

  // Bersihkan cache lama
  for (const [cacheKey, timestamp] of processedMessages.entries()) {
    if (now - timestamp > DEDUPE_TTL) {
      processedMessages.delete(cacheKey);
    }
  }

  if (processedMessages.has(key)) {
    console.log('EvolutionBot duplicate ignored:', key);
    return true;
  }

  processedMessages.set(key, now);

  return false;
}

export async function handleEvolutionBot(payload) {
  const query = String(payload?.query || '').trim();

  console.log('EvolutionBot query:', query);

  if (!query) {
    return '❌ Pesan kosong.';
  }

  /*
   * Evolution Bot bisa mengirim request yang sama lebih dari sekali.
   * Jangan proses ulang request dengan message ID yang sama.
   */
  if (isDuplicate(payload)) {
    // Jangan menghasilkan response kedua.
    return '';
  }

  let commandText = query;

  /*
   * Evolution Bot biasanya mengirim:
   *
   * AI
   * AI !ping
   * AI !zabbix
   *
   * Kita buang keyword AI.
   */
  if (/^AI\b/i.test(commandText)) {
    commandText = commandText
      .replace(/^AI\b/i, '')
      .trim();
  }

  /*
   * Test command
   */
  if (commandText === '!ping') {
    return '🏓 Pong!';
  }

  /*
   * Help
   */
  if (commandText === '!help') {
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
    ].join('\n');
  }

  /*
   * Semua command harus diawali !
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
    ].join('\n');
  }

  const parts = commandText
    .slice(1)
    .trim()
    .split(/\s+/);

  const command = parts.shift()?.toLowerCase();

  return [
    `⚠️ Command \`!${command}\` belum tersedia melalui Evolution Bot.`,
    '',
    'Command tersebut akan kita sambungkan setelah endpoint dasar berhasil.',
  ].join('\n');
}