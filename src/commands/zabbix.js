import { sendReply } from '../api/evolution.js';
import { getProblems, searchProblems } from '../api/zabbix/problem.js';
import { getProblemDetail } from '../api/zabbix/problem-details.js';

import {
  formatProblems,
  formatProblemDetail,
} from '../formatters/zabbix.js';

export async function handleZabbix({ chatId, args, payload }) {
  const subcommand = args[0]?.toLowerCase();

    if (subcommand === 'search') {
  const keyword = args.slice(1).join(' ').trim();

  if (!keyword) {
    await sendReply(
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
      ].join('\n'),
      payload?.data
    );

    return;
  }

  await handleSearch(chatId, keyword, payload);
  return;
    }
    
  // !zabbix
  // !zabbix problems
  if (!subcommand || subcommand === 'problems') {
    await handleProblems(chatId, payload);
    return;
  }

  // !zabbix problem <eventid>
  if (subcommand === 'problem') {
    const eventid = args[1];

    if (!eventid) {
      await sendReply(
        chatId,
        [
          '📊 *ZABBIX*',
          '',
          'Format:',
          '`!zabbix problem <eventid>`',
          '',
          'Contoh:',
          '`!zabbix problem 1054973`',
        ].join('\n'),
        payload?.data
      );

      return;
    }

    await handleProblemDetail(chatId, eventid, payload);
    return;
  }

  await sendReply(
    chatId,
    [
      '📊 *ZABBIX*',
      '',
      '*Command tersedia:*',
      '',
      '• `!zabbix`',
      '• `!zabbix problems`',
      '• `!zabbix problem <eventid>`',
    ].join('\n'),
    payload?.data
  );
}

async function handleProblems(chatId, payload) {
  try {
    const problems = await getProblems({
      recent: true,
      limit: 10,
    });

    await sendReply(chatId, formatProblems(problems), payload?.data);
  } catch (error) {
    console.error('Zabbix problems error:', error);

    await sendReply(chatId, '❌ *ZABBIX*\n\nGagal mengambil daftar problem.', payload?.data);
  }
}

async function handleProblemDetail(chatId, eventid, payload) {
  try {
    const problem = await getProblemDetail(eventid);

    if (!problem) {
      await sendReply(
        chatId,
        [
          '❌ *ZABBIX*',
          '',
          `Problem dengan Event ID *${eventid}* tidak ditemukan.`,
        ].join('\n'),
        payload?.data
      );

      return;
    }

    await sendReply(chatId, formatProblemDetail(problem), payload?.data);
  } catch (error) {
    console.error(
      `Zabbix problem detail error [${eventid}]:`,
      error
    );

    await sendReply(
      chatId,
      [
        '❌ *ZABBIX*',
        '',
        'Gagal mengambil detail problem.',
      ].join('\n'),
      payload?.data
    );
  }
}

async function handleSearch(chatId, keyword, payload) {
  try {
    const problems = await searchProblems(keyword);


    if (!problems.length) {

      await sendReply(
        chatId,
        [
          '🔎 *ZABBIX SEARCH*',
          '',
          `Tidak ditemukan problem untuk: *${keyword}*`,
        ].join('\n'),
        payload?.data
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

    await sendReply(chatId, lines.join('\n'), payload?.data);
  } catch (error) {
    console.error(
      `Zabbix search error [${keyword}]:`,
      error
    );

    await sendReply(
      chatId,
      [
        '❌ *ZABBIX SEARCH*',
        '',
        'Gagal melakukan pencarian.',
      ].join('\n'),
      payload?.data
    );
  }
}