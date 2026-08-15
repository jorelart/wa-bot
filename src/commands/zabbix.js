import { getProblems, searchProblems } from '../api/zabbix/problem.js';
import { getProblemDetail } from '../api/zabbix/problem-details.js';

import {
  formatProblems,
  formatProblemDetail,
} from '../formatters/zabbix.js';

export async function handleZabbix({ reply, args }) {
  const subcommand = args[0]?.toLowerCase();

  // !zabbix search <keyword>
  if (subcommand === 'search') {
    const keyword = args.slice(1).join(' ').trim();

    if (!keyword) {
      await reply(
        [
          '🔎 *ZABBIX SEARCH*',
          '',
          'Format:',
          '`!zabbix search <keyword>`',
          '',
          'Contoh:',
          '`!zabbix search bgp`',
          '`!zabbix search timeplus`',
          '`!zabbix search XGigabitEthernet`',
        ].join('\n')
      );

      return;
    }

    await handleSearch(reply, keyword);
    return;
  }

  // !zabbix
  // !zabbix problems
  if (!subcommand || subcommand === 'problems') {
    await handleProblems(reply);
    return;
  }

  // !zabbix problem <eventid>
  if (subcommand === 'problem') {
    const eventid = args[1];

    if (!eventid) {
      await reply(
        [
          '📊 *ZABBIX*',
          '',
          'Format:',
          '`!zabbix problem <eventid>`',
          '',
          'Contoh:',
          '`!zabbix problem 1054973`',
        ].join('\n')
      );

      return;
    }

    await handleProblemDetail(reply, eventid);
    return;
  }

  await reply(
    [
      '📊 *ZABBIX*',
      '',
      '*Command tersedia:*',
      '',
      '• `!zabbix`',
      '• `!zabbix problems`',
      '• `!zabbix search <keyword>`',
      '• `!zabbix problem <eventid>`',
    ].join('\n')
  );
}

async function handleProblems(reply) {
  try {
    const problems = await getProblems({
      recent: true,
      limit: 10,
    });

    await reply(formatProblems(problems));
  } catch (error) {
    console.error('Zabbix problems error:', error);

    await reply(
      '❌ *ZABBIX*\n\nGagal mengambil daftar problem.'
    );
  }
}

async function handleProblemDetail(reply, eventid) {
  try {
    const problem = await getProblemDetail(eventid);

    if (!problem) {
      await reply(
        [
          '❌ *ZABBIX*',
          '',
          `Problem dengan Event ID *${eventid}* tidak ditemukan.`,
        ].join('\n')
      );

      return;
    }

    await reply(formatProblemDetail(problem));
  } catch (error) {
    console.error(
      `Zabbix problem detail error [${eventid}]:`,
      error
    );

    await reply(
      [
        '❌ *ZABBIX*',
        '',
        'Gagal mengambil detail problem.',
      ].join('\n')
    );
  }
}

async function handleSearch(reply, keyword) {
  try {
    const problems = await searchProblems(keyword);

    if (!problems.length) {
      await reply(
        [
          '🔎 *ZABBIX SEARCH*',
          '',
          `Tidak ditemukan problem untuk: *${keyword}*`,
        ].join('\n')
      );

      return;
    }

    const lines = [
      '🔎 *ZABBIX SEARCH*',
      '',
      `Keyword: *${keyword}*`,
      `Found: *${problems.length}*`,
      '',
    ];

    const severityIcon = {
      0: '⚪',
      1: '🔵',
      2: '🟡',
      3: '🟠',
      4: '🔴',
      5: '🚨',
    };

    problems.forEach((problem, index) => {
      const priority = Number(problem.severity);

      lines.push(
        `${index + 1}. ${severityIcon[priority] || '⚪'} *${problem.name}*`,
        `Event ID: ${problem.eventid}`,
        ''
      );
    });

    await reply(lines.join('\n'));
  } catch (error) {
    console.error(
      `Zabbix search error [${keyword}]:`,
      error
    );

    await reply(
      [
        '❌ *ZABBIX SEARCH*',
        '',
        'Gagal melakukan pencarian.',
      ].join('\n')
    );
  }
}