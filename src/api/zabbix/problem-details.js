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