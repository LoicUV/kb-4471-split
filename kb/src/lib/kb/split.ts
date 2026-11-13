// What #4471 really holds. Counts are computed from the export, never typed in a page.
import { groupByCause, uniqueById, type Cause, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

export type Problem = { key: 'parser' | 'hint' | 'oneDay'; reports: Report[] };

// `oneDayIds` = desk-notes.json `oneDayMove`: reports that describe a one-day shift, not a month/day swap.
export function split(all: Report[], ticket: number, oneDayIds: readonly string[]): { rows: number; unique: number; problems: Problem[] } {
  const merged = all.filter((r) => r.mergedInto === ticket);
  const unique = uniqueById(merged);
  const groups = groupByCause(unique, tenantOf);
  const of = (c: Cause) => groups.find((g) => g.cause === c)?.reports ?? [];
  const oneDay = unique.filter((r) => oneDayIds.includes(r.id));
  return {
    rows: merged.length,
    unique: unique.length,
    problems: [
      { key: 'parser', reports: of('parser').filter((r) => !oneDayIds.includes(r.id)) },
      { key: 'hint', reports: of('hint').filter((r) => !oneDayIds.includes(r.id)) },
      { key: 'oneDay', reports: oneDay },
    ],
  };
}
