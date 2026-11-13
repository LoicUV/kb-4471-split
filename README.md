# kb-4471-split

What ticket #4471 ("dates parse mm/dd in eu locales", 412 reports) really holds: three problems, filed as issues #1 to #3, each with its report count.

- `kb/`: the support kb export, plus the new page `kb/src/routes/kb/incidents/4471-split/+page.svx` (signed; computed by `kb/src/lib/kb/split.ts` and `SplitCounts.svelte`).
- `page.html`: the page as the desk sees it, rendered by `render.mjs` (`node render.mjs`).
