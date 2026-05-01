// codex frontend — reads canonical INDEX.json + per-card markdown
const REPO_BASE = 'https://github.com/k3sava/codex/blob/main';
const app = document.getElementById('app');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let cards = [];
let operators = [];
let patterns = [];
let contradictions = [];
let playbooks = [];

function slugify(s){return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function operatorSlug(name){return slugify(name);}
function escapeHtml(s){return (s||'').replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

async function loadIndex(){
  const res = await fetch('../insight-library/INDEX.json');
  const data = await res.json();
  cards = (data.insights||[]).map(i => ({
    id: i.id,
    claim: i.title,
    operator: i.operator || 'unknown',
    operator_slug: operatorSlug(i.operator),
    operator_role: i.operator_role || '',
    source_url: i.source_url || '',
    source_title: i.source_title || '',
    source_date: i.source_date || '',
    source_type: i.source_type || '',
    domain: Array.isArray(i.domain) ? i.domain : (i.domain ? [i.domain] : []),
    lifecycle: Array.isArray(i.lifecycle) ? i.lifecycle : (i.lifecycle ? [i.lifecycle] : []),
    tier: i.tier || 'C',
    related: Array.isArray(i.related) ? i.related : [],
    path: i.path,
    raw_ref: i.raw_ref || ''
  }));
  operators = (data.operators||[]).map(o => ({
    name: o.name || o.title || '',
    slug: o.slug || operatorSlug(o.name||o.title||''),
    roles: Array.isArray(o.roles) ? o.roles : [],
    domains_active: Array.isArray(o.domains_active) ? o.domains_active : [],
    path: o.path
  }));
  patterns = (data.patterns||[]).map(p => ({ id:p.id, title:p.title, tier:p.tier, path:p.path, uses_cards:p.uses_cards||[], domains:p.domains||[] }));
  contradictions = (data.contradictions||[]).map(c => ({ id:c.id, title:c.title, path:c.path }));
  playbooks = (data.playbooks||[]).map(p => ({ id:p.id, title:p.title, path:p.path, domain:p.domain||[] }));
}

async function fetchCardBody(path){
  try { const r = await fetch(`../insight-library/${path}`); return await r.text(); } catch { return ''; }
}
function stripFrontmatter(md){ if (md.startsWith('---\n')) { const e = md.indexOf('\n---', 4); if (e>0) return md.slice(e+4).trimStart(); } return md; }
function mdToHtml(md){
  let html = stripFrontmatter(md);
  html = html.replace(/```([\s\S]*?)```/g, (_,c)=>`<pre><code>${escapeHtml(c)}</code></pre>`);
  const lines = html.split('\n');
  const out = []; let inList = false; let inQuote = false;
  const inline = s => s
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  for (const line of lines){
    if (/^#\s+/.test(line)) { if(inList){out.push('</ul>');inList=false;} if(inQuote){out.push('</blockquote>');inQuote=false;} out.push(`<h1>${inline(line.replace(/^#\s+/,''))}</h1>`); continue; }
    if (/^##\s+/.test(line)) { if(inList){out.push('</ul>');inList=false;} if(inQuote){out.push('</blockquote>');inQuote=false;} out.push(`<h2>${inline(line.replace(/^##\s+/,''))}</h2>`); continue; }
    if (/^###\s+/.test(line)) { if(inList){out.push('</ul>');inList=false;} if(inQuote){out.push('</blockquote>');inQuote=false;} out.push(`<h3>${inline(line.replace(/^###\s+/,''))}</h3>`); continue; }
    if (/^>\s?/.test(line)) { if(!inQuote){out.push('<blockquote>');inQuote=true;} out.push(`<p>${inline(line.replace(/^>\s?/,''))}</p>`); continue; } else if (inQuote) { out.push('</blockquote>'); inQuote=false; }
    if (/^[-*]\s+/.test(line)) { if(!inList){out.push('<ul>');inList=true;} out.push(`<li>${inline(line.replace(/^[-*]\s+/,''))}</li>`); continue; }
    if (inList && line.trim()==='') { out.push('</ul>'); inList=false; out.push(''); continue; }
    if (line.trim()==='') { out.push(''); continue; }
    out.push(`<p>${inline(line)}</p>`);
  }
  if (inList) out.push('</ul>');
  if (inQuote) out.push('</blockquote>');
  return out.join('\n');
}

function tierBadge(t){return `<span class="tier tier-${t}">tier ${t}</span>`;}
function navModes(){return `<nav class='modes'><a href='#/'>home</a><a href='#/map'>map</a><a href='#/flash'>flash</a><a href='#/carousel'>carousel</a><a href='#/timeline'>timeline</a><a href='#/operators'>operators</a><a href='#/patterns'>patterns</a><a href='#/about'>about</a></nav>`;}

function cardTile(c){
  return `<a class='card' href='#/ins/${c.id}'>
    <div class='mono'>${tierBadge(c.tier)} · ${c.domain.slice(0,2).join(' · ')}</div>
    <h4>${escapeHtml(c.claim)}</h4>
    <p>${escapeHtml(c.operator)}</p>
  </a>`;
}

function home(){
  const domains = [...new Set(cards.flatMap(c=>c.domain))];
  const tierA = cards.filter(c=>c.tier==='A');
  app.innerHTML = `
    <section class='hero reveal'>
      <p class='mono'>operator insight library · ${cards.length} atomic claims · ${operators.length} operators · ${patterns.length} synthesis patterns</p>
      <h1>read one claim. verify the source. cite it.</h1>
      <p class='lede'>codex is a primary-source corpus of operator-attributed claims across pmm, gtm, ai-native, product, design, leadership. every card carries operator, source url, date, mechanism, conditions, evidence.</p>
      ${navModes()}
    </section>
    <section class='split'>
      <div>
        <h3>tier a — strongest claims (${tierA.length})</h3>
        <div class='grid'>${tierA.slice(0,12).map(c=>cardTile(c)).join('')}</div>
      </div>
      <aside class='panel'>
        <h3>domains</h3>
        <div class='chips'>${domains.map(d=>`<a class='chip' href='#/d/${d}'>${d}</a>`).join('')}</div>
        <h3>synthesis patterns</h3>
        <ul class='thin'>${patterns.slice(0,8).map(p=>`<li><a href='#/pat/${p.id}'>${escapeHtml(p.title||p.id)}</a></li>`).join('')}</ul>
      </aside>
    </section>`;
}

async function insight(id){
  const c = cards.find(x=>x.id===id);
  if (!c){ app.innerHTML = `<p>card not found.</p>`; return; }
  app.innerHTML = `<article class='insight'><section><div class='mono'>${c.id} · ${tierBadge(c.tier)}</div><h1>${escapeHtml(c.claim)}</h1><p class='byline'>${escapeHtml(c.operator)}${c.operator_role?` · <span class='mono'>${escapeHtml(c.operator_role)}</span>`:''}</p><p class='source'>${c.source_url?`<a href='${c.source_url}' target='_blank' rel='noopener'>${escapeHtml(c.source_title||c.source_url)}</a>`:''} ${c.source_date?`· <span class='mono'>${c.source_date}</span>`:''}</p><div id='cardBody'><p class='mono'>loading…</p></div><p><button id='citeBtn'>copy citation</button> <a class='source-link' href='${REPO_BASE}/insight-library/${c.path}' target='_blank' rel='noopener'>view source on github</a></p></section><aside class='card'><h4>meta</h4><p class='mono'>domains: ${c.domain.join(' · ')}</p><p class='mono'>lifecycle: ${c.lifecycle.join(' · ')||'—'}</p><p class='mono'>source: ${c.source_type||'—'}</p><h4>related</h4><ul>${c.related.map(r=>`<li><a href='#/ins/${r}'>${r}</a></li>`).join('')||'<li>—</li>'}</ul><h4>operator</h4><p><a href='#/o/${c.operator_slug}'>${escapeHtml(c.operator)}</a></p></aside></article>`;
  const md = await fetchCardBody(c.path);
  document.getElementById('cardBody').innerHTML = mdToHtml(md);
  document.getElementById('citeBtn').onclick = () => navigator.clipboard.writeText(`${c.operator}, "${c.source_title}," ${c.source_url}, ${c.source_date}. codex/${c.id}`);
}

async function operatorPage(slug){
  const op = operators.find(o=>o.slug===slug) || { name: slug, slug, roles:[], path:`operators/${slug}/README.md`, domains_active:[] };
  const opCards = cards.filter(c => c.operator_slug === slug);
  app.innerHTML = `<article class='operator'><section><div class='mono'>operator</div><h1>${escapeHtml(op.name||slug)}</h1>${op.roles.length?`<p class='roles'>${op.roles.map(r=>`<span class='chip'>${escapeHtml(r)}</span>`).join(' ')}</p>`:''}<div id='opBio'><p class='mono'>loading…</p></div></section><section><h3>cards (${opCards.length})</h3><div class='grid'>${opCards.map(c=>cardTile(c)).join('')||'<p class="mono">no cards yet.</p>'}</div></section></article>`;
  if (op.path){ const md = await fetchCardBody(op.path); document.getElementById('opBio').innerHTML = mdToHtml(md); }
}

function operatorsList(){
  const withCount = operators.map(o => ({...o, count: cards.filter(c=>c.operator_slug===o.slug).length}));
  withCount.sort((a,b)=> b.count - a.count || a.name.localeCompare(b.name));
  app.innerHTML = `${navModes()}<section><h1>operators</h1><p class='lede'>${operators.length} operator profiles. sorted by card count.</p><ul class='oplist'>${withCount.map(o=>`<li><a href='#/o/${o.slug}'><b>${escapeHtml(o.name)}</b><span class='mono'>${o.count} card${o.count===1?'':'s'}</span></a></li>`).join('')}</ul></section>`;
}

function domainPage(d){
  const list = cards.filter(c => c.domain.includes(d));
  app.innerHTML = `${navModes()}<section><div class='mono'>domain</div><h1>${d}</h1><p class='lede'>${list.length} cards.</p><div class='grid'>${list.map(c=>cardTile(c)).join('')}</div></section>`;
}

async function patternPage(id){
  const p = patterns.find(x=>x.id===id);
  if (!p){ app.innerHTML = `<p>pattern not found.</p>`; return; }
  app.innerHTML = `<article class='pattern'><section><div class='mono'>synthesis pattern · ${p.tier?`tier ${p.tier}`:''}</div><h1>${escapeHtml(p.title)}</h1><div id='patBody'><p class='mono'>loading…</p></div></section></article>`;
  const md = await fetchCardBody(p.path);
  document.getElementById('patBody').innerHTML = mdToHtml(md);
}

function patternsList(){
  app.innerHTML = `${navModes()}<section><h1>synthesis patterns</h1><p class='lede'>cross-operator convergences. ${patterns.length} patterns surfaced from ${cards.length} cards.</p><div class='grid'>${patterns.map(p=>`<a class='card' href='#/pat/${p.id}'><div class='mono'>${p.tier?`tier ${p.tier}`:''} · ${(p.domains||[]).slice(0,2).join(' · ')}</div><h4>${escapeHtml(p.title)}</h4><p class='mono'>${(p.uses_cards||[]).length} cards converge</p></a>`).join('')}</div></section>${contradictions.length?`<section><h2>contradictions (${contradictions.length})</h2><ul>${contradictions.map(c=>`<li><a href='#/con/${c.id}'>${escapeHtml(c.title)}</a></li>`).join('')}</ul></section>`:''}`;
}

async function contradictionPage(id){
  const c = contradictions.find(x=>x.id===id);
  if (!c){ app.innerHTML = `<p>not found.</p>`; return; }
  app.innerHTML = `<article class='pattern'><section><div class='mono'>contradiction</div><h1>${escapeHtml(c.title)}</h1><div id='conBody'><p class='mono'>loading…</p></div></section></article>`;
  const md = await fetchCardBody(c.path);
  document.getElementById('conBody').innerHTML = mdToHtml(md);
}

function flash(){
  let i = 0;
  app.innerHTML = `${navModes()}<section class='flash card' id='flash'></section><p class='controls'><button id='prev'>prev</button> <button id='next'>next</button> <button id='shuffle'>shuffle</button></p>`;
  const draw = () => { const c = cards[i]; document.getElementById('flash').innerHTML = `<div class='mono'>${i+1}/${cards.length} · ${tierBadge(c.tier)}</div><h2>${escapeHtml(c.claim)}</h2><p class='byline'>${escapeHtml(c.operator)}</p><p><a href='#/ins/${c.id}'>open card →</a></p>`; };
  draw();
  document.getElementById('prev').onclick = ()=>{ i=(i-1+cards.length)%cards.length; draw(); };
  document.getElementById('next').onclick = ()=>{ i=(i+1)%cards.length; draw(); };
  document.getElementById('shuffle').onclick = ()=>{ i = Math.floor(Math.random()*cards.length); draw(); };
}
function carousel(){
  app.innerHTML = `${navModes()}<section class='carousel'>${cards.map(c=>`<a class='card rail' href='#/ins/${c.id}'><div class='mono'>${tierBadge(c.tier)}</div><h4>${escapeHtml(c.claim)}</h4><p>${escapeHtml(c.operator)}</p></a>`).join('')}</section>`;
}
function timeline(){
  const sorted = [...cards].sort((a,b)=> (b.source_date||'').localeCompare(a.source_date||''));
  app.innerHTML = `${navModes()}<section class='timeline'>${sorted.map(c=>`<a class='titem' href='#/ins/${c.id}'><span class='mono'>${c.source_date||'—'}</span><b>${escapeHtml(c.claim)}</b><em>${escapeHtml(c.operator)}</em></a>`).join('')}</section>`;
}
function about(){
  app.innerHTML = `${navModes()}<section><h1>about codex</h1><p class='lede'>a primary-source operator-attributed insight library. every claim traces to a named operator, a verifiable source url, a date.</p><ul><li>${cards.length} insight cards</li><li>${operators.length} operator profiles</li><li>${patterns.length} synthesis patterns</li><li>${contradictions.length} surfaced contradictions</li><li>${playbooks.length} methodology playbooks</li></ul><p>source on <a href='https://github.com/k3sava/codex' target='_blank' rel='noopener'>github</a>.</p></section>`;
}

function graph(){
  app.innerHTML = `${navModes()}<section class='graphWrap'><svg id='graph'></svg><aside class='panel'><h3>knowledge map</h3><p>operators ring outside, domains in center, insights orbit between. click a node to open.</p><p class='mono'>${cards.length} cards · ${operators.length} operators</p></aside></section>`;
  const svg = d3.select('#graph');
  const W = Math.max(1000, app.clientWidth-340), H = Math.max(700, app.clientHeight-150);
  svg.attr('viewBox', `0 0 ${W} ${H}`);
  const cx = W/2, cy = H/2;
  const domains = [...new Set(cards.flatMap(c=>c.domain))];
  const ops = [...new Set(cards.map(c=>c.operator))].slice(0,80);
  const dNodes = domains.map((d,i)=>({id:'d:'+d, label:d, type:'domain', x: cx + Math.cos(i/domains.length*Math.PI*2)*Math.min(W,H)*0.18, y: cy + Math.sin(i/domains.length*Math.PI*2)*Math.min(W,H)*0.18}));
  const oNodes = ops.map((o,i)=>({id:'o:'+o, label:o, type:'operator', slug:operatorSlug(o), x: cx + Math.cos(i/ops.length*Math.PI*2)*Math.min(W,H)*0.42, y: cy + Math.sin(i/ops.length*Math.PI*2)*Math.min(W,H)*0.42}));
  const iNodes = cards.map((c,i)=>({id:'i:'+c.id, card:c, type:'insight', x: cx + Math.cos(i/cards.length*Math.PI*2)*Math.min(W,H)*0.30 + (Math.random()-0.5)*20, y: cy + Math.sin(i/cards.length*Math.PI*2)*Math.min(W,H)*0.30 + (Math.random()-0.5)*20}));
  const all = [...dNodes, ...oNodes, ...iNodes];
  const idx = new Map(all.map(n=>[n.id,n]));
  const edges = [];
  cards.forEach(c => { const ci = idx.get('i:'+c.id); const co = idx.get('o:'+c.operator); if (ci && co) edges.push({a:ci, b:co}); c.domain.forEach(d => { const cd = idx.get('d:'+d); if (ci && cd) edges.push({a:ci, b:cd}); }); });
  svg.append('g').attr('class','edges').selectAll('line').data(edges).enter().append('line').attr('x1',d=>d.a.x).attr('y1',d=>d.a.y).attr('x2',d=>d.b.x).attr('y2',d=>d.b.y).attr('stroke','#8f7d6e22').attr('stroke-width',0.7);
  const g = svg.append('g').attr('class','nodes').selectAll('g').data(all).enter().append('g').attr('transform',d=>`translate(${d.x},${d.y})`).style('cursor','pointer').on('click',(_,d)=>{ if (d.type==='insight') location.hash = `#/ins/${d.card.id}`; else if (d.type==='operator') location.hash = `#/o/${d.slug}`; else if (d.type==='domain') location.hash = `#/d/${d.label}`; });
  g.append('circle').attr('r',d=>d.type==='domain'?12:d.type==='operator'?6:2.6).attr('fill',d=>d.type==='domain'?'#9ad4a5':d.type==='operator'?'#6f87b7':'#cb7f46').attr('opacity',d=>d.type==='insight'?0.85:1);
  g.filter(d=>d.type!=='insight').append('text').attr('dy',d=>d.type==='domain'?-16:-10).attr('text-anchor','middle').attr('font-size',d=>d.type==='domain'?12:10).attr('fill','#3a2e25').text(d=>d.label);
  if (!reduced) gsap.from(g.nodes(), { opacity:0, scale:0, duration:0.8, stagger:{each:0.002, from:'random'}, ease:'power3.out', transformOrigin:'center' });
}

function render(){
  const r = (location.hash || '#/').replace(/^#/,'');
  if (r==='/' || r==='') return home();
  if (r.startsWith('/ins/')) return insight(decodeURIComponent(r.slice(5)));
  if (r.startsWith('/o/')) return operatorPage(decodeURIComponent(r.slice(3)));
  if (r==='/operators') return operatorsList();
  if (r.startsWith('/d/')) return domainPage(decodeURIComponent(r.slice(3)));
  if (r==='/patterns') return patternsList();
  if (r.startsWith('/pat/')) return patternPage(decodeURIComponent(r.slice(5)));
  if (r.startsWith('/con/')) return contradictionPage(decodeURIComponent(r.slice(5)));
  if (r==='/map' || r==='/graph') return graph();
  if (r==='/flash') return flash();
  if (r==='/carousel') return carousel();
  if (r==='/timeline') return timeline();
  if (r==='/about') return about();
  return about();
}

function wireSearch(){
  const dlg = document.getElementById('searchDialog');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  document.getElementById('searchOpen').onclick = ()=>{ dlg.showModal(); input.focus(); };
  document.addEventListener('keydown', e => { if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); dlg.showModal(); input.focus(); } if (e.key==='Escape' && dlg.open) dlg.close(); });
  input.oninput = e => {
    const q = e.target.value.toLowerCase();
    if (!q){ results.innerHTML = ''; return; }
    const cardHits = cards.filter(c=>`${c.claim} ${c.operator} ${c.domain.join(' ')}`.toLowerCase().includes(q)).slice(0,15);
    const opHits = operators.filter(o=>o.name.toLowerCase().includes(q)).slice(0,5);
    const patHits = patterns.filter(p=>(p.title||'').toLowerCase().includes(q)).slice(0,5);
    results.innerHTML = [
      ...cardHits.map(c=>`<a href='#/ins/${c.id}' onclick='searchDialog.close()'><b>${escapeHtml(c.claim)}</b><span class='mono'>${escapeHtml(c.operator)}</span></a>`),
      ...opHits.map(o=>`<a href='#/o/${o.slug}' onclick='searchDialog.close()'><b>${escapeHtml(o.name)}</b><span class='mono'>operator</span></a>`),
      ...patHits.map(p=>`<a href='#/pat/${p.id}' onclick='searchDialog.close()'><b>${escapeHtml(p.title)}</b><span class='mono'>pattern</span></a>`)
    ].join('');
  };
}

window.addEventListener('hashchange', render);
loadIndex().then(() => { render(); wireSearch(); }).catch(e => { app.innerHTML = `<p>failed to load index. ${escapeHtml(e.message)}</p>`; });
