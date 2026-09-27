import fs from 'node:fs';
import { chromium } from '/Users/matt/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const baseUrl = process.env.ACSIS_TEST_BASE_URL || 'http://127.0.0.1:8765';
const pdfDir = '/tmp/pdfs';
fs.mkdirSync(pdfDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-sandbox', '--disable-gpu']
});

const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
const externalRequests = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(error.message));
page.on('request', (request) => {
  const url = new URL(request.url());
  if (!['127.0.0.1', 'localhost'].includes(url.hostname)) externalRequests.push(request.url());
});

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

await page.goto(`${baseUrl}/coaches-handbook/?embed=1`, { waitUntil: 'networkidle' });
assert(await page.getByText('Private by design.').isVisible(), 'privacy notice is not visible');
await page.getByRole('button', { name: /Session Output/ }).click();
assert(await page.locator('#sharedToolCatalogue .shared-tool-card').count() === 31, 'handbook does not show 31 shared tools');
assert(!(await page.locator('.legacy-tool-banks').isVisible()), 'legacy tool banks are visible');

const longAction = 'Contact the client, confirm the agreed next step, gather the supporting information, arrange a suitable review date and record the outcome in a clear factual note without losing any of this longer action text.';
await page.locator('input[name="client"]').fill('Local browser test');
await page.locator('textarea[name="focus"]').fill('Confirm local-only autosave and PDF wrapping.');
await page.locator('select[name="outcome"]').selectOption({ label: 'Client to book next session' });
await page.locator('input[name="action0"]').fill(longAction);
await page.locator('select[name="owner0"]').selectOption({ label: 'Client' });
await page.waitForTimeout(700);

const stored = await page.evaluate(() => localStorage.getItem('acsis-coaches-handbook-v17-browser-only'));
if (!stored) {
  const diagnosis = await page.evaluate(() => {
    try {
      return { collectType: typeof collect, payload: JSON.stringify(collect()).slice(0, 200), keys: Object.keys(localStorage) };
    } catch (error) {
      return { collectType: typeof collect, error: String(error), stack: error.stack };
    }
  });
  throw new Error(`handbook autosave did not write to local browser storage: ${JSON.stringify(diagnosis)}; browser errors: ${errors.join(' | ')}`);
}
assert(stored.includes('Local browser test'), 'handbook autosave did not write the client value');
await page.reload({ waitUntil: 'networkidle' });
assert(await page.locator('input[name="client"]').inputValue() === 'Local browser test', 'handbook did not restore the client field');
assert(await page.locator('select[name="outcome"]').inputValue() === 'Client to book next session', 'handbook did not restore the outcome');
assert(await page.locator('input[name="action0"]').inputValue() === longAction, 'handbook did not restore the long action');

await page.emulateMedia({ media: 'print' });
await page.evaluate(() => {
  document.querySelectorAll('.panel').forEach((panel) => panel.classList.remove('print-me', 'print-all'));
  document.getElementById('output').classList.add('print-me');
  window.dispatchEvent(new Event('beforeprint'));
});
await page.pdf({
  path: `${pdfDir}/acsis-handbook-output.pdf`,
  format: 'A4',
  printBackground: true,
  margin: { top: '15mm', right: '13mm', bottom: '15mm', left: '13mm' }
});
await page.emulateMedia({ media: 'screen' });

for (const width of [390, 768, 1280]) {
  await page.setViewportSize({ width, height: 900 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `handbook overflows horizontally at ${width}px by ${overflow}px`);
}

await page.evaluate(() => localStorage.removeItem('acsis-coaches-handbook-v17-browser-only'));

const toolboxPage = await context.newPage();
toolboxPage.on('console', (message) => {
  if (message.type() === 'error') errors.push(`Toolbox: ${message.text()}`);
});
toolboxPage.on('pageerror', (error) => errors.push(`Toolbox: ${error.message}`));
toolboxPage.on('request', (request) => {
  const url = new URL(request.url());
  if (!['127.0.0.1', 'localhost'].includes(url.hostname)) externalRequests.push(request.url());
});
await toolboxPage.goto(`${baseUrl}/coaching-tools/Toolbox.dc.html`, { waitUntil: 'networkidle' });
assert(await toolboxPage.locator('.tool-card').count() === 31, 'standalone toolbox does not show 31 tools');
for (const width of [390, 1280]) {
  await toolboxPage.setViewportSize({ width, height: 900 });
  const overflow = await toolboxPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `toolbox overflows horizontally at ${width}px by ${overflow}px`);
}

await toolboxPage.goto(`${baseUrl}/coaching-tools/tools/OSCAR.dc.html`, { waitUntil: 'networkidle' });
await toolboxPage.locator('textarea').first().fill('Local worksheet test');
await toolboxPage.waitForTimeout(250);
const toolStored = await toolboxPage.evaluate(() => localStorage.getItem('acsis-oscar'));
assert(toolStored && toolStored.includes('Local worksheet test'), 'worksheet did not save to local browser storage');
await toolboxPage.reload({ waitUntil: 'networkidle' });
assert(await toolboxPage.locator('textarea').first().inputValue() === 'Local worksheet test', 'worksheet did not restore its saved answer');
await toolboxPage.evaluate(() => localStorage.removeItem('acsis-oscar'));

assert(externalRequests.length === 0, `unexpected external requests: ${externalRequests.join(', ')}`);
assert(errors.length === 0, `browser errors: ${errors.join(' | ')}`);

console.log(JSON.stringify({
  handbookTools: 31,
  standaloneTools: 31,
  autosave: 'passed',
  worksheetLocalSave: 'passed',
  responsiveWidths: [390, 768, 1280],
  externalRequests,
  errors,
  pdf: `${pdfDir}/acsis-handbook-output.pdf`
}, null, 2));

await browser.close();
