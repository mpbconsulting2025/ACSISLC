import fs from 'node:fs';
import { chromium } from '/Users/matt/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { getDocument } from '/Users/matt/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pdfjs-dist/legacy/build/pdf.mjs';

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
  const text = message.text();
  const rawTemplateSvgWarning = /Expected (?:length|number), "\{\{/.test(text);
  if (message.type() === 'error' && !rawTemplateSvgWarning) errors.push(text);
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
assert(await page.getByText('Private by design.').count() === 0, 'removed privacy notice is still present');
await page.getByRole('button', { name: /Session Output/ }).click();
assert(await page.locator('#sharedToolCatalogue .shared-tool-card').count() === 31, 'handbook does not show 31 shared tools');
assert(await page.locator('.legacy-tool-banks').isVisible(), 'original practical tools bank is not visible');
assert(await page.locator('[data-practical-toggle]').count() === 14, 'original practical tools bank does not contain 14 tools');
assert(!(await page.locator('.legacy-models').first().isVisible()), 'retired legacy model bank is visible');

const longAction = 'Contact the client, confirm the agreed next step, gather the supporting information, arrange a suitable review date and record the outcome in a clear factual note without losing any of this longer action text.';
await page.locator('input[name="client"]').fill('Local browser test');
await page.locator('textarea[name="focus"]').fill('Confirm local-only autosave and PDF wrapping.');
await page.locator('select[name="outcome"]').selectOption({ label: 'Client to book next session' });
await page.locator('textarea[name="outcomeNotes"]').fill('A longer outcome note that needs to grow onto another line without clipping.\nThe coach can continue adding relevant detail here.');
await page.locator('input[name="action0"]').fill(longAction);
await page.locator('select[name="owner0"]').selectOption({ label: 'Client' });
await page.locator('[data-practical-toggle="eisenhower"]').check();
await page.locator('textarea[name="eisenhowerDo"]').fill('Complete the agreed urgent action with the client.');
await page.getByRole('button', { name: /^WOOP / }).click();
const embeddedTool = page.locator('.embedded-tool-card[data-tool-id="tools/WOOP.dc.html"] iframe');
await embeddedTool.waitFor({ state: 'visible' });
const woopFrame = page.frames().find((frame) => frame.url().includes('/coaching-tools/tools/WOOP.dc.html'));
assert(woopFrame, 'WOOP did not open inside the handbook');
await woopFrame.getByLabel('Wish').fill('Build a repeatable weekly wellbeing routine.');
await page.getByRole('button', { name: /^Wheel of Life / }).click();
await page.locator('.embedded-tool-card[data-tool-id="tools/Wheel%20of%20Life.dc.html"] iframe').waitFor({ state: 'visible' });
const wheelFrame = page.frames().find((frame) => frame.url().includes('/coaching-tools/tools/Wheel%20of%20Life.dc.html'));
assert(wheelFrame, 'Wheel of Life did not open inside the handbook');
const wheelEndMarker = 'Complete final Wheel of Life response that must remain visible at the bottom of the PDF.';
await wheelFrame.getByLabel('Small change to raise satisfaction').fill(wheelEndMarker);
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
assert((await page.locator('textarea[name="outcomeNotes"]').inputValue()).includes('another line'), 'handbook did not restore the outcome notes');
assert(await page.locator('input[name="action0"]').inputValue() === longAction, 'handbook did not restore the long action');
assert(await page.locator('.embedded-tool-card[data-tool-id="tools/WOOP.dc.html"]').count() === 1, 'handbook did not restore the selected toolbox exercise');
assert(await page.locator('.embedded-tool-card[data-tool-id="tools/Wheel%20of%20Life.dc.html"]').count() === 1, 'handbook did not restore the selected multi-page exercise');
const restoredWoopFrame = page.frames().find((frame) => frame.url().includes('/coaching-tools/tools/WOOP.dc.html'));
assert(restoredWoopFrame && (await restoredWoopFrame.getByLabel('Wish').inputValue()).includes('weekly wellbeing'), 'embedded worksheet did not restore its answer');
const restoredWheelFrame = page.frames().find((frame) => frame.url().includes('/coaching-tools/tools/Wheel%20of%20Life.dc.html'));
assert(restoredWheelFrame && (await restoredWheelFrame.getByLabel('Small change to raise satisfaction').inputValue()) === wheelEndMarker, 'multi-page worksheet did not restore its final answer');

await page.evaluate(async () => {
  document.querySelectorAll('.panel').forEach((panel) => panel.classList.remove('print-me', 'print-all'));
  document.getElementById('output').classList.add('print-me');
  await prepareEmbeddedToolPrintPages();
});
await page.emulateMedia({ media: 'print' });
await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
await page.pdf({
  path: `${pdfDir}/acsis-handbook-output.pdf`,
  format: 'A4',
  printBackground: false,
  displayHeaderFooter: false,
  margin: { top: '15mm', right: '13mm', bottom: '15mm', left: '13mm' }
});
const pdf = await getDocument({ data: new Uint8Array(fs.readFileSync(`${pdfDir}/acsis-handbook-output.pdf`)), disableWorker: true }).promise;
assert(pdf.numPages >= 5, `session output PDF should contain at least 5 pages including the two-page Wheel of Life, found ${pdf.numPages}`);
const pdfPageTexts = [];
for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
  const text = (await (await pdf.getPage(pageNumber)).getTextContent()).items.map((item) => item.str).join(' ');
  pdfPageTexts.push(text);
}
const finalPageText = pdfPageTexts.at(-1);
const completePdfText = pdfPageTexts.join(' ');
assert(completePdfText.includes('WOOP') && completePdfText.includes('weekly wellbeing'), 'selected WOOP worksheet content is missing from the PDF');
assert(finalPageText.includes(wheelEndMarker), 'the bottom of the multi-page Wheel of Life worksheet is missing from the final PDF page');
assert(!/https?:\/\//i.test(completePdfText), 'browser page URL is present in the handbook PDF');
assert(!/www\.acsis\.co\.uk/i.test(completePdfText), 'ACSIS website URL is present in the handbook PDF');
await page.emulateMedia({ media: 'screen' });

for (const width of [390, 768, 1280]) {
  await page.setViewportSize({ width, height: 900 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(overflow <= 1, `handbook overflows horizontally at ${width}px by ${overflow}px`);
}

await page.evaluate(() => localStorage.removeItem('acsis-coaches-handbook-v17-browser-only'));
await page.evaluate(() => localStorage.removeItem('acsis-woop'));
await page.evaluate(() => localStorage.removeItem('acsis-wheel-of-life-v5'));

const embedPage = await context.newPage();
embedPage.on('console', (message) => {
  if (message.type() === 'error') errors.push(`Wix embed: ${message.text()}`);
});
embedPage.on('pageerror', (error) => errors.push(`Wix embed: ${error.message}`));
embedPage.on('request', (request) => {
  const url = new URL(request.url());
  if (!['127.0.0.1', 'localhost'].includes(url.hostname)) externalRequests.push(request.url());
});
await embedPage.goto(baseUrl, { waitUntil: 'domcontentloaded' });
await embedPage.setContent(`
  <!doctype html>
  <html><body style="margin:0">
    <script src="${baseUrl}/coaches-handbook/wix-handbook-embed.js"></script>
    <acsis-coaches-handbook handbook-url="${baseUrl}/coaches-handbook/?embed=1"></acsis-coaches-handbook>
  </body></html>
`, { waitUntil: 'networkidle' });
const customElement = embedPage.locator('acsis-coaches-handbook');
await embedPage.waitForFunction(() => {
  const element = document.querySelector('acsis-coaches-handbook');
  return element && parseInt(getComputedStyle(element).height, 10) > 1200;
});
const initialEmbedHeight = await customElement.evaluate((element) => parseInt(getComputedStyle(element).height, 10));
const embeddedHandbookFrame = embedPage.frames().find((frame) => frame.url().includes('/coaches-handbook/?embed=1'));
assert(embeddedHandbookFrame, 'responsive Wix wrapper did not load the handbook');
await embeddedHandbookFrame.getByRole('button', { name: /Session Output/ }).click();
await embedPage.waitForTimeout(350);
const outputEmbedHeight = await customElement.evaluate((element) => parseInt(getComputedStyle(element).height, 10));
assert(outputEmbedHeight !== initialEmbedHeight, `Wix wrapper did not follow the active handbook tab height (${initialEmbedHeight}px to ${outputEmbedHeight}px)`);
await embeddedHandbookFrame.getByRole('button', { name: /^WOOP / }).click();
await embedPage.waitForTimeout(900);
const exerciseEmbedHeight = await customElement.evaluate((element) => parseInt(getComputedStyle(element).height, 10));
assert(exerciseEmbedHeight > outputEmbedHeight, 'Wix wrapper did not expand for an opened coaching exercise');
assert(await customElement.evaluate((element) => !element.shadowRoot.querySelector('iframe').hasAttribute('srcdoc')), 'Wix wrapper unexpectedly stores handbook content');

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
  inlineWorksheet: 'passed',
  originalPracticalBank: 'passed',
  pdfPages: pdf.numPages,
  responsiveWidths: [390, 768, 1280],
  wixResponsiveHeights: [initialEmbedHeight, outputEmbedHeight, exerciseEmbedHeight],
  externalRequests,
  errors,
  pdf: `${pdfDir}/acsis-handbook-output.pdf`
}, null, 2));

await browser.close();
