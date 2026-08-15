export async function handleHelp({ reply }) {
  const message = [
    '🤖 *WA NOC Bot*',
    '',
    '*Available commands:*',
    '',
    '📱 !waid',
    '❓ !help',
    '🏓 !ping',
    'ℹ️ !info',
    '📊 !zabbix',
    '',
    'Contoh:',
    '!zabbix problems',
    '!zabbix search bgp',
  ].join('\n');

  await reply(message);
}