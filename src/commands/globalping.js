import {
  createPing,
  createTraceroute,
  getMeasurement,
} from '../api/globalping.js';

export async function handleGlobalping({ reply, args }) {
  const subcommand = args[0]?.toLowerCase();

  if (!['ping', 'traceroute'].includes(subcommand)) {
    await reply(
      [
        '🌐 *GLOBALPING*',
        '',
        '*Command tersedia:*',
        '',
        '`!gp ping <target> <location>`',
        '`!gp traceroute <target> <location>`',
        '',
        '*Contoh:*',
        '`!gp ping 8.8.8.8 Pati`',
        '`!gp ping 1.1.1.1 Jakarta`',
        '`!gp traceroute 8.8.8.8 Singapore`',
      ].join('\n')
    );

    return;
  }

  const target = args[1];
  const location = args.slice(2).join(' ').trim();

  if (!target || !location) {
    await reply(
      [
        `🌐 *GLOBALPING ${subcommand.toUpperCase()}*`,
        '',
        'Format:',
        `\`!gp ${subcommand} <target> <location>\``,
        '',
        'Contoh:',
        `\`!gp ${subcommand} 8.8.8.8 Pati\``,
      ].join('\n')
    );

    return;
  }

  if (subcommand === 'ping') {
    await handlePing(reply, target, location);
    return;
  }

  if (subcommand === 'traceroute') {
    await handleTraceroute(reply, target, location);
    return;
  }
}

async function handlePing(reply, target, location) {
  try {
    await reply(
      [
        '🌐 *GLOBALPING PING*',
        '',
        `🎯 Target: *${target}*`,
        `📍 Location: *${location}*`,
        '',
        '⏳ Menjalankan ping...',
      ].join('\n')
    );

    const measurement = await createPing(
      target,
      location
    );

    const measurementId = measurement.id;

    if (!measurementId) {
      throw new Error(
        'Globalping tidak mengembalikan measurement ID'
      );
    }

    const result = await waitForMeasurement(
      measurementId
    );

    await reply(
      formatPingResult(
        result,
        target,
        location
      )
    );
  } catch (error) {
    console.error(
      'Globalping ping error:',
      error
    );

    await reply(
      [
        '❌ *GLOBALPING PING*',
        '',
        `🎯 Target: *${target}*`,
        `📍 Location: *${location}*`,
        '',
        'Gagal menjalankan ping.',
        '',
        `Error: ${
          error.response?.data?.error?.message ||
          error.message
        }`,
      ].join('\n')
    );
  }
}

async function handleTraceroute(reply, target, location) {
  try {
    await reply(
      [
        '🌐 *GLOBALPING TRACEROUTE*',
        '',
        `🎯 Target: *${target}*`,
        `📍 Location: *${location}*`,
        '',
        '⏳ Menjalankan traceroute...',
      ].join('\n')
    );

    const measurement = await createTraceroute(
      target,
      location
    );

    const measurementId = measurement.id;

    if (!measurementId) {
      throw new Error(
        'Globalping tidak mengembalikan measurement ID'
      );
    }

    const result = await waitForMeasurement(
      measurementId
    );

    console.log(
      'Globalping traceroute final result:',
      JSON.stringify(result, null, 2)
    );

    await reply(
      formatTracerouteResult(
        result,
        target,
        location
      )
    );
  } catch (error) {
    console.error(
      'Globalping traceroute error:',
      error
    );

    await reply(
      [
        '❌ *GLOBALPING TRACEROUTE*',
        '',
        `🎯 Target: *${target}*`,
        `📍 Location: *${location}*`,
        '',
        'Gagal menjalankan traceroute.',
        '',
        `Error: ${
          error.response?.data?.error?.message ||
          error.message
        }`,
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
      '❌ *GLOBALPING PING*',
      '',
      `🎯 Target: *${target}*`,
      `📍 Location: *${location}*`,
      '',
      'Tidak ada hasil dari probe.',
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
    const firstTiming = result.timings?.[0] || {};

    const city = probe.city || '-';
    const country = probe.country || '-';
    const asn = probe.asn || '-';
    const network = probe.network || '-';

    const total = stats.total ?? '-';
    const received = stats.rcv ?? '-';
    const loss = stats.loss ?? '-';
    const ttl = firstTiming.ttl ?? '-';

    lines.push(
      `📡 *${city}, ${country}*`,
      `🏢 ${network}`,
      `ASN: ${asn}`,
      '',
      `📦 Packets: ${received}/${total}`,
      `📉 Loss: ${loss}%`,
      `⚡ Min: ${formatMs(stats.min)}`,
      `📊 Avg: ${formatMs(stats.avg)}`,
      `📈 Max: ${formatMs(stats.max)}`,
      `⏱ TTL: ${ttl}`,
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

function formatTracerouteResult(
  data,
  target,
  location
) {
  const results = data.results || [];

  if (!results.length) {
    return [
      '❌ *GLOBALPING TRACEROUTE*',
      '',
      `🎯 Target: *${target}*`,
      `📍 Location: *${location}*`,
      '',
      'Tidak ada hasil dari probe.',
    ].join('\n');
  }

  const lines = [
    '🌐 *GLOBALPING TRACEROUTE*',
    '',
    `🎯 Target: *${target}*`,
    `📍 Requested: *${location}*`,
    '',
  ];

  for (const item of results) {
    const probe = item.probe || {};
    const result = item.result || {};

    lines.push(
      `📡 *${probe.city || '-'}, ${
        probe.country || '-'
      }*`,
      `🏢 ${probe.network || '-'}`,
      `ASN: ${probe.asn || '-'}`,
      ''
    );

    const hops = result.hops || [];

    if (!hops.length) {
      lines.push(
        '❌ Tidak ada hop yang ditemukan.',
        ''
      );

      continue;
    }

    lines.push('*Route:*');

    for (const hop of hops) {
      const hopNumber =
        hop.hop ?? hop.ttl ?? '-';

      const hostname =
        hop.hostname ||
        hop.resolvedHostname ||
        hop.address ||
        '*';

      const address =
        hop.address ||
        hop.ip ||
        '-';

      const rtt =
        hop.rtt ??
        hop.timings?.[0]?.rtt;

      lines.push(
        `${hopNumber}. ${hostname} (${address})${
          rtt !== undefined
            ? ` — ${formatMs(rtt)}`
            : ''
        }`
      );
    }

    lines.push('');
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