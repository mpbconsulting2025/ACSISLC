import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const handbookPath = path.join(root, 'coaches-handbook', 'index.html');
const toolboxPath = path.join(root, 'coaching-tools', 'Toolbox.dc.html');
const cataloguePath = path.join(root, 'shared', 'tool-catalogue.js');

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

function buildHandbook(cards) {
  let html = fs.readFileSync(handbookPath, 'utf8');

  const embeddedImages = [...html.matchAll(/data:image\/(png|jpeg);base64,([^"']+)/g)];
  if (embeddedImages.length !== 5) throw new Error(`Expected 5 embedded handbook images, found ${embeddedImages.length}`);
  const handbookAssets = path.join(root, 'coaches-handbook', 'assets');
  fs.mkdirSync(handbookAssets, { recursive: true });
  fs.writeFileSync(path.join(handbookAssets, 'pivs.png'), Buffer.from(embeddedImages[1][2], 'base64'));
  fs.writeFileSync(path.join(handbookAssets, 'armed-forces-covenant.jpg'), Buffer.from(embeddedImages[2][2], 'base64'));
  const imagePaths = [
    '../coaching-tools/assets/acsis-logo.png',
    'assets/pivs.png',
    'assets/armed-forces-covenant.jpg',
    '../coaching-tools/assets/acsis-mark.png',
    '../coaching-tools/assets/acsis-mark.png'
  ];
  embeddedImages.forEach((image, index) => {
    html = html.replace(image[0], imagePaths[index]);
  });

  html = html
    .replace('<meta content="width=device-width, initial-scale=1" name="viewport"/>', `<meta content="width=device-width, initial-scale=1" name="viewport"/>
<meta name="description" content="ACSIS Coaches Handbook with browser-only private saving and PDF export"/>
<meta name="referrer" content="no-referrer"/>
<meta name="acsis-build" content="2026-09-27-v17-browser-only"/>
<link rel="icon" href="data:,"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'"/>`)
    .replace(/<link href="https:\/\/fonts\.googleapis\.com" rel="preconnect"\/>\s*<link crossorigin="" href="https:\/\/fonts\.gstatic\.com" rel="preconnect"\/>\s*<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]+rel="stylesheet"\/>/, '<link href="../coaching-tools/assets/fonts/fonts.css" rel="stylesheet"/>')
    .replace('--display:"Fraunces",Georgia,serif;--body:"Karla",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace;', '--display:"Montserrat",Arial,sans-serif;--body:"Libre Franklin",Arial,sans-serif;--mono:ui-monospace,"SFMono-Regular",Consolas,monospace;')
    .replace('>Save draft</button>', '>Save now</button>')
    .replace('>Restore draft</button>', '>Restore saved</button>')
    .replace('<div class="notice no-print"><strong>One record for either call.</strong>Keep notes factual and proportionate. Add a coaching tool only when it was actually used. Unticked tools will not appear in the PDF.</div>', '<div class="notice no-print"><strong>One record for either call.</strong>Keep notes factual and proportionate. The coaching tools below open as separate worksheets and save independently in this browser.</div>');

  const css = `
/* Browser-only privacy and shared toolbox */
.privacy-banner{background:#EAF8FB;border-bottom:1px solid #B8E4EC;color:var(--navy)}
.privacy-banner .wrap{padding-top:11px;padding-bottom:11px;font-size:13px;line-height:1.45}
.privacy-banner strong{font-weight:700}
.privacy-chip{display:inline-flex;align-items:center;gap:6px;background:#EAF8FB;color:var(--navy);border:1px solid #B8E4EC;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:700;white-space:nowrap}
.privacy-chip::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--green)}
.legacy-tool-banks[hidden]{display:none!important}
.toolbox-panel{margin-top:30px}
.toolbox-intro{border-left:3px solid var(--green);background:#fff;padding:14px 16px;margin:0 0 14px;font-size:14px}
.toolbox-intro strong{display:block;margin-bottom:4px}
.shared-tool-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.shared-tool-card{display:flex;flex-direction:column;gap:5px;min-width:0;padding:13px 14px;border:1px solid var(--rule);border-radius:4px;background:#fff;color:var(--ink);text-decoration:none}
.shared-tool-card:hover,.shared-tool-card:focus-visible{border-color:var(--navy);box-shadow:0 4px 12px rgba(31,42,79,.1);outline:none}
.shared-tool-card strong{font-family:var(--display);font-size:15px}
.shared-tool-card small{color:var(--muted);font-size:12px;line-height:1.4}
.shared-tool-card span{margin-top:auto;color:var(--red);font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase}
.toolbox-open-all{display:inline-flex;margin-top:14px;color:var(--navy);font-weight:700}
.is-embedded .band{padding-top:18px}
@media(max-width:720px){.shared-tool-grid{grid-template-columns:1fr}.privacy-chip{order:-1}.toolbar .wrap{align-items:flex-start}}
@media print{
  .privacy-banner,.toolbox-panel,.legacy-tool-banks{display:none!important}
  .grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .grid.three{grid-template-columns:repeat(3,minmax(0,1fr))!important}
  .print-empty-row{display:none!important}
  section{margin-top:9pt!important}
  .sec-head{margin-bottom:5pt!important}
  .output-section{margin-bottom:5pt!important}
  .output-section summary{padding:4pt 7pt!important}
  .details-body{padding:6pt!important}
  .field{margin-top:4pt!important}
  footer{margin-top:7pt!important;padding-top:7pt!important}
}
`;
  html = html.replace('</style>', `${css}</style>`);

  const toolbar = '<div class="toolbar no-print"><div class="wrap"><button class="btn-primary" id="printPage">Export this tab as PDF</button><button class="btn-ghost" id="printAll">Export whole handbook as PDF</button><button class="btn-ghost" id="save">Save now</button><button class="btn-ghost" id="restore">Restore saved</button><button class="btn-ghost" id="clear">Clear</button><span class="privacy-chip">Browser only</span><span class="status" id="status" aria-live="polite"></span></div></div>';
  html = html.replace(/<div class="toolbar no-print">[\s\S]*?<span class="status" id="status"><\/span><\/div><\/div>/, `${toolbar}<div class="privacy-banner no-print"><div class="wrap"><strong>Private by design.</strong> Entries stay in this browser and are not sent to ACSIS, GitHub, Wix or another device. Download a PDF only when you are ready to save or email it.</div></div>`);

  const legacyStart = html.indexOf('<div class="mini-brand">');
  const legacyEndMarker = '<section id="practicalModules"></section>';
  const legacyEnd = html.indexOf(legacyEndMarker, legacyStart);
  if (legacyStart < 0 || legacyEnd < 0) throw new Error('Could not find the legacy handbook tool banks');
  const legacy = html.slice(legacyStart, legacyEnd + legacyEndMarker.length);
  const catalogueSection = `<section class="toolbox-panel no-print" aria-labelledby="sharedToolboxTitle">
<div class="sec-head"><h2 id="sharedToolboxTitle">ACSIS Coaching Toolbox</h2><span class="tag">${cards.length} matching worksheets</span></div>
<div class="toolbox-intro"><strong>Choose the worksheet that best supports the client.</strong>Each tool opens separately, saves only in this browser and has its own PDF export. The handbook and worksheets do not share client answers.</div>
<div class="shared-tool-grid" id="sharedToolCatalogue"></div>
<a class="toolbox-open-all" href="../coaching-tools/Toolbox.dc.html" target="_blank" rel="noopener noreferrer">Open the full coaching toolbox</a>
</section>`;
  html = `${html.slice(0, legacyStart)}<div class="legacy-tool-banks" hidden aria-hidden="true">${legacy}</div>${catalogueSection}${html.slice(legacyEnd + legacyEndMarker.length)}`;

  html = html.replace('wheelState:JSON.parse(JSON.stringify(wheelState))};', 'wheelState:JSON.parse(JSON.stringify(wheelState)),selectedFlow:document.querySelector(\'.flow-choice.active\')?.dataset.flow||\'\'};');
  html = html.replace("document.querySelectorAll('details').forEach((e,i)=>{if(d.details&&d.details[i]!==undefined)e.open=d.details[i]});showTab", "document.querySelectorAll('details').forEach((e,i)=>{if(d.details&&d.details[i]!==undefined)e.open=d.details[i]});if(d.selectedFlow){const flowButton=document.querySelector(`.flow-choice[data-flow=\"${d.selectedFlow}\"]`);if(flowButton)flowButton.click()}showTab");

  const saveBlock = `const KEY='acsis-coaches-handbook-v17-browser-only',LEGACY_KEY='acsis-coaches-handbook-v4-tools',status=document.getElementById('status');
function collect(){
  const d={active,fields:{},checks:{},details:{},sessionType:typeSel.value,actionRows:actions.rows.length,offboardRows:offboardSessions.rows.length,wheelState:JSON.parse(JSON.stringify(wheelState)),selectedFlow:document.querySelector('.flow-choice.active')?.dataset.flow||''};
  document.querySelectorAll('input,select,textarea').forEach((e,i)=>{const key=e.name||e.dataset.cc||e.dataset.coach||e.dataset.core||e.dataset.modelToggle||e.dataset.practicalToggle||('field'+i);if(e.type==='checkbox')d.checks[key]=e.checked;else d.fields[key]=e.value});
  document.querySelectorAll('details').forEach((e,i)=>d.details[i]=e.open);
  return d;
}
function restoreData(d){
  if(!d)return;
  if(d.actionRows){while(actions.rows.length<d.actionRows)addActionRow();while(actions.rows.length>d.actionRows&&actions.rows.length>1)actions.deleteRow(-1)}
  if(d.offboardRows){while(offboardSessions.rows.length<d.offboardRows)addOffboardRow();while(offboardSessions.rows.length>d.offboardRows&&offboardSessions.rows.length>1)offboardSessions.deleteRow(-1)}
  if(d.wheelState){wheelState.scores=d.wheelState.scores||wheelState.scores;wheelState.focus=d.wheelState.focus||wheelState.focus;buildToolWheel();document.querySelectorAll('#toolWheelAreas .area').forEach((row,i)=>{row.querySelector('input').value=wheelState.scores[i];row.querySelector('.val').textContent=wheelState.scores[i];row.querySelector('button').setAttribute('aria-pressed',String(wheelState.focus[i]))});document.getElementById('toolWheelFocus').textContent=WHEEL_AREAS.filter((_,i)=>wheelState.focus[i]).join(', ')||'Nothing marked yet.';drawToolWheel()}
  if(d.sessionType){typeSel.value=d.sessionType;renderType()}
  document.querySelectorAll('input,select,textarea').forEach((e,i)=>{const key=e.name||e.dataset.cc||e.dataset.coach||e.dataset.core||e.dataset.modelToggle||e.dataset.practicalToggle||('field'+i);if(e.type==='checkbox'){e.checked=!!(d.checks&&d.checks[key]);if(e.dataset.modelToggle)setModel(e.dataset.modelToggle,e.checked);if(e.dataset.practicalToggle)setPractical(e.dataset.practicalToggle,e.checked)}else if(d.fields&&d.fields[key]!==undefined)e.value=d.fields[key]});
  document.querySelectorAll('details').forEach((e,i)=>{if(d.details&&d.details[i]!==undefined)e.open=d.details[i]});
  if(d.selectedFlow){const flowButton=document.querySelector(\`.flow-choice[data-flow="\${d.selectedFlow}"]\`);if(flowButton)flowButton.click()}
  showTab(d.active||'clarity');tally('[data-cc]','ccCount','ccBar');tally('[data-coach]','coachCount','coachBar');
}
let statusTimer,autosaveTimer,draftCleared=false;
function say(t){clearTimeout(statusTimer);status.textContent=t||'';if(t)statusTimer=setTimeout(()=>status.textContent='',4200)}
function savedDraft(){return localStorage.getItem(KEY)||localStorage.getItem(LEGACY_KEY)}
function persistDraft(message='Autosaved on this device'){if(draftCleared)return false;try{localStorage.setItem(KEY,JSON.stringify(collect()));localStorage.removeItem(LEGACY_KEY);if(message)say(message);return true}catch(e){if(message)say('This browser could not save the draft');return false}}
function queueAutosave(){draftCleared=false;clearTimeout(autosaveTimer);autosaveTimer=setTimeout(()=>persistDraft(),450)}
document.getElementById('save').onclick=()=>{draftCleared=false;persistDraft('Saved on this device')};
document.getElementById('restore').onclick=()=>{const raw=savedDraft();if(!raw)return say('No saved draft found on this device');try{restoreData(JSON.parse(raw));draftCleared=false;say('Saved draft restored')}catch(e){say('The saved draft could not be restored')}};
document.getElementById('clear').onclick=()=>{if(!confirm('Clear all fields and the saved draft from this browser?'))return;clearTimeout(autosaveTimer);draftCleared=true;localStorage.removeItem(KEY);localStorage.removeItem(LEGACY_KEY);document.querySelectorAll('input,textarea').forEach(e=>{if(e.type==='checkbox'){e.checked=false;if(e.dataset.modelToggle)setModel(e.dataset.modelToggle,false);if(e.dataset.practicalToggle)setPractical(e.dataset.practicalToggle,false)}else e.value=''});document.querySelectorAll('select').forEach(e=>e.selectedIndex=0);while(actions.rows.length>3)actions.deleteRow(-1);while(offboardSessions.rows.length>3)offboardSessions.deleteRow(-1);typeSel.selectedIndex=0;renderType();tally('[data-cc]','ccCount','ccBar');tally('[data-coach]','coachCount','coachBar');say('Cleared from this browser')};
document.addEventListener('input',queueAutosave);
document.addEventListener('change',queueAutosave);
document.addEventListener('toggle',queueAutosave,true);
document.addEventListener('click',e=>{if(e.target.closest('.tab,.flow-choice,#addAction,#addOffboardSession,.remove-action,.focus-btn,.scale-step'))setTimeout(queueAutosave)});
window.addEventListener('load',()=>{const raw=savedDraft();if(!raw){say('Nothing saved yet on this device');return}try{restoreData(JSON.parse(raw));draftCleared=false;say('Saved draft restored from this device')}catch(e){say('The saved draft could not be restored')}});
window.addEventListener('pagehide',()=>persistDraft(null));`;
  html = html.replace(/const KEY='acsis-coaches-handbook-v4-tools'[\s\S]*?(?=\nfunction resetPrint)/, saveBlock);
  html = html.replace("input[type=\"number\"],select').forEach", "input[type=\"number\"],select,textarea').forEach");
  html = html.replace("document.querySelectorAll('.print-control-source').forEach(e=>e.classList.remove('print-control-source'));", "document.querySelectorAll('.print-control-source').forEach(e=>e.classList.remove('print-control-source'));document.querySelectorAll('.print-empty-row').forEach(e=>e.classList.remove('print-empty-row'));");
  html = html.replace('  cleanupPrintFields();\n  document.querySelectorAll(\'input[type="text"]', `  cleanupPrintFields();
  document.querySelectorAll('#actions tr,#offboardSessions tr').forEach(row=>{const controls=[...row.querySelectorAll('input,select,textarea')];row.classList.toggle('print-empty-row',controls.length>0&&controls.every(control=>!control.value))});
  document.querySelectorAll('input[type="text"]`);

  const catalogueScript = `<script src="../shared/tool-catalogue.js"></script>
<script>
document.documentElement.classList.toggle('is-embedded',new URLSearchParams(location.search).get('embed')==='1');
(function renderSharedToolbox(){
  const host=document.getElementById('sharedToolCatalogue');
  const catalogue=window.ACSIS_TOOL_CATALOGUE||[];
  catalogue.forEach(tool=>{
    const link=document.createElement('a');
    link.className='shared-tool-card';
    link.href='../coaching-tools/'+tool.href;
    link.target='_blank';
    link.rel='noopener noreferrer';
    const name=document.createElement('strong');name.textContent=tool.name;
    const description=document.createElement('small');description.textContent=tool.description;
    const pillar=document.createElement('span');pillar.textContent=tool.pillar;
    link.append(name,description,pillar);host.appendChild(link);
  });
})();
</script>`;
  html = html.replace('</body></html>', `${catalogueScript}\n</body></html>`);
  fs.writeFileSync(handbookPath, html);
}

const cards = buildCatalogue();
buildHandbook(cards);
console.log(`Built the private browser-only handbook with ${cards.length} shared toolbox links.`);
