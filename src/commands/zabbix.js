import { sendMessage } from '../evolution/client.js';
import { getProblemDetails } from '../api/zabbix/problem-details.js';
import { formatProblems } from '../formatters/zabbix.js';

export async function handleZabbix({ chatId, args }) {
  const subcommand = args[0]?.toLowerCase();

  if (!subcommand || subcommand === 'problems') {
    await handleProblems(chatId);
    return;
  }

  await sendMessage(
    chatId,
    [
      '📊 *ZABBIX*',
      '',
      '*Command tersedia:*',
      '',
      '• !zabbix',
      '• !zabbix problems',
    ].join('\n')
  );
}

async function handleProblems(chatId) {
  const problems = await getProblemDetails({
    recent: true,
    limit: 10,
  });

  await sendMessage(
    chatId,
    formatProblems(problems)
  );
}