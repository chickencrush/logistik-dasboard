const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const code = fs.readFileSync(__dirname + '/Code.gs', 'utf8');

assert.match(html, /const API_ENDPOINTS = \[/);
assert.match(html, /function loadApiJsonp\(urlString, forceRefresh = false\)/);
assert.match(html, /function normalizeApiResponse/);
assert.match(html, /function validateDashboardPayload/);
assert.match(html, /API: OFFLINE/);
assert.doesNotMatch(html.match(/async function loadDashboard[\s\S]*?function renderDashboard/)[0], /await fetch\(/);
assert.ok(fs.existsSync(__dirname + '/manifest.json'));
assert.ok(fs.existsSync(__dirname + '/sw.js'));

let stored = null;
const spreadsheet = { getId: () => 'sheet-id', getName: () => 'Logistik' };
const context = {
  console,
  Date,
  JSON,
  Math,
  Utilities: { formatDate: () => '2026-09-20T00:00:00+07:00' },
  SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet, openById: id => ({ id }) },
  PropertiesService: { getScriptProperties: () => ({
    getProperty: () => stored,
    setProperty: (key, value) => { stored = value; }
  }) },
  CacheService: { getScriptCache: () => ({ remove: () => {}, get: () => null, put: () => {} }) },
  ContentService: { MimeType: {JSON:'json',JAVASCRIPT:'js'}, createTextOutput: value => ({setMimeType:()=>value}) }
};
vm.createContext(context);
vm.runInContext(code, context);
assert.match(context.setupApi(), /API siap/);
assert.equal(stored, 'sheet-id');
assert.equal(context.getSpreadsheet_().id, 'sheet-id');

console.log('PASS: JSONP utama, fallback, cache offline, PWA lengkap, setup Spreadsheet ID.');
