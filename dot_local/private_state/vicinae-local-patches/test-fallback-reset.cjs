// Regression model for Vicinae 0.29.2's delayed initial fallback notification.
// Executes the installed command with mocked hooks/results, and models the host's
// m_shouldResetSelection flag. This is not an end-to-end GUI test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const installed = path.join(process.env.HOME, '.local/share/vicinae/extensions/store.vicinae.fff-search/search-files.js');

function run(source, fallbackText) {
  let states = [], cursor = 0, changed = false;
  let items = [], current, reset = false, selection = 0;
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], value => {
        if (!Object.is(states[index], value)) { states[index] = value; changed = true; }
      }];
    },
    useRef(initial) {
      const index = cursor++;
      return states[index] ??= { current: initial };
    },
  };
  const api = { Color: {}, Icon: {}, List: Object.assign(function List() {}, { Item: {}, Section: {}, EmptyView: {} }) };
  const jsx = (type, props) => ({ type, props });
  const context = vm.createContext({
    module: { exports: {} }, process, console, Buffer, setTimeout, clearTimeout,
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === '@vicinae/api') return api;
      return require(name);
    },
    results: () => ({ items, isLoading: !items.length, error: null, hasMore: false, loadMore() {} }),
  });
  vm.runInContext(source + '\nT=()=>({showPreview:true}); Se=results;', context);
  const command = context.module.exports.default;
  function render() {
    cursor = 0; changed = false;
    current = command({ fallbackText }).props;
    if (reset && items.length) selection = 0;
    reset = false;
  }
  function notifyInitialSearch() {
    reset = true; // Native handleDebouncedSearch sets this even for unchanged text.
    current.onSearchTextChange(fallbackText);
    if (changed) render();
  }
  render();
  // A non-throttled callback runs before the asynchronous first results arrive.
  if (fallbackText && !current.throttle) notifyInitialSearch();
  items = [{ path: '/one', name: 'one' }, { path: '/two', name: 'two' }];
  render();
  // A throttled callback can run after the first results are already displayed.
  if (fallbackText && current.throttle) notifyInitialSearch();
  selection = 1;
  current.onSelectionChange('/two');
  if (changed) render(); // Updating the active preview dirties the list model.
  return { selection, throttle: current.throttle };
}

const after = fs.readFileSync(installed, 'utf8');
// Recreate the old behavior in memory; do not depend on an untracked backup.
const patched = 'searchBarPlaceholder:"Search files and folders\\u2026",throttle:!e.fallbackText';
assert.equal(after.split(patched).length, 2, 'expected exactly one patched Search Files list');
const before = after.replace(patched, 'searchBarPlaceholder:"Search files and folders\\u2026",throttle:!0');
assert.equal(run(before, 'csharp').selection, 0, 'baseline reproduces first Down resetting to top');
assert.equal(run(after, 'csharp').selection, 1, 'fallback first Down stays on second file');
assert.equal(run(after, '').selection, 1, 'direct launch still navigates normally');
assert.equal(run(after, '').throttle, true, 'direct launch retains search throttling');
assert.equal(run(after, 'csharp').throttle, false, 'fallback launch avoids delayed initial notification');
console.log('PASS: baseline reset reproduced; patched fallback keeps second item; direct launch unchanged.');
