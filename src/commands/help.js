export async function handleHelp({ reply }) {
  const message = [
    '*Available commands:*',
    '',
    '📱 !waid',
    '❓ !help',
    '🏓 !ping',
    'ℹ️ !info',
    '📊 !zbx (Zabbix API)',
    '🌐 !gp (Globalping API)',
    '',
  ].join('\n');

  await reply(message);
}