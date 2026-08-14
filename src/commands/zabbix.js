import { sendMessage } from '../api/evolution.js';
import { getProblems, searchProblems } from '../api/zabbix/problem.js';
import { getProblemDetail } from '../api/zabbix/problem-details.js';

import {
  formatProblems,
  formatProblemDetail,
} from '../formatters/zabbix.js';

export async function handleZabbix({ chatId, args }) {
  const subcommand = args[0]?.toLowerCase();

    if (subcommand === 'search') {
  const keyword = args.slice(1).join(' ').trim();

  if (!keyword) {
    await sendMessage(
      chatId,
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

  await handleSearch(chatId, keyword);
  return;
    }
    
  // !zabbix
  // !zabbix problems
  if (!subcommand || subcommand === 'problems') {
    await handleProblems(chatId);
    return;
  }

  // !zabbix problem <eventid>
  if (subcommand === 'problem') {
    const eventid = args[1];

    if (!eventid) {
      await sendMessage(
        chatId,
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

    await handleProblemDetail(chatId, eventid);
    return;
  }

  await sendMessage(
    chatId,
    [
      '📊 *ZABBIX*',
      '',
      '*Command tersedia:*',
      '',
      '• `!zabbix`',
      '• `!zabbix problems`',
      '• `!zabbix problem <eventid>`',
    ].join('\n')
  );
}

async function handleProblems(chatId) {
  try {
    const problems = await getProblems({
      recent: true,
      limit: 10,
    });

    await sendMessage(
      chatId,
      formatProblems(problems)
    );
  } catch (error) {
    console.error('Zabbix problems error:', error);

    await sendMessage(
      chatId,
      '❌ *ZABBIX*\n\nGagal mengambil daftar problem.'
    );
  }
}

async function handleProblemDetail(chatId, eventid) {
  try {
    const problem = await getProblemDetail(eventid);

    if (!problem) {
      await sendMessage(
        chatId,
        [
          '❌ *ZABBIX*',
          '',
          `Problem dengan Event ID *${eventid}* tidak ditemukan.`,
        ].join('\n')
      );

      return;
    }

    await sendMessage(
      chatId,
      formatProblemDetail(problem)
    );
  } catch (error) {
    console.error(
      `Zabbix problem detail error [${eventid}]:`,
      error
    );

    await sendMessage(
      chatId,
      [
        '❌ *ZABBIX*',
        '',
        'Gagal mengambil detail problem.',
      ].join('\n')
    );
  }
}

async function handleSearch(chatId, keyword) {
  try {
    const problems = await searchProblems(keyword);

    if (!problems.length) {
      await sendMessage(
        chatId,
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

    problems.forEach((problem, index) => {
      const priority = Number(problem.severity);

      const severityIcon = {
        0: '⚪',
        1: '🔵',
        2: '🟡',
        3: '🟠',
        4: '🔴',
        5: '🚨',
      };

      lines.push(
        `${index + 1}. ${severityIcon[priority] || '⚪'} *${problem.name}*`,
        `Event ID: ${problem.eventid}`,
        ''
      );
    });

    await sendMessage(chatId, lines.join('\n'));
  } catch (error) {
    console.error(
      `Zabbix search error [${keyword}]:`,
      error
    );

    await sendMessage(
      chatId,
      [
        '❌ *ZABBIX SEARCH*',
        '',
        'Gagal melakukan pencarian.',
      ].join('\n')
    );
  }
}