<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { split } from '#lib/kb/split';

  let { ticket }: { ticket: number } = $props();

  const s = $derived(split(reports as Report[], ticket, notes.oneDayMove));
  const names = {
    parser: 'Parser reads dates month first',
    hint: 'booking-v3 form hint says MM/DD/YYYY',
    oneDay: 'Date moves by one day',
  } as const;
</script>

<p>
  <strong>{s.unique}</strong> distinct reports ({s.rows} rows in the export; {s.rows - s.unique} came twice) ·
  <strong>{s.problems.length}</strong> problems
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>first → last seen</th></tr></thead>
  <tbody>
    {#each s.problems as p (p.key)}
      {@const days = p.reports.map((r) => r.receivedAt.slice(0, 10)).sort()}
      <tr>
        <td>{names[p.key]}</td>
        <td>{p.reports.length}</td>
        <td>{new Set(p.reports.map((r) => r.tenant)).size}</td>
        <td>{days[0]} → {days[days.length - 1]}</td>
      </tr>
    {/each}
  </tbody>
</table>
