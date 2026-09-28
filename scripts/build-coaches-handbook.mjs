import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const handbookPath = path.join(root, 'coaches-handbook', 'index.html');
const toolboxPath = path.join(root, 'coaching-tools', 'Toolbox.dc.html');
const cataloguePath = path.join(root, 'shared', 'tool-catalogue.js');
const supportPath = path.join(root, 'coaching-tools', 'support.js');

const decode = (value) => value
  .replace(/<[^>]*>/g, '')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function buildCatalogue() {
  const toolbox = fs.readFileSync(toolboxPath, 'utf8');
  const cards = [];
  const cardPattern = /<a class="tool-card" href="([^"]+)"[\s\S]*?<\/a>/g;
  for (const match of toolbox.matchAll(cardPattern)) {
    const divs = [...match[0].matchAll(/<div[^>]*>([\s\S]*?)<\/div>/g)].map((entry) => decode(entry[1]));
    if (divs.length < 3) throw new Error(`Could not read toolbox card: ${match[1]}`);
    cards.push({ href: match[1], name: divs[0], description: divs[1], pillar: divs[2] });
  }
  if (cards.length !== 31) throw new Error(`Expected 31 toolbox cards, found ${cards.length}`);
  const output = `/* Generated from coaching-tools/Toolbox.dc.html. */\nwindow.ACSIS_TOOL_CATALOGUE = Object.freeze(${JSON.stringify(cards, null, 2)});\n`;
  fs.writeFileSync(cataloguePath, output);
  return cards;
}

function requireText(text, needle, message) {
  if (!text.includes(needle)) throw new Error(message);
}

function verifyHandbook(cards) {
  const handbook = fs.readFileSync(handbookPath, 'utf8');
  const support = fs.readFileSync(supportPath, 'utf8');

  requireText(handbook, '2026-09-27-v21-responsive-wix', 'The V21 build marker is missing');
  requireText(handbook, 'assets/acsis-logo-03.png', 'The supplied ACSIS wordmark is missing');
  requireText(handbook, '<textarea name="outcomeNotes"', 'Outcome notes must use an expanding textarea');
  requireText(handbook, '<strong>Practical tools bank</strong>', 'The original practical tools bank is missing');
  requireText(handbook, 'id="activeToolExercises"', 'The inline exercise output area is missing');
  requireText(handbook, "className='embedded-tool-frame'", 'Toolbox exercises are not configured to open inside the handbook');
  requireText(handbook, '?embed=handbook&tool=', 'Embedded exercises are not using handbook mode');
  requireText(handbook, 'toolboxTools:', 'Selected exercises are not saved with the handbook draft');
  requireText(handbook, 'height:238mm!important', 'The one-page exercise PDF sizing is missing');
  requireText(handbook, "type:'acsis-handbook-height'", 'The responsive Wix height message is missing');
  requireText(support, "params.get('embed') !== 'handbook'", 'The toolbox embed helper is missing');
  requireText(support, 'zoom:.8!important', 'The embedded exercise print scale is missing');
  if (handbook.includes('Private by design.')) throw new Error('The removed privacy notice is still present');
  if (cards.length !== 31) throw new Error('The shared coaching toolbox catalogue is incomplete');
}

const cards = buildCatalogue();
verifyHandbook(cards);
console.log(`Verified the V21 coaches handbook and rebuilt its ${cards.length}-tool catalogue.`);
