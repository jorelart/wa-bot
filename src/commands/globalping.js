import {
  createPing,
  createTraceroute,
  createDns,
  getMeasurement,
} from '../api/globalping.js';

export async function handleGlobalping({ reply, args }) {
  const subcommand = args[0]?.toLowerCase();

  if (!['ping', 'traceroute', 'dns'].includes(subcommand)) {
    await reply(
      [
        '🌐 *GLOBALPING*',
        '',
        '*Command tersedia:*',
        '',
        '`!gp ping <target> <location> [probe]`',
        '`!gp traceroute <target> <location> [probe]`',
        '`!gp dns <target> <location> [probe]`',
        '',
        '*Contoh:*',
        '`!gp ping 8.8.8.8 Pati`',
        '`!gp ping 8.8.8.8 Pati 5`',
        '`!gp traceroute 1.1.1.1 Jakarta`',
        '`!gp traceroute 1.1.1.1 Jakarta 3`',
        '`!gp dns google.com Jakarta`',
        '`!gp dns google.com Jakarta 5`',
        '',
        'Probe: 1-5',
        'Default: 3',
      ].join('\n')
    );

    return;
  }

  const target = args[1];

  if (!target) {
    await reply(
      [
        `🌐 *GLOBALPING ${subcommand.toUpperCase()}*`,
        '',
        'Format:',
        `\`!gp ${subcommand} <target> <location> [probe]\``,
        '',
        'Contoh:',
        `\`!gp ${subcommand} 8.8.8.8 Pati\``,
        `\`!gp ${subcommand} 8.8.8.8 Pati 5\``,
        '',
        'Probe: 1-5',
        'Default: 3',
      ].join('\n')
    );

    return;
  }

  /*
   * Jika argument terakhir adalah angka,
   * dianggap sebagai jumlah probe.
   *
   * Contoh:
   *
   * !gp ping 8.8.8.8 Pati
   * !gp ping 8.8.8.8 Pati 5
   *
   * !gp ping 8.8.8.8 Jakarta Selatan 5
   */

  const lastArg = args[args.length - 1];

  const hasProbeCount =
    /^\d+$/.test(lastArg) &&
    args.length >= 4;

  const probeCount = hasProbeCount
    ? Math.min(
        Math.max(Number(lastArg), 1),
        5
      )
    : 3;

  const locationEnd = hasProbeCount
    ? args.length - 1
    : args.length;

  const location = args
    .slice(2, locationEnd)
    .join(' ')
    .trim();

  if (!location) {
    await reply(
      [
        `🌐 *GLOBALPING ${subcommand.toUpperCase()}*`,
        '',
        'Format:',
        `\`!gp ${subcommand} <target> <location> [probe]\``,
        '',
        'Contoh:',
        `\`!gp ${subcommand} 8.8.8.8 Pati\``,
        `\`!gp ${subcommand} 8.8.8.8 Pati 5\``,
        '',
        'Probe: 1-5',
        'Default: 3',
      ].join('\n')
    );

    return;
  }

  // console.log(
  //   `Globalping ${subcommand}: target=${target}, location=${location}, probes=${probeCount}`
  // );

  if (subcommand === 'ping') {
    await handlePing(
      reply,
      target,
      location,
      probeCount
    );

    return;
  }

  if (subcommand === 'traceroute') {
    await handleTraceroute(
      reply,
      target,
      location,
      probeCount
    );

    return;
  }
  if (subcommand === 'dns') {
    await handleDns(
        reply,
        target,
        location,
        probeCount
    );

    return;
}
}

async function handlePing(
  reply,
  target,
  location,
  probeCount
) {
  try {
    await reply(
      [
        '🌐 *GLOBALPING PING*',
        '',
        `🎯 Target: *${target}*`,
        `📍 Location: *${location}*`,
        `📡 Probes: *${probeCount}*`,
        '',
        '⏳ Menjalankan ping...',
      ].join('\n')
    );

    const measurement = await createPing(
      target,
      location,
      probeCount
    );

    console.log(
      'Globalping create measurement:',
      measurement
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
      'Globalping ping final result:',
      JSON.stringify(result, null, 2)
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

async function handleTraceroute(
  reply,
  target,
  location,
  probeCount
) {
  try {
    await reply(
      [
        '🌐 *GLOBALPING TRACEROUTE*',
        '',
        `🎯 Target: *${target}*`,
        `📍 Location: *${location}*`,
        `📡 Probes: *${probeCount}*`,
        '',
        '⏳ Menjalankan traceroute...',
      ].join('\n')
    );

    const measurement = await createTraceroute(
      target,
      location,
      probeCount
    );

    console.log(
      'Globalping create traceroute:',
      measurement
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

async function handleDns(
  reply,
  target,
  location,
  probeCount
) {
  try {
    await reply(
      [
        '🌐 *GLOBALPING DNS*',
        '',
        `🎯 Target: *${target}*`,
        `📍 Location: *${location}*`,
        `📡 Probes: *${probeCount}*`,
        '',
        '⏳ Menjalankan DNS Lookup...',
      ].join('\n')
    );

    const measurement = await createDns(
      target,
      location,
      probeCount
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
      'Globalping DNS final result:',
      JSON.stringify(result, null, 2)
    );

    await reply(
      formatDnsResult(
        result,
        target,
        location
      )
    );
  } catch (error) {
    console.error(
      'Globalping DNS error:',
      error
    );

    await reply(
      [
        '❌ *GLOBALPING DNS*',
        '',
        `🎯 Target: *${target}*`,
        `📍 Location: *${location}*`,
        '',
        'Gagal menjalankan DNS lookup.',
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

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt++
  ) {
    const result = await getMeasurement(id);

    console.log(
      `Globalping measurement ${id}:`,
      result.status
    );

    if (
      result.status &&
      result.status !== 'in-progress'
    ) {
      return result;
    }

    await sleep(interval);
  }

  throw new Error(
    'Timeout menunggu hasil Globalping'
  );
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
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
      '',
      data.id
        ? `🔗 https://globalping.io?measurement=${data.id}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  const lines = [];

  results.forEach((item, index) => {
    const probe = item.probe || {};
    const result = item.result || {};

    const city = probe.city || '-';
    const country = probe.country || '-';

    const asn = probe.asn
      ? `AS${probe.asn}`
      : '-';

    const network = probe.network || '-';

    lines.push(
      `🌍 ${city}, ${country}`,
      `📡 ${asn} (${network})`,
      ''
    );

    if (result.rawOutput) {
      lines.push(
        '```',
        result.rawOutput.trim(),
        '```',
        ''
      );
    } else {
      lines.push(
        '❌ Raw ping result tidak tersedia.',
        ''
      );
    }

    // Pemisah antar probe
    if (index < results.length - 1) {
      lines.push('---', '');
    }
  });

  // Link measurement hanya satu kali di bagian paling bawah
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

  const lines = [];

  for (const item of results) {
    const probe = item.probe || {};
    const result = item.result || {};

    const city = probe.city || '-';
    const country = probe.country || '-';

    const asn = probe.asn
      ? `AS${probe.asn}`
      : '-';

    const network = probe.network || '-';

    lines.push(
      `🌍 ${city}, ${country}`,
      `📡 ${asn} (${network})`,
      ''
    );

    if (result.rawOutput) {
      lines.push(
        '```',
        result.rawOutput.trim(),
        '```',
        ''
      );
    } else {
      lines.push(
        '❌ Tidak ada output traceroute.',
        ''
      );
    }

    lines.push('---', '');
  }

  if (data.id) {
    lines.push(
      `🔗 https://globalping.io?measurement=${data.id}`
    );
  }

  return lines.join('\n').trim();
}

function formatDnsResult(
  data,
  target,
  location
) {
  const results = data.results || [];

  if (!results.length) {
    return [
      '❌ *GLOBALPING DNS*',
      '',
      `🎯 Target: *${target}*`,
      `📍 Location: *${location}*`,
      '',
      'Tidak ada hasil dari probe.',
    ].join('\n');
  }

  const lines = [];

  results.forEach((item) => {
    const probe = item.probe || {};
    const result = item.result || {};

    const city = probe.city || '-';
    const country = probe.country || '-';
    const network = probe.network || '-';

    const asn = probe.asn
      ? `AS${probe.asn}`
      : '-';

    const resolver =
      Array.isArray(probe.resolvers)
        ? probe.resolvers.join(', ')
        : result.resolver || '-';

    const answers = extractDnsAnswers(result);

    lines.push(
      `🌍 ${city}, ${country}`,
      `📡 ${asn} (${network})`,
      ''
    );

    if (answers.length) {
      lines.push(
        '```',
        ...answers,
        '```',
        ''
      );
    } else {
      lines.push(
        '```',
        'Answer: -',
        '```',
        ''
      );
    }

    lines.push(
      '```',
      `Resolver: ${resolver}`,
      '```',
      '---',
      ' '
    );
  });

  // Link measurement
  if (data.id) {
    lines.push(
      '',
      `🔗 https://globalping.io?measurement=${data.id}`
    );
  }

  return lines.join('\n').trim();
}

function extractDnsAnswers(result) {
  const answers = [];

  /*
   * Globalping DNS biasanya mengembalikan
   * answer dalam bentuk object.
   *
   * Contoh:
   *
   * {
   *   name: "google.com.",
   *   type: "A",
   *   ttl: 2,
   *   data: "172.217.194.139"
   * }
   */

  if (Array.isArray(result.answers)) {
    for (const answer of result.answers) {
      if (typeof answer === 'string') {
        answers.push(answer);
        continue;
      }

      if (!answer || typeof answer !== 'object') {
        continue;
      }

      const name =
        answer.name ||
        answer.hostname ||
        '';

      const type =
        answer.type ||
        '';

      const value =
        answer.data ??
        answer.value ??
        answer.address ??
        '';

      const ttl =
        answer.ttl ??
        answer.TTL ??
        '';

      if (name || type || value) {
        answers.push(
          `${name} IN ${type} ${value}${ttl !== '' ? ` (${ttl})` : ''}`
        );
      }
    }
  }

  /*
   * Fallback jika API menggunakan records
   */
  if (
    !answers.length &&
    Array.isArray(result.records)
  ) {
    for (const record of result.records) {
      if (!record || typeof record !== 'object') {
        continue;
      }

      const name =
        record.name ||
        record.hostname ||
        '';

      const type =
        record.type ||
        '';

      const value =
        record.data ??
        record.value ??
        record.address ??
        '';

      const ttl =
        record.ttl ??
        record.TTL ??
        '';

      if (name || type || value) {
        answers.push(
          `${name} IN ${type} ${value}${ttl !== '' ? ` (${ttl})` : ''}`
        );
      }
    }
  }

  return [
    ...new Set(answers),
  ];
}

function formatMs(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return '-';
  }

  return `${Number(value).toFixed(2)} ms`;
}