// What #4471 really holds, counted the way the desk counts (CauseTable): by cause, one id one report.
import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

export function split(all: Report[], ticket: number, oneDayIds: readonly string[]) {
  const merged = all.filter((r) => r.mergedInto === ticket);
  const unique = uniqueById(merged);
  const groups = groupByCause(unique, tenantOf);
  // One-day moves stay where the desk files them (by tenant); they are footnoted, not a third count.
  return { rows: merged.length, unique: unique.length, groups, oneDay: groups.map((g) => ({ cause: g.cause, n: readAs(g, oneDayIds) })) };
}
