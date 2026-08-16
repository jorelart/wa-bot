import {
  createPing,
  getMeasurement,
} from '../api/globalping.js';

export async function handleGlobalping({ reply, args }) {
  const subcommand = args[0]?.toLowerCase();

  if (subcommand !== 'ping') {
    await reply(
      [
        '🌐 *GLOBALPING*',
        '',
        'Format:',
        '`!gp ping <target> <location>`',
        '',
        'Contoh:',
        '`!gp ping 8.8.8.8 Jakarta`',
        '`!gp ping google.com Singapore`',
        '`!gp ping 1.1.1.1 Tokyo`',
      ].join('\n')
    );

    return;
  }

  const target = args[1];
  const location = args.slice(2).join(' ').trim();

  if (!target || !location) {
    await reply(
      [
        '🌐 *GLOBALPING PING*',
        '',
        'Format:',
        '`!gp ping <target> <location>`',
        '',
        'Contoh:',
        '`!gp ping 8.8.8.8 Jakarta`',
      ].join('\n')
    );

    return;
  }

  try {
    await reply(
      [
        '🌐 *GLOBALPING*',
        '',
        `Target: *${target}*`,
        `Location: *${location}*`,
        '',
        '⏳ Menjalankan ping...',
      ].join('\n')
    );

    const measurement = await createPing(target, location);

    const measurementId = measurement.id;

    if (!measurementId) {
      throw new Error('Globalping tidak mengembalikan measurement ID');
    }

    const result = await waitForMeasurement(measurementId);

    await reply(formatPingResult(result, target, location));
  } catch (error) {
    console.error('Globalping ping error:', error);

    await reply(
      [
        '❌ *GLOBALPING*',
        '',
        'Gagal menjalankan ping.',
        '',
        `Target: *${target}*`,
        `Location: *${location}*`,
        '',
        `Error: ${error.response?.data?.error?.message || error.message}`,
      ].join('\n')
    );
  }
}

async function waitForMeasurement(id) {
  const maxAttempts = 15;
  const interval = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getMeasurement(id);

    if (
      result.status &&
      result.status !== 'in-progress'
    ) {
      return result;
    }

    await sleep(interval);
  }

  throw new Error('Timeout menunggu hasil Globalping');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatPingResult(data, target, location) {
  const results = data.results || [];

  if (!results.length) {
    return [
      '🌐 *GLOBALPING PING*',
      '',
      `Target: *${target}*`,
      `Location: *${location}*`,
      '',
      '❌ Tidak ada hasil dari probe.',
    ].join('\n');
  }

  const lines = [
    '🌐 *GLOBALPING PING*',
    '',
    `🎯 Target: *${target}*`,
    `📍 Requested: *${location}*`,
    '',
  ];

  for (const item of results) {
    const probe = item.probe || {};
    const result = item.result || {};
    const stats = result.stats || {};

    const city = probe.city || '-';
    const country = probe.country || '-';
    const asn = probe.asn || '-';

    lines.push(
      `📡 *${city}, ${country}*`,
      `ASN: ${asn}`,
      `Loss: ${stats.loss ?? '-'}%`,
      `Min: ${formatMs(stats.min)}`,
      `Avg: ${formatMs(stats.avg)}`,
      `Max: ${formatMs(stats.max)}`,
      ''
    );
  }

  if (data.id) {
    lines.push(
      `🔗 https://globalping.io?measurement=${data.id}`
    );
  }

  return lines.join('\n').trim();
}

function formatMs(value) {
  if (value === undefined || value === null) {
    return '-';
  }

  return `${Number(value).toFixed(2)} ms`;
}