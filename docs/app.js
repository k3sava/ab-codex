const REPO_BASE = 'https://github.com/k3sava/codex/blob/main';
const app = document.getElementById('app');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FILES = [
  'insight-library/01_thought-leaders/ai-native-pmm-01/insights.md',
  'insight-library/01_thought-leaders/ai-native-pmm-02/insights.md',
  'insight-library/01_thought-leaders/aeo-01/insights.md',
  'insight-library/01_thought-leaders/aeo-02/insights.md',
  'insight-library/01_thought-leaders/community-01/insights.md',
  'insight-library/01_thought-leaders/community-02/insights.md',
  'insight-library/01_thought-leaders/cro-01/insights.md',
  'insight-library/01_thought-leaders/cs-01/insights.md',
  'insight-library/01_thought-leaders/demand-gen-01/insights.md',
  'insight-library/01_thought-leaders/demand-gen-02/insights.md',
  'insight-library/01_thought-leaders/rory/insights.md',
  'insight-library/01_thought-leaders/support-01/insights.md'
];
let cards=[];
function slugify(s){return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function parseInsights(md,path){
  const title=(md.match(/^#\s+(.+)$/m)||[])[1]||'Unknown';
  const blocks=md.split(/\n## Insight:\s+/).slice(1);
  return blocks.map((block,i)=>{const h=block.split('\n')[0].trim();
    const get=(label)=>((block.match(new RegExp(`### ${label}\\n([\\s\\S]*?)(?=\\n### |$)`))||[])[1]||'').trim().replace(/\n+/g,' ');
    const line=(key)=>((block.match(new RegExp(`- ${key}:\\s*(.+)`))||[])[1]||'').trim();
    const operator=line('Leader')||title.replace(' Insights','');
    const domain=(line('Domain')||'general').split('/').map(s=>slugify(s));
    return {
      id:`ins_${slugify(h||`${slugify(operator)}-${i+1}`)}`,
      operator, role:'Operator', source_title:title, source_url:`${REPO_BASE}/${path}`, source_date:'2026-05-01',
      domain, tier:'A', maturity:(line('Maturity')||'Applied').toLowerCase(),
      claim:get('Claim')||h, mechanism:get('Mechanism')||get('Why it matters'), conditions:get('Apply when')||'context dependent', evidence:get('Evidence signals to track'), signals:get('Evidence signals to track'), counter:get('Don’t apply when')||get('Do not apply when')||'n/a', related:[]
    }
  }).filter(c=>c.claim);
}
async function loadCards(){
  const sets=await Promise.all(FILES.map(async p=>{try{const t=await (await fetch(`../${p}`)).text();return parseInsights(t,p);}catch{return[];}}));
  cards=sets.flat().slice(0,180);
  cards.forEach(c=>{c.related=cards.filter(o=>o!==c&&o.domain.some(d=>c.domain.includes(d))).slice(0,3).map(x=>x.id)});
}
function render(){const r=location.hash.replace('#','')||'/'; if(r==='/') home(); else if(r.startsWith('/ins/')) insight(r.split('/')[2]); else if(r==='/map'||r==='/graph') graph(); else if(r==='/flash') flash(); else if(r==='/carousel') carousel(); else if(r==='/timeline') timeline(); else about(); animate();}
function navModes(){return `<div class='modes'><a href='#/map'>knowledge map</a><a href='#/flash'>flash cards</a><a href='#/carousel'>carousel rail</a><a href='#/timeline'>timeline</a></div>`}
function home(){const domains=[...new Set(cards.flatMap(c=>c.domain))].slice(0,8);app.innerHTML=`<section class='hero reveal'><p class='mono'>operator insight library</p><h1>read one claim. verify source. cite it.</h1><p class='lede'>switch browsing modes depending on task, map for relationships, flash for recall, carousel for scanning, timeline for linear reading.</p>${navModes()}</section><section class='split'><div><h3>latest cards</h3><section class='grid'>${cards.slice(0,10).map(c=>`<a class='card' href='#/ins/${c.id}'><div class='mono'>${c.id}</div><h4>${c.claim}</h4><p>${c.operator}</p></a>`).join('')}</section></div><aside class='panel'><h3>domains</h3>${domains.map(d=>`<a class='chip' href='#/timeline'>${d}</a>`).join('')}<p class='mono'>${cards.length} parsed insights</p></aside></section>`}
function insight(id){const c=cards.find(x=>x.id===id); if(!c){app.textContent='not found';return;} app.innerHTML=`<article class='insight'><section><div class='mono'>${c.id} · tier ${c.tier}</div><h1>${c.claim}</h1><p>${c.operator}. <a class='source-link' href='${c.source_url}' target='_blank'>${c.source_title}</a></p><div class='block'><strong>mechanism</strong><p>${c.mechanism}</p></div><div class='block'><strong>conditions</strong><p>${c.conditions}</p></div><div class='block'><strong>evidence</strong><p>${c.evidence}</p></div><p class='mono'>related: ${c.related.map(r=>`<a href='#/ins/${r}'>${r}</a>`).join(' · ')}</p><button id='citeBtn'>copy citation</button></section><aside class='card'><p>${c.domain.join(' · ')}</p></aside></article>`; document.getElementById('citeBtn').onclick=()=>navigator.clipboard.writeText(`${c.operator}, "${c.source_title}," Source, ${c.source_date}. codex/${c.id}`)}
function flash(){let i=0; app.innerHTML=`${navModes()}<section class='flash card' id='flash'></section><p><button id='prev'>prev</button> <button id='next'>next</button></p>`; const draw=()=>{const c=cards[i];document.getElementById('flash').innerHTML=`<div class='mono'>${i+1}/${cards.length}</div><h3>${c.claim}</h3><p>${c.operator}</p><a href='#/ins/${c.id}'>open</a>`}; draw(); prev.onclick=()=>{i=(i-1+cards.length)%cards.length;draw()}; next.onclick=()=>{i=(i+1)%cards.length;draw()};}
function carousel(){app.innerHTML=`${navModes()}<section class='carousel'>${cards.slice(0,30).map(c=>`<a class='card rail' href='#/ins/${c.id}'><h4>${c.claim}</h4><p>${c.operator}</p></a>`).join('')}</section>`}
function timeline(){app.innerHTML=`${navModes()}<section class='timeline'>${cards.map((c,i)=>`<a class='titem' href='#/ins/${c.id}'><span class='mono'>${String(i+1).padStart(3,'0')}</span><b>${c.claim}</b><em>${c.operator}</em></a>`).join('')}</section>`}
function about(){app.innerHTML=`${navModes()}<h1>about codex</h1>`}
function graph(){
  app.innerHTML=`${navModes()}<section class='graphWrap'><svg id='graph'></svg><aside class='panel'><h3>knowledge map</h3><p>static layout for smooth browsing, no force jitter.</p><p class='mono'>nodes: ${cards.length}</p></aside></section>`;
  const svg=d3.select('#graph');
  const W=Math.max(900,app.clientWidth-340),H=Math.max(620,app.clientHeight-150),cx=W/2,cy=H/2;
  svg.attr('viewBox',`0 0 ${W} ${H}`);
  const domains=[...new Set(cards.flatMap(c=>c.domain))].slice(0,10);
  const ops=[...new Set(cards.map(c=>c.operator))].slice(0,40);
  const domainNodes=domains.map((d,i)=>({id:d,type:'domain',x:cx+Math.cos((i/domains.length)*Math.PI*2)*(Math.min(W,H)*0.16),y:cy+Math.sin((i/domains.length)*Math.PI*2)*(Math.min(W,H)*0.16)}));
  const opNodes=ops.map((o,i)=>({id:o,type:'operator',x:cx+Math.cos((i/ops.length)*Math.PI*2)*(Math.min(W,H)*0.33),y:cy+Math.sin((i/ops.length)*Math.PI*2)*(Math.min(W,H)*0.33)}));
  const insightNodes=cards.slice(0,140).map((c,i)=>({id:c.id,type:'insight',card:c,x:cx+Math.cos((i/Math.max(cards.length,1))*Math.PI*2)*(Math.min(W,H)*0.46),y:cy+Math.sin((i/Math.max(cards.length,1))*Math.PI*2)*(Math.min(W,H)*0.46)}));
  const nodeById=new Map([...domainNodes,...opNodes,...insightNodes].map(n=>[n.id,n]));
  const edges=[];
  cards.slice(0,140).forEach(c=>{ if(nodeById.get(c.id)&&nodeById.get(c.operator)) edges.push({a:c.id,b:c.operator}); c.domain.forEach(d=>{if(nodeById.get(c.id)&&nodeById.get(d)) edges.push({a:c.id,b:d})})});
  svg.append('g').selectAll('line').data(edges).enter().append('line').attr('x1',d=>nodeById.get(d.a).x).attr('y1',d=>nodeById.get(d.a).y).attr('x2',d=>nodeById.get(d.b).x).attr('y2',d=>nodeById.get(d.b).y).attr('stroke','#8f7d6e33').attr('stroke-width',1);
  const all=[...domainNodes,...opNodes,...insightNodes];
  const n=svg.append('g').selectAll('circle').data(all).enter().append('circle').attr('cx',d=>d.x).attr('cy',d=>d.y).attr('r',d=>d.type==='domain'?9:d.type==='operator'?6:3.3).attr('fill',d=>d.type==='domain'?'#9ad4a5':d.type==='operator'?'#6f87b7':'#cb7f46').attr('opacity',d=>d.type==='insight'?0.9:1).on('click',(_,d)=>{if(d.type==='insight')location.hash=`#/ins/${d.id}`;});
  if(!reduced){gsap.to(n.nodes(),{duration:3.6,opacity:(i,_,arr)=>arr[i].__data__.type==='insight'?0.65:1,repeat:-1,yoyo:true,stagger:{each:0.01,from:'random'},ease:'sine.inOut'})}
}
function animate(){if(reduced)return;gsap.from('.reveal,.card,.titem',{y:12,opacity:0,stagger:.03,duration:.6,ease:'power3.out'});}
window.addEventListener('hashchange',render);
loadCards().then(()=>{render();const dlg=document.getElementById('searchDialog');searchOpen.onclick=()=>{dlg.showModal();searchInput.focus()};document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();dlg.showModal();searchInput.focus()}});searchInput.oninput=e=>{const q=e.target.value.toLowerCase();searchResults.innerHTML=cards.filter(c=>`${c.claim} ${c.operator} ${c.domain.join(' ')}`.toLowerCase().includes(q)).slice(0,30).map(c=>`<a href='#/ins/${c.id}' onclick='searchDialog.close()'>${c.claim}<span class='mono'> ${c.operator}</span></a>`).join('')}});
