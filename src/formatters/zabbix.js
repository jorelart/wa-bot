const severity = {
  0: 'Not classified',
  1: 'Information',
  2: 'Warning',
  3: 'Average',
  4: 'High',
  5: 'Disaster',
};

const severityIcon = {
  0: '⚪',
  1: '🔵',
  2: '🟡',
  3: '🟠',
  4: '🔴',
  5: '🚨',
};

function getTag(tags, name) {
  return tags?.find((tag) => tag.tag === name)?.value;
}

function getTags(tags, name) {
  return (
    tags
      ?.filter((tag) => tag.tag === name)
      .map((tag) => tag.value) || []
  );
}

function formatDuration(clock) {
  const seconds = Math.max(
    0,
    Math.floor(Date.now() / 1000) - Number(clock)
  );

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatHost(trigger) {
  const host = trigger?.hosts?.[0];

  if (!host) {
    return null;
  }

  return host.name || host.host;
}

export function formatProblem(problem, index) {
  const priority = Number(problem.severity);

  const host = formatHost(problem.trigger);

  const interfaceName = getTag(problem.tags, 'interface');
  const peerAddress = getTag(problem.tags, 'address');
  const asNumber = getTag(problem.tags, 'as');
  const description = getTag(problem.tags, 'description');

  const acknowledged =
    problem.acknowledged === '1'
      ? '✅ ACK'
      : '⚠️ UNACK';

  const lines = [
    `${index + 1}. ${severityIcon[priority] || '⚪'} *${severity[priority] || 'Unknown'}*`,
  ];

  if (host) {
    lines.push(`Host: ${host}`);
  }

  lines.push(problem.name);

  if (interfaceName) {
    lines.push(`Interface: ${interfaceName}`);
  }

  if (peerAddress) {
    lines.push(`Peer: ${peerAddress}`);
  }

  if (asNumber) {
    lines.push(`AS: ${asNumber}`);
  }

  if (description) {
    lines.push(`Description: ${description}`);
  }

  lines.push(
    `Duration: ${formatDuration(problem.clock)}`,
    `Status: ${acknowledged}`,
    `Event ID: ${problem.eventid}`,
    ''
  );

  return lines.join('\n');
}

export function formatProblems(problems) {
  if (!problems.length) {
    return '✅ *ZABBIX*\n\nTidak ada problem aktif.';
  }

  const lines = [
    '🚨 *ZABBIX PROBLEMS*',
    `Active: ${problems.length}`,
    '',
  ];

  problems.forEach((problem, index) => {
    lines.push(formatProblem(problem, index));
  });

  return lines.join('\n').trim();
}