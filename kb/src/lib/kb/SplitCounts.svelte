<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { split } from '#lib/kb/split';

  let { ticket }: { ticket: number } = $props();

  const s = $derived(split(reports as Report[], ticket, notes.oneDayMove));
  const names: Record<string, string> = {
    parser: 'Parser reads dates month first',
    hint: 'booking-v3 form hint says MM/DD/YYYY',
  };
</script>

<p>
  <strong>{s.unique}</strong> distinct reports ({s.rows} rows in the export; {s.rows - s.unique} came twice) ·
  <strong>{s.groups.length}</strong> problems
</p>

<table>
  <thead><tr><th>problem</th><th>cause</th><th>reports</th><th>tenants</th><th>first → last seen</th></tr></thead>
  <tbody>
    {#each s.groups as g (g.cause)}
      <tr>
        <td>{names[g.cause] ?? g.cause}</td>
        <td><code>{g.cause}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each s.oneDay as o (o.cause)}
  {#if o.n}<p class="note">{o.n} of the <code>{o.cause}</code> reports read as a one-day move, not a swap (desk-notes.json).</p>{/if}
{/each}
