export async function handleHelp({ reply }) {
  const message = [
    '*Available commands:*',
    '',
    '📱 !waid',
    '❓ !help',
    'ℹ️ !info',
    '📊 !zbx `Zabbix API)`',
    '🌐 !gp `Globalping API)`',
    '📡 !ipam `phpIPAM API)`',
    '',
  ].join('\n');

  await reply(message);
}