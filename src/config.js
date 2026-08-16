import 'dotenv/config';

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const config = {
  port: Number(process.env.PORT || 3000),

  evolution: {
    url: required('EVOLUTION_API_URL'),
    apiKey: required('EVOLUTION_API_KEY'),
    instance: required('EVOLUTION_INSTANCE'),
  },

  bot: {
    lid: required('BOT_LID'),
  },

  zabbix: {
    url: required('ZABBIX_API_URL'),
    token: required('ZABBIX_API_TOKEN'),
  },

  globalping: {
    url: process.env.GLOBALPING_API_URL || 'https://api.globalping.io/v1',
    apiKey: process.env.GLOBALPING_API_KEY || '',
  },
};