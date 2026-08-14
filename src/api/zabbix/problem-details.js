import { getProblems } from './problem.js';
import { getTriggers } from './trigger.js';

export async function getProblemDetails(params = {}) {
  const problems = await getProblems(params);

  if (!problems.length) {
    return [];
  }

  const triggerIds = [
    ...new Set(
      problems
        .map((problem) => problem.objectid)
        .filter(Boolean)
    ),
  ];

  const triggers = await getTriggers({
    triggerids: triggerIds,
  });

  const triggerMap = new Map(
    triggers.map((trigger) => [trigger.triggerid, trigger])
  );

  return problems.map((problem) => ({
    ...problem,
    trigger: triggerMap.get(problem.objectid) || null,
  }));
}

export async function getProblemDetail(eventid) {
  if (!eventid) return null;

  const problems = await getProblems({
    eventids: [String(eventid)],
    limit: 1,
  });

  if (!problems.length) return null;

  const triggerId = problems[0].objectid;

  const triggers = await getTriggers({
    triggerids: triggerId ? [triggerId] : [],
  });

  const trigger = triggers?.[0] || null;

  return {
    ...problems[0],
    trigger,
  };
}