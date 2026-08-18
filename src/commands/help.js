export async function handleHelp({ reply }) {
  const message = [
    '*Available commands:*',
    '',
    '📱 !waid',
    '❓ !help',
    'ℹ️ !info',
    '📊 !zbx _(Zabbix API)_',
    '🌐 !gp _(Globalping API)_',
    '📡 !ipam _(phpIPAM API)_',
    '',
  ].join('\n');

  await reply(message);
}