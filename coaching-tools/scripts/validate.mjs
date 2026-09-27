import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return full;
  });
}

const files = walk(root);
const textFiles = files.filter((file) => /\.(?:html|css|js|mjs|md)$/.test(file));
const htmlFiles = files.filter((file) => /\.html$/.test(file));
const toolFiles = files.filter((file) => /\/tools\/[^/]+\.dc\.html$/.test(file));

for (const file of textFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes('\u2014')) failures.push(`${path.relative(root, file)} contains an em dash`);
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(source)) {
    failures.push(`${path.relative(root, file)} depends on Google Fonts`);
  }
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  if (!/<html\s+lang="en-GB"/i.test(source)) failures.push(`${relative} is missing lang="en-GB"`);
  if (!/<title>[^<]+<\/title>/i.test(source)) failures.push(`${relative} is missing a useful title`);

  for (const match of source.matchAll(/<(?:input|textarea|select)\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/aria-label=|aria-labelledby=/i.test(tag)) failures.push(`${relative} has an unlabelled form field`);
  }

  for (const match of source.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const target = match[1];
    if (/^(?:https?:|data:|mailto:|tel:|#|javascript:)/i.test(target)) continue;
    const clean = decodeURIComponent(target.split(/[?#]/)[0]);
    const resolved = path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(resolved)) failures.push(`${relative} has a missing local reference: ${target}`);
  }

  for (const match of source.matchAll(/<script\s+type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      class DCLogicStub {
        constructor() { this.state = {}; }
        setState(update) {
          const next = typeof update === 'function' ? update(this.state) : update;
          this.state = { ...this.state, ...next };
        }
      }
      const saved = new Map();
      const localStorageStub = {
        getItem: (key) => saved.get(key) ?? null,
        setItem: (key, value) => saved.set(key, String(value)),
        removeItem: (key) => saved.delete(key)
      };
      const Component = new Function(
        'DCLogic',
        'localStorage',
        'confirm',
        'window',
        `${match[1]}; return Component;`
      )(DCLogicStub, localStorageStub, () => false, { print() {} });
      const instance = new Component({});
      const values = instance.renderVals();
      if (!values || typeof values !== 'object') throw new Error('renderVals did not return an object');
    } catch (error) {
      failures.push(`${relative} has invalid embedded JavaScript or initial state: ${error.message}`);
    }
  }
}

const storageOwners = new Map();
for (const file of toolFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  if (!source.includes('class="acsis-help"')) {
    failures.push(`${relative} is missing the expandable client help panel`);
  }
  if (!source.includes('<summary>Why this may help</summary>')) {
    failures.push(`${relative} is missing the agreed help-panel heading`);
  }
  if (source.includes('value="{{ v.coach }}"')) {
    if (!source.includes('Notes you want to share with your coach for the next session</label>')) {
      failures.push(`${relative} is missing the agreed client-facing coach note label`);
    }
    if (!source.includes('placeholder="Add anything you would like your coach to read before your next session."')) {
      failures.push(`${relative} is missing the agreed coach note prompt`);
    }
  }
  for (const match of source.matchAll(/this\.key\s*=\s*['"]([^'"]+)['"]/g)) {
    const key = match[1];
    if (storageOwners.has(key)) failures.push(`${relative} repeats storage key ${key} from ${storageOwners.get(key)}`);
    storageOwners.set(key, relative);
  }
}

const johari = fs.readFileSync(path.join(root, 'tools', 'Johari Window.dc.html'), 'utf8');
const johariWords = johari.match(/this\.words=\[([^\]]+)\]/)?.[1]?.match(/'[^']+'/g)?.map((word) => word.slice(1, -1)) ?? [];
if (johariWords.length !== 56) failures.push(`Johari Window has ${johariWords.length} descriptors instead of 56`);
if (new Set(johariWords).size !== johariWords.length) failures.push('Johari Window descriptor list contains duplicates');
for (const marker of ['selfLeft', 'observer1Left', 'observer2Left', 'openText', 'blindText', 'hiddenText', 'unknownText', 'differentText', 'resultsReady', 'observerLink', 'responseCode']) {
  if (!johari.includes(marker)) failures.push(`Johari Window is missing ${marker}`);
}

try {
  const script = johari.match(/<script\s+type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/i)?.[1];
  if (!script) throw new Error('embedded logic was not found');
  class DCLogicStub {
    constructor() { this.state = {}; }
    setState(update) {
      const next = typeof update === 'function' ? update(this.state) : update;
      this.state = { ...this.state, ...next };
    }
  }
  const saved = new Map();
  const localStorageStub = {
    getItem: (key) => saved.get(key) ?? null,
    setItem: (key, value) => saved.set(key, String(value)),
    removeItem: (key) => saved.delete(key)
  };
  const Component = new Function(
    'DCLogic',
    'localStorage',
    'confirm',
    'window',
    `${script}; return Component;`
  )(DCLogicStub, localStorageStub, () => false, {
    location: { search: '', href: 'https://example.test/tools/Johari%20Window.dc.html' },
    print() {}
  });
  const instance = new Component({});
  instance.state.v = {
    observerCount: '2', selfComplete: true, o1Complete: true, o2Complete: true,
    s0: true,
    s1: true, o11: true, o21: true,
    o12: true, o22: true,
    s4: true, o14: true
  };
  const compared = instance.renderVals();
  if (!compared.resultsReady) throw new Error('completed responses did not unlock results');
  if (compared.hiddenText !== 'Able') throw new Error('SELF-only Able was not placed in HIDDEN');
  if (compared.openText !== 'Accepting') throw new Error('full agreement on Accepting was not placed in OPEN');
  if (compared.blindText !== 'Adaptable') throw new Error('observer-only Adaptable was not placed in BLIND');
  if (compared.differentText !== 'Brave') throw new Error('mixed observer views on Brave were not held separately');
  instance.state.v = { observerCount: '2', selfComplete: true, o1Complete: true, o2Complete: false };
  const pending = instance.renderVals();
  if (pending.resultsReady || !pending.resultsPending) throw new Error('unfinished observer responses did not keep results pending');
  const parsed = instance.parseResponse('JOHARI1|Sam%20T|0,2,55');
  if (parsed.name !== 'Sam T' || parsed.indexes.join(',') !== '0,2,55') throw new Error('observer response code could not be parsed');
} catch (error) {
  failures.push(`Johari Window comparison logic failed: ${error.message}`);
}

const toolbox = fs.readFileSync(path.join(root, 'Toolbox.dc.html'), 'utf8');
if (/OSKAR/i.test(toolbox)) failures.push('Toolbox still displays OSKAR');
const toolboxLinks = [...toolbox.matchAll(/href="tools\/([^"?#]+\.dc\.html)"/g)].map((match) => decodeURIComponent(match[1]));
const sourceNames = toolFiles.map((file) => path.basename(file)).sort();
if (toolboxLinks.length !== sourceNames.length) {
  failures.push(`Toolbox has ${toolboxLinks.length} tool links but tools has ${sourceNames.length} source pages`);
}
for (const name of sourceNames) {
  if (!toolboxLinks.includes(name)) failures.push(`Toolbox is missing ${name}`);
}

const collator = new Intl.Collator('en-GB', { numeric: true });
const toolboxCards = [...toolbox.matchAll(/<a class="tool-card"[\s\S]*?<\/a>/g)].map((match) => {
  const name = match[0].match(/<div[^>]*>([^<]+)<\/div>/);
  return name ? name[1] : '';
}).filter(Boolean);
if (toolboxCards.join('\n') !== [...toolboxCards].sort(collator.compare).join('\n')) {
  failures.push('Toolbox tools are not alphabetical');
}

const shareNames = files
  .filter((file) => /\/share\/[^/]+\.html$/.test(file) && path.basename(file) !== 'Toolbox.html')
  .map((file) => path.basename(file, '.html') + '.dc.html')
  .sort();
for (const name of sourceNames) {
  if (!shareNames.includes(name)) failures.push(`share is missing ${name.replace(/\.dc\.html$/, '.html')}`);
}

const fontsCss = fs.readFileSync(path.join(root, 'assets/fonts/fonts.css'), 'utf8');
for (const match of fontsCss.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
  const font = path.resolve(root, 'assets/fonts', match[1]);
  if (!fs.existsSync(font)) failures.push(`fonts.css points to missing file ${match[1]}`);
}

const logoPath = path.join(root, 'assets', 'acsis-logo.png');
const logoBuffer = fs.readFileSync(logoPath);
const logoWidth = logoBuffer.readUInt32BE(16);
const logoHeight = logoBuffer.readUInt32BE(20);
if (logoWidth !== 6935 || logoHeight !== 2019) {
  failures.push(`ACSIS logo dimensions changed unexpectedly to ${logoWidth} x ${logoHeight}`);
}
const sharedToolsCss = fs.readFileSync(path.join(root, 'assets', 'acsis-tools.css'), 'utf8');
for (const marker of ['aspect-ratio: 6935 / 2019', 'object-fit: contain', 'flex: 0 0 45mm', 'height: auto !important']) {
  if (!sharedToolsCss.includes(marker)) failures.push(`shared logo styling is missing ${marker}`);
}
for (const file of toolFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes('acsis-logo.png') && !source.includes('alt="ACSIS Life Coaching"')) {
    failures.push(`${path.relative(root, file)} is missing the ACSIS logo alternative text`);
  }
}

if (failures.length) {
  console.error(`Validation failed with ${failures.length} issue${failures.length === 1 ? '' : 's'}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Validation passed: ${sourceNames.length} tools, ${htmlFiles.length} HTML pages, ${storageOwners.size} unique storage keys.`);
}
