import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const toolsDir = path.join(root, 'tools');
const shareDir = path.join(root, 'share');

fs.mkdirSync(shareDir, { recursive: true });

const expectedShareFiles = new Set(['Toolbox.html']);

function writeShare(sourcePath, outputName, kind) {
  let html = fs.readFileSync(sourcePath, 'utf8');

  if (kind === 'tool') {
    html = html.replace('<script src="./support.js"></script>', '<script src="../support.js"></script>');
  } else {
    html = html
      .replace('<script src="./support.js"></script>', '<script src="../support.js"></script>')
      .replaceAll('href="assets/', 'href="../assets/')
      .replaceAll('src="assets/', 'src="../assets/')
      .replaceAll('href="tools/', 'href="../tools/');
  }

  fs.writeFileSync(path.join(shareDir, outputName), html);
}

for (const filename of fs.readdirSync(toolsDir).sort()) {
  if (!filename.endsWith('.dc.html') || filename === 'All Tools Print Set.dc.html') continue;
  expectedShareFiles.add(filename.replace(/\.dc\.html$/, '.html'));
  writeShare(
    path.join(toolsDir, filename),
    filename.replace(/\.dc\.html$/, '.html'),
    'tool'
  );
}

for (const filename of fs.readdirSync(shareDir)) {
  if (filename.endsWith('.html') && !expectedShareFiles.has(filename)) {
    fs.unlinkSync(path.join(shareDir, filename));
  }
}

writeShare(path.join(root, 'Toolbox.dc.html'), 'Toolbox.html', 'toolbox');

console.log('Share pages rebuilt from the canonical V10 toolbox and tool files.');
