import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const shell = await readFile(new URL('./mof-shell.html', import.meta.url), 'utf8');
const script = shell.match(/<script>([\s\S]*)<\/script>/)?.[1];
assert.ok(script, 'shell must contain a script');

const node = (extra = {}) => ({ listeners: {}, hidden: false, dataset: {}, textContent: '', innerHTML: '', classList: { toggle() {}, add() {}, remove() {} }, addEventListener(type, listener) { this.listeners[type] = listener; }, ...extra });
const rows = [node({ dataset: { refs: 'F_001' }, textContent: 'F_001 API approval' }), node({ dataset: { refs: 'F_002' }, textContent: 'F_002 billing' })];
const focusButton = node({ dataset: { focusId: 'F_001', focusLabel: 'API approval' } });
const focusCards = [node(), node(), node()];
const clearButtons = [node(), node(), node()];
const panels = ['A', 'B', 'C'].map(screen => node({ dataset: { screenPanel: screen }, classList: { toggle() {} } }));
const tabs = ['relationships', 'entities'].map(tab => node({ dataset: { tab }, classList: { toggle() {} } }));
const tabPanels = ['relationships', 'entities'].map(tab => node({ dataset: { tabPanel: tab }, classList: { toggle() {} } }));
const sortButton = node({ dataset: { sortColumn: '1' } });
const search = node({ value: '' });
const label = node({ textContent: '' });
const table = { querySelector: selector => selector === 'tbody' ? { rows, appendChild(row) { this.rows = this.rows.filter(item => item !== row); this.rows.push(row); } } : null };
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
  getElementById(id) { return id === 'global-search' ? search : id === 'screen-label' ? label : id === 'previous' || id === 'next' ? node() : null; },
};

vm.runInNewContext(script, { document, Map, Set });

focusButton.listeners.click({ preventDefault() {} });
assert.equal(rows[0].hidden, false);
assert.equal(rows[1].hidden, true);
clearButtons[0].listeners.click();
assert.equal(rows[1].hidden, false);
search.value = 'billing';
search.listeners.input({ target: search });
assert.equal(label.textContent, 'A — Select context');

assert.match(shell, /<html lang="en-US">/);
assert.match(shell, /data-function-focus/);
assert.match(shell, /data-sort-column/);
assert.match(shell, /data-drill/);
assert.match(shell, /id="screen-a"/);
assert.match(shell, /id="screen-b"/);
assert.match(shell, /id="screen-c"/);
assert.match(shell, /ROWS_FUNCTIONS_CONTEXT/);
assert.match(shell, /id="global-search"/);
assert.match(shell, /id="focus-context"/);
assert.match(shell, /FOCUS|Focus|focus/);
assert.match(shell, /SRP/);
assert.match(shell, /Impact rules/);
assert.doesNotMatch(shell, /<script[^>]+src=/i);
assert.doesNotMatch(shell, /https?:\/\//i);
assert.equal((shell.match(/<th\b/g) || []).length, (shell.match(/<th\b[^>]*scope="col"/g) || []).length);

console.log('MoF workbench shell regressions: OK');
