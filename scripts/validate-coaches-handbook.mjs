import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const handbook = fs.readFileSync(path.join(root, 'coaches-handbook', 'index.html'), 'utf8');
const toolbox = fs.readFileSync(path.join(root, 'coaching-tools', 'Toolbox.dc.html'), 'utf8');
const catalogue = fs.readFileSync(path.join(root, 'shared', 'tool-catalogue.js'), 'utf8');
const support = fs.readFileSync(path.join(root, 'coaching-tools', 'support.js'), 'utf8');
const checks = [];
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  checks.push(message);
};

assert((toolbox.match(/class="tool-card"/g) || []).length === 31, 'toolbox has 31 tool cards');
assert((catalogue.match(/"href":/g) || []).length === 31, 'shared catalogue has 31 tool links');
assert(handbook.includes('2026-09-27-v19-inline-tools'), 'handbook has the V19 build marker');
assert(handbook.includes('assets/acsis-logo-white.png'), 'handbook uses the supplied visible white ACSIS logo');
assert(!handbook.includes('Private by design.'), 'requested privacy banner text is removed');
assert(handbook.includes("connect-src 'none'"), 'handbook blocks all data connections');
assert(!handbook.includes('fonts.googleapis.com'), 'handbook does not load Google Fonts');
assert(!handbook.includes('data:image/'), 'handbook images are self-hosted files');
assert(handbook.includes('Session completed and next session booked'), 'outcome list is present');
assert(handbook.includes('Client to book next session'), 'client booking outcome is present');
assert(handbook.includes('../shared/tool-catalogue.js'), 'handbook uses the shared toolbox catalogue');
assert(handbook.includes('<div class="legacy-tool-banks">'), 'original practical tools bank is visible');
assert((handbook.match(/data-practical-toggle=/g) || []).length === 1, 'practical bank is generated once from its 14-item data set');
assert(handbook.includes('class="active-tool-exercises"'), 'selected toolbox exercises have an inline output area');
assert(handbook.includes('embed=handbook'), 'toolbox exercises open inside the handbook');
assert(handbook.includes('<textarea name="outcomeNotes"'), 'outcome notes use an expanding textarea');
assert(handbook.includes('height:238mm!important'), 'embedded exercise PDF output fits one page');
assert(support.includes('zoom:.8!important'), 'embedded worksheet print scale is present');
assert(!toolbox.includes('https://unpkg.com/react'), 'toolbox runtime is self-hosted');
assert(toolbox.includes('Content-Security-Policy'), 'toolbox has a restrictive content security policy');
assert(fs.existsSync(path.join(root, 'coaching-tools', 'assets', 'vendor', 'react.production.min.js')), 'local React runtime exists');
assert(fs.existsSync(path.join(root, 'coaching-tools', 'assets', 'vendor', 'react-dom.production.min.js')), 'local React DOM runtime exists');

console.log(`Validation passed: ${checks.length} checks.`);
