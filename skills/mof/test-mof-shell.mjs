import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const shell = await readFile(new URL('./mof-shell.html', import.meta.url), 'utf8');
const script = shell.match(/<script>([\s\S]*)<\/script>/)?.[1];
assert.ok(script, 'shell must contain a script');

const classList = () => {
  const set = new Set();
  return { add: name => set.add(name), remove: name => set.delete(name), contains: name => set.has(name), toggle(name, force) { const on = force === undefined ? !set.has(name) : Boolean(force); return on ? set.add(name) : set.delete(name); } };
};
const node = (extra = {}) => ({ listeners: {}, attributes: {}, hidden: false, dataset: {}, textContent: '', innerHTML: '', classList: classList(), setAttribute(name, value) { this.attributes[name] = value; }, getAttribute(name) { return this.attributes[name]; }, focus() { this.focused = true; }, closest: () => null, addEventListener(type, listener) { this.listeners[type] = listener; }, ...extra });

const row = (refs, text) => node({ dataset: { refs }, textContent: text, cells: [{ textContent: 'select' }, { textContent: refs }] });
// F_0011 exists to prove focus matching is token-exact, not a substring test.
const rows = [row('F_001', 'F_001 API approval'), row('F_002', 'F_002 billing'), row('F_0011', 'F_0011 decoy')];
const focusButton = node({ dataset: { focusId: 'F_001', focusLabel: 'API approval' } });
const focusCards = [node(), node(), node()];
const clearButtons = [node(), node(), node()];
const panels = ['A', 'B', 'C'].map(screen => node({ dataset: { screenPanel: screen } }));
const tabs = ['relationships', 'entities'].map(tab => node({ dataset: { tab } }));
const tabPanels = ['relationships', 'entities'].map(tab => node({ dataset: { tabPanel: tab } }));
const sortHeader = node();
const sortButton = node({ dataset: { sortColumn: '1' }, closest: () => sortHeader });
const search = node({ value: '' });
const label = node({ textContent: '' });
const results = node();
const table = { querySelector: selector => selector === 'tbody' ? { rows, appendChild(entry) { this.rows = this.rows.filter(item => item !== entry); this.rows.push(entry); } } : null };
const document = {
  querySelectorAll(selector) {
    if (selector === '[data-screen-panel]') return panels;
    if (selector === 'tbody tr') return rows;
    if (selector === '[data-clear]') return clearButtons;
    if (selector === '[data-focus-card]') return focusCards;
    if (selector === '[data-function-focus], [data-focus-type="function"]') return [focusButton];
    if (selector === '[data-sort-column]') return [sortButton];
    if (selector === '[data-tab]') return tabs;
    if (selector === '[data-drill]') return [];
    if (selector === '[data-tab-panel]') return tabPanels;
    return [];
  },
  querySelector(selector) { return selector === '#screen-a table.functions' ? table : null; },
  getElementById(id) { return id === 'global-search' ? search : id === 'screen-label' ? label : id === 'function-results' ? results : id === 'previous' || id === 'next' ? node() : null; },
};

vm.runInNewContext(script, { document, Map, Set });

assert.equal(label.textContent, 'A — Select context', 'report opens on screen A');

// Tab chips must carry the active state, not only the panels they control.
assert.equal(tabs[0].classList.contains('active'), true);
assert.equal(tabs[0].getAttribute('aria-selected'), 'true');
assert.equal(tabs[1].classList.contains('active'), false);
assert.equal(tabs[1].getAttribute('aria-selected'), 'false');
tabs[1].listeners.click();
assert.equal(tabs[1].classList.contains('active'), true);
assert.equal(tabs[0].classList.contains('active'), false);
tabs[1].listeners.keydown({ key: 'ArrowRight', preventDefault() {} });
assert.equal(tabs[0].classList.contains('active'), true, 'ArrowRight must wrap to the first tab');

focusButton.listeners.click({ preventDefault() {} });
assert.equal(rows[0].hidden, false);
assert.equal(rows[1].hidden, true);
assert.equal(rows[2].hidden, true, 'F_0011 must not match focus F_001');
// The selection control has to reflect its own state, visually and programmatically.
assert.equal(focusButton.classList.contains('selected'), true);
assert.equal(focusButton.getAttribute('aria-pressed'), 'true');
assert.equal(results.textContent, '1 of 3 Functions');

clearButtons[0].listeners.click();
assert.equal(rows[1].hidden, false);
assert.equal(focusButton.classList.contains('selected'), false);
assert.equal(focusButton.getAttribute('aria-pressed'), 'false');
assert.equal(results.textContent, '3 of 3 Functions');

search.value = 'billing';
search.listeners.input({ target: search });
assert.equal(results.textContent, '1 of 3 Functions');
assert.equal(label.textContent, 'C — Full context', 'activating a tab moves the report to screen C');

sortButton.listeners.click();
assert.equal(sortHeader.getAttribute('aria-sort'), 'ascending');
sortButton.listeners.click();
assert.equal(sortHeader.getAttribute('aria-sort'), 'descending');

assert.match(shell, /<html lang="en-US">/);
assert.match(shell, /data-function-focus/);
assert.match(shell, /data-sort-column/);
assert.match(shell, /\{\{DECISIONS\}\}/);
assert.match(script, /\[data-drill\]/, 'shell must still wire generated drilldown buttons');
assert.match(shell, /id="screen-a"/);
assert.match(shell, /id="screen-b"/);
assert.match(shell, /id="screen-c"/);
assert.match(shell, /ROWS_FUNCTIONS_CONTEXT/);
assert.match(shell, /id="global-search"/);
assert.match(shell, /id="focus-context"/);
assert.match(shell, /FOCUS|Focus|focus/);
assert.match(shell, /SRP/);
assert.match(shell, /OCP/);
assert.match(shell, /Target nature/);
assert.match(shell, /Consumed interfaces/);
assert.match(shell, /Impact rules/);
assert.doesNotMatch(shell, /<script[^>]+src=/i);
assert.doesNotMatch(shell, /https?:\/\//i);
assert.equal((shell.match(/<th\b/g) || []).length, (shell.match(/<th\b[^>]*scope="col"/g) || []).length);

// Screen A sort indexes must cover every sortable column without a gap or overshoot.
const functionsHead = shell.match(/<table class="functions">\s*<thead>[\s\S]*?<\/thead>/)[0];
assert.deepEqual(
  [...functionsHead.matchAll(/data-sort-column="(\d+)"/g)].map(match => Number(match[1])),
  [1, 2, 3, 4, 5, 6],
);
assert.equal((functionsHead.match(/<th\b/g) || []).length, 7);

// Every tab panel is a real tabpanel, labelled by the chip the generator emits for it.
const tabPanelNames = [...shell.matchAll(/data-tab-panel="([^"]+)"/g)].map(match => match[1]);
assert.deepEqual(tabPanelNames, ['domains', 'responsibilities', 'relationships', 'entities', 'events', 'workflows', 'impact', 'cross-cutting', 'questions']);
tabPanelNames.forEach(name => {
  // Without the tab-panel class the CSS never hides it, so the panel renders permanently.
  assert.match(shell, new RegExp(`class="section tab-panel"[^>]*data-tab-panel="${name}"`), `${name} needs the tab-panel class`);
  assert.match(shell, new RegExp(`data-tab-panel="${name}"[^>]*role="tabpanel"`), `${name} needs role=tabpanel`);
  assert.match(shell, new RegExp(`data-tab-panel="${name}"[^>]*aria-labelledby="tab-${name}"`), `${name} needs aria-labelledby`);
});

// The row-shape contract must describe exactly the tables the shell ships, with the same
// columns in the same order. This is what catches a marker documented with nowhere to go.
const contract = await readFile(new URL('./visualization.md', import.meta.url), 'utf8');
const documented = new Map([...contract.matchAll(/^\| `([a-z-]+)` \(`\{\{(\w+)\}\}`\) \| (\d+) \| (.+?) \|$/gm)]
  .map(([, table, marker, count, order]) => [table, { marker, count: Number(count), order: order.split(', ') }]));
const built = new Map([...shell.matchAll(/<table class="([a-z-]+)">\s*<thead>([\s\S]*?)<\/thead>/g)]
  .map(([, table, head]) => [table, [...head.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map(([, cell]) => cell.replace(/<[^>]+>/g, '').trim())]));

assert.deepEqual([...documented.keys()].sort(), [...built.keys()].sort(), 'every shell table needs a documented row shape, and vice versa');
documented.forEach(({ marker, count, order }, table) => {
  assert.deepEqual(built.get(table), order, `${table} column order drifted from the contract`);
  assert.equal(count, order.length, `${table} declares ${count} cells but lists ${order.length}`);
  assert.match(shell, new RegExp(`\\{\\{${marker}\\}\\}`), `${marker} is documented but absent from the shell`);
});

// The C-screen Functions table must live inside screen C, ahead of its footer.
const screenC = shell.slice(shell.indexOf('id="screen-c"'), shell.indexOf('</main>'));
assert.ok(screenC.includes('ROWS_FUNCTIONS_CONTEXT'), 'context Functions table must sit inside screen C');
assert.ok(screenC.indexOf('ROWS_FUNCTIONS_CONTEXT') < screenC.indexOf('{{FOOTER}}'), 'it must precede the footer');

// The shell must ship no sample content: every report value comes from the map.
['BILLING', 'WORKER', 'approval contract', 'invoice'].forEach(sample =>
  assert.doesNotMatch(shell, new RegExp(sample, 'i'), `shell must not ship sample copy (${sample})`));

// Printing hides the tab control, so every panel has to expand, and the legend prints once.
const print = shell.match(/@media print \{[^\n]*/)[0];
assert.match(print, /\.tab-panel \{ display:block !important; \}/, 'all tab panels must print');
assert.match(print, /#screen-a footer,#screen-b footer \{ display:none; \}/, 'legend must print once');

// Selection styling must not imitate a focus ring, and focus must stay distinguishable from hover.
assert.doesNotMatch(shell, /tr\.is-focused[^{]*\{[^}]*outline:/, 'row selection must not use an outline');
assert.match(shell, /:focus-visible[^{]*\{[^}]*outline:/, 'keyboard focus needs its own outline');

console.log('MoF workbench shell regressions: OK');
