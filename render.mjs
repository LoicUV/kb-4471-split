// Renders the new kb page as static HTML, with the same logic as src/lib/kb (causes.ts, split.ts, desk-ref.ts).
import fs from 'fs';
const L = 'kb/src/lib/';
const reports = JSON.parse(fs.readFileSync(L + 'data/reports-4471.json'));
const notes = JSON.parse(fs.readFileSync(L + 'data/desk-notes.json'));
const tenants = Object.fromEntries(fs.readdirSync(L + 'data/tenants').map((f) => { const t = JSON.parse(fs.readFileSync(L + 'data/tenants/' + f)); return [t.handle, t]; }));
const page = fs.readFileSync('kb/src/routes/kb/incidents/4471-split/+page.svx', 'utf8');
const signature = page.match(/^signature: (.+)$/m)[1].trim();
const HINT = { 'booking-v2': 'DD/MM/YYYY', 'booking-v3': 'MM/DD/YYYY' };
const dayFirst = (l) => { const o = new Intl.DateTimeFormat(l, { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(Date.UTC(2026, 0, 2, 12))).map((p) => p.type); return o.indexOf('day') < o.indexOf('month'); };
const causeOf = (r) => { const t = tenants[r.tenant]; if (!t || !dayFirst(t.locale)) return 'unplaced'; return r.channel === 'form' && HINT[t.form].startsWith('MM') ? 'hint' : 'parser'; };
const A = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const fnv = (t, seed) => { let h = seed >>> 0; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
const deskRef = (sig) => { const t = sig.trim(); let bits = (BigInt(fnv(t, 0x811c9dc5)) << 8n) | BigInt(fnv(t, 0x9e3779b9) & 0xff); let out = ''; for (let i = 0; i < 8; i++) { out = A[Number(bits & 31n)] + out; bits >>= 5n; } return `DR-${out.slice(0, 4)}-${out.slice(4)}`; };

const merged = reports.filter((r) => r.mergedInto === 4471);
const unique = [...new Map(merged.map((r) => [r.id, r])).values()];
const one = notes.oneDayMove;
const by = { parser: [], hint: [], oneDay: [] };
for (const r of unique) (one.includes(r.id) ? by.oneDay : by[causeOf(r)]).push(r);
const names = { parser: 'Parser reads dates month first', hint: 'booking-v3 form hint says MM/DD/YYYY', oneDay: 'Date moves by one day' };
const span = (rs) => { const d = rs.map((r) => r.receivedAt.slice(0, 10)).sort(); return `${d[0]} → ${d.at(-1)}`; };
const rows = Object.keys(by).map((k) => `<tr><td>${names[k]}</td><td>${by[k].length}</td><td>${new Set(by[k].map((r) => r.tenant)).size}</td><td>${span(by[k])}</td></tr>`).join('');
const groups = {};
for (const r of unique) (groups[causeOf(r)] ??= []).push(r);
const tags = (rs) => Object.entries(rs.reduce((n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t} ×${n}`).join(' · ');
const owner = 'parser';
const crows = Object.entries(groups).sort((a, b) => b[1].length - a[1].length).map(([c, rs]) => `<tr${c !== owner ? ' class="wrong"' : ''}><td><code>${c}</code></td><td>${rs.length}</td><td class="tags">${tags(rs)}</td><td>${new Set(rs.map((r) => r.tenant)).size}</td><td>${span(rs)}</td><td>${c === owner ? '#4471' : 'not this ticket — no ticket of its own'}</td></tr>`).join('');
const notesHtml = Object.entries(groups).map(([c, rs]) => { const n = rs.filter((r) => one.includes(r.id)).length; return n ? `<p class="note">${n} reports read as a one-day move; filed under <code>${c}</code> by tenant.</p>` : ''; }).join('');
const days = Math.floor((Date.now() - Date.parse('2026-11-13')) / 86400000);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>#4471 · three problems, not one · support kb</title>
<style>:root{--bg:#fbfaf7;--fg:#1d1d1b;--muted:#6b6a66;--line:#e3e0d8;--accent:#2f6f5e;--warn:#b4501f;--warn-bg:#fbeee6;--note-bg:#eef5f2;--mono:ui-monospace,Menlo,monospace}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,sans-serif}.kb{max-width:760px;margin:0 auto;padding:2rem 16px 4rem}
table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.92rem}th,td{border-bottom:1px solid var(--line);padding:.35rem .5rem;text-align:left}code{font-family:var(--mono);font-size:.88em}a{color:var(--accent)}
.crumb{font:.8rem var(--mono);text-decoration:none;color:var(--muted)}h1{margin:.25rem 0 .5rem;line-height:1.2}.meta{display:flex;flex-wrap:wrap;gap:.5rem 1rem;color:var(--muted);font-size:.85rem;margin:0}.status{border:1px solid var(--line);border-radius:99px;padding:0 .6rem}
.callout{background:var(--note-bg);padding:.6rem 1rem;border-radius:6px}.tags,.note{color:var(--muted);font-size:.85em}.wrong td{background:var(--warn-bg)}.wrong td:last-child{color:var(--warn);font-weight:600}
.stamp{margin:2rem 0 0;font:.85rem var(--mono);color:var(--muted)}.stamp b{color:var(--accent);letter-spacing:.04em}footer{margin-top:3rem;color:var(--muted);font-size:.8rem;border-top:1px solid var(--line);padding-top:1rem}</style></head><body><div class="kb">
<header><a class="crumb" href="#">support desk · kb</a><h1>#4471 · three problems, not one</h1><p class="meta"><span>owner <b>LoicUV</b></span><span class="status">open</span><span>reviewed 2026-11-13</span></p></header><main>
<p><a href="#">#4471</a> merged every report about a wrong date into one ticket and marked it <strong>known: one issue, one fix queued</strong>. The reports do not all describe the same bug. The fix that is queued repairs one of them. Reports about the other two are still coming in.</p>
<p class="callout">Merging was decision <a href="#">0001</a>: same subject, same issue. The subjects are generic ("Date is wrong"), so they say nothing about the cause. The cause is in the tenant: its locale and its booking form (<code>causes.ts</code>).</p>
<h2>What #4471 holds</h2>
<p><strong>${unique.length}</strong> distinct reports (${merged.length} rows in the export; ${merged.length - unique.length} came twice) · <strong>3</strong> problems</p>
<table><thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>first → last seen</th></tr></thead><tbody>${rows}</tbody></table>
<ol><li><strong>The parser reads dates month first.</strong> Day-first tenants get flipped dates. This is the bug the queued fix is for.</li>
<li><strong>The booking-v3 form tells day-first tenants to type <code>MM/DD/YYYY</code>.</strong> Their people do as the hint says and the form reads it their way. The shared parser is not at fault, so the queued fix does not help. Form channel only; tenants on booking-v3 only.</li>
<li><strong>A date moves by exactly one day.</strong> It is not a month/day swap. The reports mention Lisbon and Toronto getting different days, one month only (June) and an invite that arrived before the booking: this looks like a timezone or DST bug. The desk already read these as "one-day moves" (<code>desk-notes.json</code>), but the cause table files them under the parser by tenant.</li></ol>
<p>Each problem gets its own ticket in the repo, with its report count: <a href="https://github.com/LoicUV/kb-4471-split/issues/1">problem 1</a>, <a href="https://github.com/LoicUV/kb-4471-split/issues/2">problem 2</a>, <a href="https://github.com/LoicUV/kb-4471-split/issues/3">problem 3</a>.</p>
<h2>Intake guessed wrong, often</h2>
<p><code>meta.intakeTag</code> is a guess from the reporter's browser. The tag disagrees with the real cause for a share of the reports, so do not count by tag.</p>
<p><strong>${unique.length}</strong> reports merged into #4471 · <strong>${Object.keys(groups).length}</strong> causes</p>
<table><thead><tr><th>cause</th><th>reports</th><th>tagged as</th><th>tenants</th><th>seen</th><th></th></tr></thead><tbody>${crows}</tbody></table>${notesHtml}
<h2>Lessons</h2><ul><li>Merging by subject counts the symptom. Two reports with one subject can have two causes.</li><li>A count that has to be right comes from the data, after you drop duplicate ids.</li></ul>
<p class="stamp">desk ref <b>${deskRef(signature)}</b></p></main>
<footer>Pages are written by people. Tables and charts are built from data at render time.</footer></div></body></html>`;
fs.writeFileSync('page.html', html);
console.log(deskRef(signature), Object.fromEntries(Object.entries(by).map(([k, v]) => [k, v.length])), Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length])));
