import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const shell = await readFile(new URL('./mof-shell.html', import.meta.url), 'utf8');
const script = shell.match(/<script>([\s\S]*)<\/script>/)?.[1];

assert.ok(script, 'shell must contain a script');

const makeRow = (cells, text, dataset = {}) => ({
  cells: cells.map(textContent => ({ textContent })),
  dataset,
  hidden: false,
  textContent: text,
  querySelectorAll: () => [],
});

const makeBar = filters => ({
  buttons: filters.map(filter => ({ dataset: { filter }, setAttribute() {} })),
  listeners: {},
  addEventListener(type, listener) { this.listeners[type] = listener; },
  appendChild(button) { this.buttons.push(button); },
  querySelectorAll() { return this.buttons; },
});

const relationshipRows = [
  makeRow(['CORE', 'RESP_001', 'reads_from', 'API', '', '', '', 'critical'], 'alpha'),
  makeRow(['CORE', 'RESP_002', 'calls', 'API', '', '', '', 'critical'], 'beta read in detail'),
];
const functionRows = [
  makeRow(['CORE', 'F_001', 'src/a.ts', 'RESP_001', 'ok', 'low'], '', { codeRef: 'src/a.ts:find' }),
  makeRow(['CORE', 'F_002', 'src/a.ts', 'RESP_002', 'ok', 'low'], '', { codeRef: 'src/a.ts:save' }),
  makeRow(['CORE', 'F_003', 'src/b.ts', 'RESP_003', 'ok', 'low'], '', { codeRef: 'src/b.ts:read' }),
];
const impactRows = [
  makeRow(['IR_001', 'CORE', 'RESP_001', 'behavioral', 'high', '', ''], ''),
  makeRow(['IR_002', 'CORE', 'RESP_002', 'behavioral', 'low', '', ''], ''),
];
const relationshipBar = makeBar(['all', 'cross-domain', 'critical', 'direct', 'indirect', 'reads', 'writes']);
const functionBar = makeBar(['all', 'high-risk', 'srp', 'repeated-file']);
const impactBar = makeBar(['all', 'high', 'medium', 'low', 'breaking', 'behavioral']);
const input = { value: '', listeners: {}, addEventListener(type, listener) { this.listeners[type] = listener; } };
const results = { textContent: '' };
const functionResults = { textContent: '' };
const impactResults = { textContent: '' };
const relationshipTable = { querySelectorAll: selector => selector === 'tbody tr' ? relationshipRows : [] };
const functionTable = { querySelectorAll: selector => selector === 'tbody tr' ? functionRows : [] };
const impactTable = { querySelectorAll: selector => selector === 'tbody tr' ? impactRows : [] };
const document = {
  createElement: () => ({ dataset: {}, setAttribute() {} }),
  getElementById(id) {
    return id === 'relationships' ? relationshipTable : id === 'relationship-filters' ? relationshipBar : id === 'relationship-search' ? input : id === 'relationship-results' ? results : id === 'functions' ? functionTable : id === 'function-filters' ? functionBar : id === 'function-results' ? functionResults : id === 'impact' ? impactTable : id === 'impact-filters' ? impactBar : id === 'impact-results' ? impactResults : null;
  },
};

vm.runInNewContext(script, { clearTimeout() {}, document, Map, Set, setTimeout: callback => callback() });

input.value = 'alpha';
input.listeners.input();
assert.deepEqual(relationshipRows.map(row => row.hidden), [false, true]);
relationshipBar.listeners.click({ target: { closest: () => relationshipBar.buttons[2] } });
assert.deepEqual(relationshipRows.map(row => row.hidden), [false, true]);
input.value = '';
input.listeners.input();
relationshipBar.listeners.click({ target: { closest: () => relationshipBar.buttons[5] } });
assert.deepEqual(relationshipRows.map(row => row.hidden), [false, true]);
assert.equal(results.textContent, '1 relacionamento encontrado.');

functionBar.listeners.click({ target: { closest: () => functionBar.buttons[3] } });
assert.deepEqual(functionRows.map(row => row.hidden), [false, false, true]);
assert.equal(functionResults.textContent, '2 funções encontradas.');

impactBar.listeners.click({ target: { closest: () => impactBar.buttons[1] } });
assert.deepEqual(impactRows.map(row => row.hidden), [false, true]);
assert.equal(impactResults.textContent, '1 regra de impacto encontrada.');
assert.ok([...shell.matchAll(/<th\b[^>]*>/g)].every(match => /scope="col"/.test(match[0])));
assert.match(shell, /id="relationship-results"[^>]*aria-live="polite"/);
assert.match(shell, /id="function-results"[^>]*aria-live="polite"/);
assert.match(shell, /id="impact-results"[^>]*aria-live="polite"/);
assert.match(shell, /border-radius:999px/);

console.log('MoF shell regressions: OK');
