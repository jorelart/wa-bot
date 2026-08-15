export async function handleEvolutionBot(payload) {
  const query = String(payload?.query || '').trim();

  console.log('EvolutionBot query:', query);

  if (!query) {
    return '❌ Pesan kosong.';
  }

  let commandText = query;

  // Evolution Bot biasanya mengirim keyword "AI"
  if (/^AI\b/i.test(commandText)) {
    commandText = commandText.replace(/^AI\b/i, '').trim();
  }

  // Test pertama
  if (commandText === '!ping') {
    return '🏓 Pong!';
  }

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