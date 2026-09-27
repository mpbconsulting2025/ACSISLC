import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const toolsRoot = path.join(root, 'coaching-tools');
const csp = `<meta name="referrer" content="no-referrer">
<link rel="icon" href="data:,">
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'">`;

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(target) : entry.name.endsWith('.html') ? [target] : [];
  });
}

for (const file of htmlFiles(toolsRoot)) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('Content-Security-Policy')) html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n${csp}`);
  if (!html.includes('rel="icon"')) html = html.replace(/(<meta name="referrer"[^>]*>)/, '$1\n<link rel="icon" href="data:,">');
  if (file.includes(`${path.sep}tools${path.sep}`)) html = html.replace('<script src="./support.js"></script>', '<script src="../support.js"></script>');
  fs.writeFileSync(file, html);
}

const runtimePath = path.join(toolsRoot, 'support.js');
let runtime = fs.readFileSync(runtimePath, 'utf8');
if (!runtime.includes('ACSIS_RUNTIME_BASE_URL')) runtime = runtime.replace('(() => {', `(() => {
  var ACSIS_RUNTIME_BASE_URL = new URL('.', document.currentScript.src);`);
runtime = runtime.replace('var REACT_URL = "https://unpkg.com/react@18.3.1/umd/react.production.min.js";', 'var REACT_URL = new URL("assets/vendor/react.production.min.js", ACSIS_RUNTIME_BASE_URL).href;');
runtime = runtime.replace('var REACT_DOM_URL = "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js";', 'var REACT_DOM_URL = new URL("assets/vendor/react-dom.production.min.js", ACSIS_RUNTIME_BASE_URL).href;');
fs.writeFileSync(runtimePath, runtime);
console.log(`Hardened ${htmlFiles(toolsRoot).length} coaching toolbox pages and self-hosted the required runtime.`);
