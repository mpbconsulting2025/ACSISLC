// Shared shell for ACSIS workbook tools. Evaluated inside run_script; defines globals used by tool specs.
const NAVY='#1C2B4B',RED='#E51B3F',CYAN='#5BC8E0',GREEN='#6DAF4B',INK='#22283A',MUTE='#7A8394',LINE='#C9D1DC',PALE='#F3F6FA',FIELD='#FAFBFD';
const MONT="'Montserrat',sans-serif",FRANK="'Libre Franklin',sans-serif";
const H=`<helmet>
<script src="../doc-page.js"></script>
<style>
doc-page:not(:defined){visibility:hidden}
body{margin:0;font-family:${FRANK};color:${INK};-webkit-print-color-adjust:exact;print-color-adjust:exact}
a{color:${NAVY}}a:hover{color:${RED}}
textarea:focus,input:focus{outline:none;border-color:${CYAN} !important;box-shadow:0 0 0 2px rgba(91,200,224,.35)}
input[type=range]{accent-color:${RED}}
input[type=checkbox]{accent-color:${NAVY};width:4.2mm;height:4.2mm;margin:0;flex:none}
textarea::placeholder,input::placeholder{color:#A3ABB8}
textarea{field-sizing:content}
@media print{textarea,section>div{break-inside:avoid}[data-noprint]{display:none !important}textarea,input{background:transparent !important;box-shadow:none !important}}
</style>
</helmet>
<a data-noprint href="../Toolbox.dc.html" style="position:fixed;top:14px;left:14px;z-index:50;display:flex;align-items:center;gap:6px;background:#fff;color:#1C2B4B;border:1.5px solid #1C2B4B;padding:8px 14px 8px 10px;border-radius:999px;text-decoration:none;font:700 13px 'Montserrat',sans-serif;box-shadow:0 4px 14px rgba(28,43,75,.15)" style-hover="background:#1C2B4B;color:#fff"><span style="font-size:16px;line-height:1">&larr;</span>All tools</a>
<div data-noprint style="position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:50;display:flex;gap:8px;align-items:center;background:${NAVY};color:#fff;padding:8px 8px 8px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(28,43,75,.35);font:500 13px ${FRANK};white-space:nowrap">
  <span style="opacity:.8">Answers save only in this browser</span>
  <a href="../Toolbox.dc.html" style="color:#fff;text-decoration:none;font:600 13px ${MONT};padding:8px 12px;border-radius:999px" style-hover="background:rgba(255,255,255,.12)">All tools</a>
  <button type="button" onClick="{{ clear }}" style="border:0;background:transparent;color:#fff;font:600 13px ${MONT};padding:8px 12px;border-radius:999px;cursor:pointer" style-hover="background:rgba(255,255,255,.12)">Clear</button>
  <button type="button" onClick="{{ print }}" style="border:0;background:${RED};color:#fff;font:700 13px ${MONT};padding:9px 16px;border-radius:999px;cursor:pointer" style-hover="background:#c9152f">Save as PDF</button>
</div>`;

const LOGIC=(key,defaults)=>`class Component extends DCLogic {
  constructor(p){
    super(p);
    this.key='${key}';
    this.defaults=${JSON.stringify(defaults||{})};
    let s={}; try{ s=JSON.parse(localStorage.getItem(this.key)||'{}') }catch(e){}
    this.state={v:s};
    this._h={};
    this.set=new Proxy({},{get:(_,k)=>this._h[k]||(this._h[k]=(e)=>{const t=e.target;const val=t.type==='checkbox'?t.checked:t.value;this.setState(st=>{const v={...st.v,[k]:val};try{localStorage.setItem(this.key,JSON.stringify(v))}catch(e){}return {v}})})});
  }
  val(k){ const x=this.state.v[k]; return x===undefined||x===null ? (this.defaults[k]!==undefined?this.defaults[k]:'') : x; }
  extra(){ return {}; }
  renderVals(){
    const v=new Proxy({},{get:(_,k)=>this.val(k)});
    return Object.assign({v,set:this.set,print:()=>window.print(),
      clear:()=>{ if(confirm('Clear all your answers on this sheet?')){ try{localStorage.removeItem(this.key)}catch(e){} this.setState({v:{}}) } }}, this.extra(v));
  }
}`;

// ---- building blocks (return HTML strings) ----
const lbl=(t,extra='')=>`<label style="font:700 9.5pt ${MONT};color:${NAVY};${extra}">${t}</label>`;
const eyebrowStyle=`font:700 7.5pt ${MONT};letter-spacing:.14em;text-transform:uppercase`;
const small=(t)=>`<p style="margin:0;font-size:8.5pt;line-height:1.4;color:#4B5566;text-wrap:pretty">${t}</p>`;
const ta=(key,label,h,ph='',opts={})=>`<div style="display:flex;flex-direction:column;gap:1.5mm;${opts.wrap||''}">${label?lbl(label):''}${opts.hint?small(opts.hint):''}<textarea value="{{ v.${key} }}" onChange="{{ set.${key} }}" placeholder="${ph}" style="width:100%;box-sizing:border-box;min-height:${h}mm;overflow:hidden;border:1px solid ${LINE};border-radius:2.5mm;padding:2.5mm 3mm;font:10pt/1.5 ${FRANK};color:${INK};background:${FIELD};resize:none;${opts.style||''}"></textarea></div>`;
const inp=(key,label,ph='',extra='')=>`<div style="display:flex;flex-direction:column;gap:1mm;${extra}"><label style="${eyebrowStyle};color:${MUTE}">${label}</label><input type="text" value="{{ v.${key} }}" onChange="{{ set.${key} }}" placeholder="${ph}" style="border:0;border-bottom:1.5px solid ${NAVY};padding:1.5mm 0;font:10.5pt ${FRANK};color:${INK};background:transparent;width:100%;box-sizing:border-box"></div>`;
const line=(key,ph='',extra='')=>`<input type="text" value="{{ v.${key} }}" onChange="{{ set.${key} }}" placeholder="${ph}" style="border:0;border-bottom:1px solid ${LINE};padding:1.5mm 1mm;font:10pt ${FRANK};color:${INK};background:transparent;width:100%;box-sizing:border-box;${extra}">`;
const cb=(key,label,extra='')=>`<label style="display:flex;gap:2.5mm;align-items:center;font-size:9.5pt;line-height:1.3;cursor:pointer;${extra}"><input type="checkbox" checked="{{ v.${key} }}" onChange="{{ set.${key} }}">${label}</label>`;
const range=(key,min,max,extra='')=>`<div style="display:grid;grid-template-columns:1fr 9mm;gap:2.5mm;align-items:center;${extra}"><input type="range" min="${min}" max="${max}" step="1" value="{{ v.${key} }}" onChange="{{ set.${key} }}" style="width:100%;margin:0"><span style="font:800 13pt ${MONT};color:${RED};text-align:right">{{ v.${key} }}</span></div>`;
const pill=(n,bg,fg='#fff')=>`<span style="flex:none;width:7mm;height:7mm;border-radius:50%;background:${bg};color:${fg};display:grid;place-items:center;font:800 10pt ${MONT}">${n}</span>`;
const letter=(ch,bg,fg='#fff',size=18)=>`<div style="flex:none;width:${size}mm;height:${size}mm;border-radius:3mm;background:${bg};color:${fg};display:grid;place-items:center;font:800 ${size*0.62}pt ${MONT};letter-spacing:-.02em">${ch}</div>`;
const steps=(arr)=>`<div style="display:grid;grid-template-columns:repeat(${arr.length},1fr);gap:4mm">${arr.map((s,i)=>`<div style="display:flex;gap:3mm;align-items:flex-start;background:${PALE};border-radius:3mm;padding:3.5mm 4mm">${pill(i+1,[NAVY,RED,CYAN,GREEN][i%4],i===2?NAVY:'#fff')}<p style="margin:0;font-size:9pt;line-height:1.4;text-wrap:pretty"><strong style="font-family:${MONT};color:${NAVY}">${s.b}</strong> ${s.t}</p></div>`).join('')}</div>`;
const header=(eyebrow,title,intro,logoH=14)=>`<header style="display:flex;justify-content:space-between;align-items:flex-start;gap:8mm">
    <div style="display:flex;flex-direction:column;gap:2mm">
      <div style="${eyebrowStyle};color:${RED}">${eyebrow}</div>
      <h1 style="margin:0;font:800 24pt/1.05 ${MONT};color:${NAVY};letter-spacing:-.02em">${title}</h1>
      <p style="margin:0;font-size:10pt;line-height:1.45;max-width:118mm;text-wrap:pretty">${intro}</p>
    </div>
    <img src="../assets/acsis-logo.png" alt="ACSIS Life Coaching" style="height:${logoH}mm;width:auto;margin-top:1mm">
  </header>`;
const miniHeader=(title,sub)=>`<header style="display:flex;justify-content:space-between;align-items:center;gap:8mm;border-bottom:1.5px solid ${NAVY};padding-bottom:3mm">
    <div style="display:flex;flex-direction:column;gap:1mm"><div style="${eyebrowStyle};color:${RED}">${sub}</div><h2 style="margin:0;font:800 16pt/1.1 ${MONT};color:${NAVY};letter-spacing:-.02em">${title}</h2></div>
    <img src="../assets/acsis-mark.png" alt="ACSIS" style="height:9mm;width:auto">
  </header>`;
const footer=()=>`<footer style="display:flex;justify-content:space-between;align-items:center;border-top:1.5px solid ${NAVY};padding-top:2.5mm;font:600 8pt ${MONT};color:${NAVY}">
    <span style="display:flex;gap:2mm;align-items:center"><span style="width:5mm;height:1.6mm;border-radius:1mm;background:${NAVY};display:inline-block"></span><span style="width:5mm;height:1.6mm;border-radius:1mm;background:${RED};display:inline-block"></span><span style="width:5mm;height:1.6mm;border-radius:1mm;background:${CYAN};display:inline-block"></span><span style="margin-left:2mm">Clarity · Courage · Connection</span></span>
    <span>www.acsis.co.uk</span>
  </footer>`;
const notesRow=(tip,h=18,nameLabel='Name',dateLabel='Date')=>`<div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:auto">
    <div style="display:flex;flex-direction:column;gap:1.5mm">
      <label style="${eyebrowStyle};color:${MUTE}">Coach notes</label>
      <textarea value="{{ v.coach }}" onChange="{{ set.coach }}" placeholder="Themes, follow-up questions, next session…" style="width:100%;box-sizing:border-box;min-height:${h}mm;overflow:hidden;border:1px dashed #B9C2CE;border-radius:2.5mm;padding:2mm 3mm;font:9.5pt/1.45 ${FRANK};color:${INK};background:#fff;resize:none"></textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;align-content:end">
      ${inp('name',nameLabel)}${inp('date',dateLabel)}
      ${tip?`<p style="grid-column:1/-1;margin:1mm 0 0;font-size:8.5pt;color:#4B5566;line-height:1.4;text-wrap:pretty">${tip}</p>`:''}
    </div>
  </div>`;
const page=(label,inner)=>`<section data-screen-label="${label}" style="padding:12mm 13mm 10mm;display:flex;flex-direction:column;gap:5mm;font-family:${FRANK};color:${INK};background:#fff">
${inner}
</section>`;
const doc=async(file,key,defaults,pages,extraJs='')=>{
  const html=`<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${file} | ACSIS Coaching Toolbox</title>
<link rel="stylesheet" href="../assets/fonts/fonts.css">
<link rel="stylesheet" href="../assets/acsis-tools.css">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
${H}
<doc-page size="a4" margin="0">
${pages.join('\n')}
</doc-page>
</x-dc>
<script type="text/x-dc" data-dc-script>
${LOGIC(key,defaults).replace('extra(){ return {}; }', extraJs||'extra(){ return {}; }')}
</script>
</body>
</html>`;
  await saveFile('tools/'+file+'.dc.html', html);
  log('wrote '+file);
};
Object.assign(globalThis,{NAVY,RED,CYAN,GREEN,INK,MUTE,LINE,PALE,FIELD,MONT,FRANK,H,LOGIC,lbl,eyebrowStyle,small,ta,inp,line,cb,range,pill,letter,steps,header,miniHeader,footer,notesRow,page,doc});
