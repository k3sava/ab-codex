// codex frontend — primary-source operator insight library
const REPO_BASE = 'https://github.com/k3sava/codex/blob/main';
const app = document.getElementById('app');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.registerPlugin(ScrollTrigger);

let cards = [], operators = [], patterns = [], contradictions = [], playbooks = [];
let STATS = {};   // single source of truth — comes from INDEX.json `counts`
let DOMAINS = []; // sorted unique domain list

const slugify = s => (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const escapeHtml = s => (s||'').replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tierBadge = t => `<span class="tier tier-${t}">tier ${t}</span>`;

async function loadIndex(){
  const res = await fetch('insight-library/INDEX.json');
  const data = await res.json();
  cards = (data.insights||[]).map(i => ({
    id:i.id, claim:i.title, operator:i.operator||'unknown', operator_slug:slugify(i.operator),
    operator_role:i.operator_role||'', source_url:i.source_url||'', source_title:i.source_title||'',
    source_date:i.source_date||'', source_type:i.source_type||'',
    domain:Array.isArray(i.domain)?i.domain:(i.domain?[i.domain]:[]),
    lifecycle:Array.isArray(i.lifecycle)?i.lifecycle:(i.lifecycle?[i.lifecycle]:[]),
    tier:i.tier||'C', related:Array.isArray(i.related)?i.related:[], path:i.path
  }));
  operators = (data.operators||[]).map(o => ({
    name:o.name||o.title||'', slug:o.slug||slugify(o.name||o.title||''),
    roles:Array.isArray(o.roles)?o.roles:[],
    domains_active:Array.isArray(o.domains_active)?o.domains_active:[], path:o.path
  }));
  patterns = (data.patterns||[]).map(p => ({ id:p.id, title:p.title, tier:p.tier, path:p.path, uses_cards:p.uses_cards||[], domains:p.domains||[] }));
  contradictions = (data.contradictions||[]).map(c => ({ id:c.id, title:c.title, path:c.path }));
  playbooks = (data.playbooks||[]).map(p => ({ id:p.id, title:p.title, path:p.path, domain:p.domain||[] }));

  DOMAINS = [...new Set(cards.flatMap(c=>c.domain))].sort();

  // Single source of truth for all UI counts
  const counts = data.counts || {};
  STATS = {
    cards: counts.insights ?? cards.length,
    operators: counts.operators ?? operators.length,
    patterns: counts.patterns ?? patterns.length,
    contradictions: counts.contradictions ?? contradictions.length,
    playbooks: counts.playbooks ?? playbooks.length,
    domains: DOMAINS.length,
    raw: counts.raw_sources ?? 0,
    tierA: cards.filter(c=>c.tier==='A').length,
  };
}

async function fetchBody(path){
  try { const r = await fetch(`insight-library/${path}`); return await r.text(); } catch { return ''; }
}
function stripFrontmatter(md){ if (md.startsWith('---\n')){ const e = md.indexOf('\n---',4); if (e>0) return md.slice(e+4).trimStart(); } return md; }
function mdToHtml(md){
  let html = stripFrontmatter(md);
  html = html.replace(/```([\s\S]*?)```/g, (_,c)=>`<pre><code>${escapeHtml(c)}</code></pre>`);
  const lines = html.split('\n');
  const out=[]; let inList=false, inQuote=false;
  const inline = s => s
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  for (const line of lines){
    if (/^#\s+/.test(line)){ if(inList){out.push('</ul>');inList=false;} if(inQuote){out.push('</blockquote>');inQuote=false;} out.push(`<h1>${inline(line.replace(/^#\s+/,''))}</h1>`); continue; }
    if (/^##\s+/.test(line)){ if(inList){out.push('</ul>');inList=false;} if(inQuote){out.push('</blockquote>');inQuote=false;} out.push(`<h2>${inline(line.replace(/^##\s+/,''))}</h2>`); continue; }
    if (/^###\s+/.test(line)){ if(inList){out.push('</ul>');inList=false;} if(inQuote){out.push('</blockquote>');inQuote=false;} out.push(`<h3>${inline(line.replace(/^###\s+/,''))}</h3>`); continue; }
    if (/^>\s?/.test(line)){ if(!inQuote){out.push('<blockquote>');inQuote=true;} out.push(`<p>${inline(line.replace(/^>\s?/,''))}</p>`); continue; } else if (inQuote){ out.push('</blockquote>'); inQuote=false; }
    if (/^[-*]\s+/.test(line)){ if(!inList){out.push('<ul>');inList=true;} out.push(`<li>${inline(line.replace(/^[-*]\s+/,''))}</li>`); continue; }
    if (inList && line.trim()===''){ out.push('</ul>'); inList=false; out.push(''); continue; }
    if (line.trim()===''){ out.push(''); continue; }
    out.push(`<p>${inline(line)}</p>`);
  }
  if (inList) out.push('</ul>');
  if (inQuote) out.push('</blockquote>');
  return out.join('\n');
}

function cardTile(c){
  return `<a class='card reveal' href='#/ins/${c.id}'>
    <div class='meta-row'>${tierBadge(c.tier)}<span>${c.domain.slice(0,2).join(' · ')}</span></div>
    <h3>${escapeHtml(c.claim)}</h3>
    <div class='by'>${escapeHtml(c.operator)}</div>
  </a>`;
}

/* ============ HOME ============ */
function home(){
  const tierA = cards.filter(c=>c.tier==='A');
  app.innerHTML = `
    <section class='hero'>
      <p class='eyebrow'>operator insight library</p>
      <h1 id='heroH'>read one claim. <em>verify</em> the source. cite it.</h1>
      <p class='lede'>codex is a primary-source corpus of operator-attributed claims across product, pmm, gtm, ai-native, design, and leadership. every card carries a named operator, source url, date, mechanism, conditions, and evidence.</p>
      <div class='stats'>
        <div class='stat'><span class='num' data-count='${STATS.cards}'>0</span><span class='lbl'>insight cards</span></div>
        <div class='stat'><span class='num' data-count='${STATS.operators}'>0</span><span class='lbl'>operators</span></div>
        <div class='stat'><span class='num' data-count='${STATS.patterns}'>0</span><span class='lbl'>patterns</span></div>
        <div class='stat'><span class='num' data-count='${STATS.contradictions}'>0</span><span class='lbl'>contradictions</span></div>
        <div class='stat'><span class='num' data-count='${STATS.playbooks}'>0</span><span class='lbl'>playbooks</span></div>
      </div>
      <div class='scroll-cue' id='scrollCue'><span>scroll</span><span class='line'></span></div>
    </section>

    <section class='section' id='tier-a-section'>
      <div class='section-head'>
        <div>
          <h2>Tier A — strongest claims</h2>
          <p>The corpus's highest-confidence operator-attributed insights.</p>
        </div>
        <div class='meta'>${STATS.tierA} cards · view all in <a href='#/browse'>browse</a></div>
      </div>
      <div class='card-grid'>${tierA.slice(0,12).map(cardTile).join('')}</div>
    </section>

    <section class='section'>
      <div class='section-head'>
        <div>
          <h2>Synthesis patterns</h2>
          <p>Where three or more operators converge from different angles. The strongest signal in the corpus.</p>
        </div>
        <div class='meta'>${STATS.patterns} patterns</div>
      </div>
      <div class='card-grid'>${patterns.slice(0,8).map(p=>`
        <a class='card pattern reveal' href='#/pat/${p.id}'>
          <div class='meta-row'>${p.tier?tierBadge(p.tier):''}<span>${(p.domains||[]).slice(0,2).join(' · ')}</span></div>
          <h3>${escapeHtml(p.title)}</h3>
          <div class='converge'>${(p.uses_cards||[]).length} operators converge</div>
        </a>`).join('')}</div>
    </section>

    <section class='section'>
      <div class='section-head'>
        <div>
          <h2>Domains</h2>
          <p>Filter the corpus by topic surface.</p>
        </div>
        <div class='meta'>${STATS.domains} domains</div>
      </div>
      <div class='chips reveal'>${DOMAINS.map(d=>{
        const ct = cards.filter(c=>c.domain.includes(d)).length;
        return `<a class='chip' href='#/d/${d}'>${d}<span class='ct'>${ct}</span></a>`;
      }).join('')}</div>
    </section>
  `;
  animateHome();
}

function animateHome(){
  if (reduced) return;
  const h = document.getElementById('heroH');
  if (h){
    h.innerHTML = h.innerHTML.replace(/(\S+)/g, '<span class="word">$1</span>');
    gsap.from('.hero .word', { y:'1.1em', opacity:0, duration:1, ease:'power3.out', stagger:.04, delay:.1 });
    gsap.from('.hero .eyebrow', { opacity:0, y:8, duration:.8, ease:'power2.out' });
    gsap.from('.hero .lede', { opacity:0, y:14, duration:.9, ease:'power2.out', delay:.5 });
  }
  document.querySelectorAll('.hero .num').forEach(el => {
    const target = +el.dataset.count;
    gsap.to({n:0}, {
      n: target, duration: 1.6, ease:'power2.out', delay:.3,
      onUpdate(){ el.textContent = Math.round(this.targets()[0].n); }
    });
  });
  gsap.from('.hero .stats', { opacity:0, y:24, duration:.8, ease:'power2.out', delay:.6 });
  gsap.fromTo('#scrollCue', { opacity:0 }, { opacity:.6, duration:.6, delay:1.4 });
  gsap.to('#scrollCue', { opacity:0, scrollTrigger:{ trigger:'.hero', start:'bottom 80%', scrub:true } });
  ScrollTrigger.batch('.section-head', {
    onEnter: els => gsap.fromTo(els, { opacity:0, y:24 }, { opacity:1, y:0, duration:.7, ease:'power3.out', stagger:.08 }),
    start:'top 85%'
  });
  ScrollTrigger.batch('.reveal', {
    onEnter: els => gsap.fromTo(els, { opacity:0, y:18 }, { opacity:1, y:0, duration:.7, ease:'power3.out', stagger:.04 }),
    start:'top 92%'
  });
}

/* ============ INSIGHT ============ */
async function insight(id){
  const c = cards.find(x=>x.id===id);
  if (!c){ app.innerHTML = `<div class='insight-page'><p>card not found.</p></div>`; return; }
  app.innerHTML = `<article class='insight-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/operators'>operators</a> <span>·</span> <a href='#/o/${c.operator_slug}'>${escapeHtml(c.operator)}</a> <span>·</span> <span>${c.id}</span></div>
    <div class='layout'>
      <div>
        <div class='meta-row' style='margin-bottom:14px;font-family:var(--mono);font-size:.7rem;color:var(--muted);display:flex;gap:10px;align-items:center;flex-wrap:wrap'>${tierBadge(c.tier)}<span>${c.domain.join(' · ')}</span></div>
        <h1>${escapeHtml(c.claim)}</h1>
        <p class='byline'>${escapeHtml(c.operator)}${c.operator_role?`<span class='role'>${escapeHtml(c.operator_role)}</span>`:''}</p>
        <p class='source'>${c.source_url?`<a href='${c.source_url}' target='_blank' rel='noopener'>${escapeHtml(c.source_title||c.source_url)}</a>`:''} ${c.source_date?`<span>·</span><span>${c.source_date}</span>`:''} ${c.source_type?`<span>·</span><span>${c.source_type}</span>`:''}</p>
        <div class='body' id='cardBody'><p style='color:var(--muted);font-family:var(--mono);font-size:.8rem'>loading…</p></div>
        <div class='actions'>
          <button class='btn' id='citeBtn'>copy citation</button>
          <a class='btn ghost' href='${REPO_BASE}/insight-library/${c.path}' target='_blank' rel='noopener'>view source</a>
        </div>
      </div>
      <aside>
        <div class='card-meta'>
          <h4>operator</h4>
          <p style='margin-bottom:4px'><a href='#/o/${c.operator_slug}' style='border-bottom:1px solid var(--line)'>${escapeHtml(c.operator)}</a></p>
          ${c.operator_role?`<p style='font-family:var(--mono);font-size:.7rem;color:var(--muted)'>${escapeHtml(c.operator_role)}</p>`:''}
          <h4>lifecycle</h4>
          <p style='font-family:var(--mono);font-size:.75rem;color:var(--muted)'>${c.lifecycle.join(' · ')||'—'}</p>
          <h4>related</h4>
          <ul>${c.related.length?c.related.map(r=>`<li><a href='#/ins/${r}'>${r.replace(/^ins_/,'').replace(/-/g,' ')}</a></li>`).join(''):'<li style="color:var(--muted)">none yet</li>'}</ul>
        </div>
      </aside>
    </div>
  </article>`;
  const md = await fetchBody(c.path);
  document.getElementById('cardBody').innerHTML = mdToHtml(md);
  document.getElementById('citeBtn').onclick = () => {
    navigator.clipboard.writeText(`${c.operator}, "${c.source_title}," ${c.source_url}, ${c.source_date}. codex/${c.id}`);
    const b = document.getElementById('citeBtn'); const t = b.textContent; b.textContent = 'copied'; setTimeout(()=>b.textContent=t, 1400);
  };
  if (!reduced) gsap.from('.insight-page > .layout > div > *, .insight-page aside', { opacity:0, y:18, duration:.7, ease:'power3.out', stagger:.05 });
}

/* ============ OPERATOR ============ */
async function operatorPage(slug){
  const op = operators.find(o=>o.slug===slug) || { name:slug, slug, roles:[], path:`operators/${slug}/README.md`, domains_active:[] };
  const opCards = cards.filter(c => c.operator_slug === slug);
  app.innerHTML = `<article class='operator-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/operators'>operators</a> <span>·</span> <span>${escapeHtml(op.name||slug)}</span></div>
    <h1>${escapeHtml(op.name||slug)}</h1>
    ${op.roles.length?`<div class='roles'>${op.roles.map(r=>`<span class='chip'>${escapeHtml(r)}</span>`).join('')}</div>`:''}
    <div class='body' id='opBio'><p style='color:var(--muted);font-family:var(--mono);font-size:.8rem'>loading…</p></div>
    <div class='cards-head'>${opCards.length} card${opCards.length===1?'':'s'}</div>
    <div class='card-grid'>${opCards.map(cardTile).join('')||'<p style="color:var(--muted)">no cards yet — see operator file for sources.</p>'}</div>
  </article>`;
  if (op.path){ const md = await fetchBody(op.path); document.getElementById('opBio').innerHTML = mdToHtml(md); }
  if (!reduced) gsap.from('.operator-page > *', { opacity:0, y:18, duration:.6, ease:'power3.out', stagger:.05 });
}

/* ============ OPERATORS LIST ============ */
function operatorsList(){
  const withCount = operators.map(o => ({...o, count: cards.filter(c=>c.operator_slug===o.slug).length}));
  withCount.sort((a,b) => b.count - a.count || a.name.localeCompare(b.name));
  app.innerHTML = `<section class='list-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>operators</span></div>
    <h1>operators</h1>
    <p class='lede'>${STATS.operators} profiles. ${withCount.filter(o=>o.count>0).length} have cards. Sorted by card count.</p>
    <div class='op-grid'>${withCount.map(o=>`
      <a class='op-card reveal' href='#/o/${o.slug}'>
        <span class='nm'>${escapeHtml(o.name)}</span>
        <span class='ct'>${o.count} card${o.count===1?'':'s'}</span>
      </a>`).join('')}</div>
  </section>`;
  if (!reduced) ScrollTrigger.batch('.op-card.reveal', {
    onEnter: els => gsap.fromTo(els, { opacity:0, y:14 }, { opacity:1, y:0, duration:.5, ease:'power2.out', stagger:.012 }),
    start:'top 95%'
  });
}

/* ============ DOMAIN ============ */
function domainPage(d){
  const list = cards.filter(c => c.domain.includes(d));
  app.innerHTML = `<section class='list-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>domain · ${d}</span></div>
    <h1>${d}</h1>
    <p class='lede'>${list.length} cards in ${d}.</p>
    <div class='card-grid'>${list.map(cardTile).join('')}</div>
  </section>`;
  if (!reduced) ScrollTrigger.batch('.card.reveal', {
    onEnter: els => gsap.fromTo(els, { opacity:0, y:18 }, { opacity:1, y:0, duration:.6, ease:'power3.out', stagger:.03 }),
    start:'top 92%'
  });
}

/* ============ PATTERNS ============ */
function patternsList(){
  app.innerHTML = `<section class='list-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>patterns</span></div>
    <h1>synthesis patterns</h1>
    <p class='lede'>Cross-operator convergences. ${STATS.patterns} patterns surfaced from ${STATS.cards} cards.</p>
    <div class='card-grid'>${patterns.map(p=>`
      <a class='card pattern reveal' href='#/pat/${p.id}'>
        <div class='meta-row'>${p.tier?tierBadge(p.tier):''}<span>${(p.domains||[]).slice(0,2).join(' · ')}</span></div>
        <h3>${escapeHtml(p.title)}</h3>
        <div class='converge'>${(p.uses_cards||[]).length} operators converge</div>
      </a>`).join('')}</div>
    ${contradictions.length?`<div class='cards-head' style='margin-top:64px;margin-bottom:18px'>contradictions (${STATS.contradictions})</div>
      <div class='card-grid'>${contradictions.map(c=>`<a class='card reveal' href='#/con/${c.id}'><div class='meta-row'><span>contradiction</span></div><h3>${escapeHtml(c.title)}</h3></a>`).join('')}</div>`:''}
  </section>`;
  if (!reduced) ScrollTrigger.batch('.card.reveal', {
    onEnter: els => gsap.fromTo(els, { opacity:0, y:18 }, { opacity:1, y:0, duration:.6, ease:'power3.out', stagger:.03 }),
    start:'top 92%'
  });
}

async function patternPage(id){
  const p = patterns.find(x=>x.id===id);
  if (!p){ app.innerHTML = `<div class='insight-page'><p>pattern not found.</p></div>`; return; }
  app.innerHTML = `<article class='insight-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/patterns'>patterns</a> <span>·</span> <span>${p.id}</span></div>
    <div class='layout'>
      <div>
        <div class='meta-row' style='margin-bottom:14px;font-family:var(--mono);font-size:.7rem;color:var(--muted);display:flex;gap:10px;flex-wrap:wrap'>${p.tier?tierBadge(p.tier):''}<span>${(p.domains||[]).join(' · ')}</span></div>
        <h1>${escapeHtml(p.title)}</h1>
        <p class='source'>${(p.uses_cards||[]).length} operators converge</p>
        <div class='body' id='patBody'><p style='color:var(--muted);font-family:var(--mono);font-size:.8rem'>loading…</p></div>
      </div>
      <aside><div class='card-meta'>
        <h4>cards in this pattern</h4>
        <ul>${(p.uses_cards||[]).map(id=>{const c=cards.find(x=>x.id===id); return c?`<li><a href='#/ins/${id}'>${escapeHtml(c.claim)}</a></li>`:`<li>${id}</li>`;}).join('')}</ul>
      </div></aside>
    </div>
  </article>`;
  const md = await fetchBody(p.path);
  document.getElementById('patBody').innerHTML = mdToHtml(md);
  if (!reduced) gsap.from('.insight-page > .layout > div > *, .insight-page aside', { opacity:0, y:18, duration:.6, ease:'power3.out', stagger:.05 });
}

async function contradictionPage(id){
  const c = contradictions.find(x=>x.id===id);
  if (!c){ app.innerHTML = `<div class='insight-page'><p>not found.</p></div>`; return; }
  app.innerHTML = `<article class='insight-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/patterns'>patterns</a> <span>·</span> <span>contradiction</span></div>
    <div class='layout'>
      <div>
        <div class='meta-row' style='margin-bottom:14px;font-family:var(--mono);font-size:.7rem;color:var(--muted)'>contradiction</div>
        <h1>${escapeHtml(c.title)}</h1>
        <div class='body' id='conBody'><p style='color:var(--muted);font-family:var(--mono);font-size:.8rem'>loading…</p></div>
      </div>
      <aside></aside>
    </div>
  </article>`;
  const md = await fetchBody(c.path);
  document.getElementById('conBody').innerHTML = mdToHtml(md);
}

/* ============ FLASH ============ */
function flash(){
  let i = Math.floor(Math.random()*cards.length);
  app.innerHTML = `<section class='flash-page'>
    <div class='flash-card' id='flash'></div>
    <div class='flash-controls'>
      <button class='btn ghost' id='prev'>← prev</button>
      <button class='btn ghost' id='shuffle'>shuffle</button>
      <button class='btn ghost' id='next'>next →</button>
    </div>
  </section>`;
  const draw = () => {
    const c = cards[i];
    document.getElementById('flash').innerHTML = `
      <div class='stage'><span>${i+1}/${STATS.cards}</span><span>·</span>${tierBadge(c.tier)}<span>·</span><span>${c.domain.slice(0,2).join(' · ')}</span></div>
      <h2>${escapeHtml(c.claim)}</h2>
      <p class='who'>${escapeHtml(c.operator)}</p>
      <p><a class='btn' href='#/ins/${c.id}'>open card →</a></p>`;
    if (!reduced) gsap.from('#flash > *', { opacity:0, y:14, duration:.5, ease:'power2.out', stagger:.05 });
  };
  draw();
  document.getElementById('prev').onclick = ()=>{ i = (i-1+cards.length) % cards.length; draw(); };
  document.getElementById('next').onclick = ()=>{ i = (i+1) % cards.length; draw(); };
  document.getElementById('shuffle').onclick = ()=>{ i = Math.floor(Math.random()*cards.length); draw(); };
  document.addEventListener('keydown', e => { if(e.key==='ArrowLeft') document.getElementById('prev')?.click(); if(e.key==='ArrowRight') document.getElementById('next')?.click(); if(e.key===' '){e.preventDefault(); document.getElementById('shuffle')?.click();} });
}

/* ============ BROWSE (filterable grid) ============ */
const browseState = { tier:'all', domain:'all', sort:'date', q:'' };
function browse(){
  app.innerHTML = `<section class='browse-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>browse</span></div>
    <h1>browse</h1>
    <p class='lede'>${STATS.cards} cards across ${STATS.domains} domains. Filter by tier or topic, sort by date, operator, or tier.</p>
    <div class='filterbar' id='filterbar'>
      <div class='row'>
        <span class='label'>tier</span>
        <button class='chip ${browseState.tier==='all'?'active':''}' data-tier='all'>all<span class='ct'>${STATS.cards}</span></button>
        <button class='chip ${browseState.tier==='A'?'active':''}' data-tier='A'>A<span class='ct'>${cards.filter(c=>c.tier==='A').length}</span></button>
        <button class='chip ${browseState.tier==='B'?'active':''}' data-tier='B'>B<span class='ct'>${cards.filter(c=>c.tier==='B').length}</span></button>
        <button class='chip ${browseState.tier==='C'?'active':''}' data-tier='C'>C<span class='ct'>${cards.filter(c=>c.tier==='C').length}</span></button>
        <span class='label' style='margin-left:auto'>sort</span>
        <button class='chip ${browseState.sort==='date'?'active':''}' data-sort='date'>date</button>
        <button class='chip ${browseState.sort==='operator'?'active':''}' data-sort='operator'>operator</button>
        <button class='chip ${browseState.sort==='tier'?'active':''}' data-sort='tier'>tier</button>
      </div>
      <div class='row'>
        <span class='label'>domain</span>
        <button class='chip ${browseState.domain==='all'?'active':''}' data-domain='all'>all</button>
        ${DOMAINS.map(d=>{
          const ct = cards.filter(c=>c.domain.includes(d)).length;
          return `<button class='chip ${browseState.domain===d?'active':''}' data-domain='${d}'>${d}<span class='ct'>${ct}</span></button>`;
        }).join('')}
        <span class='results' id='browseResults'></span>
      </div>
    </div>
    <div class='browse-grid' id='browseGrid'></div>
  </section>`;
  applyBrowse();

  document.querySelectorAll('#filterbar [data-tier]').forEach(b => b.onclick = () => { browseState.tier = b.dataset.tier; updateBrowse(); });
  document.querySelectorAll('#filterbar [data-domain]').forEach(b => b.onclick = () => { browseState.domain = b.dataset.domain; updateBrowse(); });
  document.querySelectorAll('#filterbar [data-sort]').forEach(b => b.onclick = () => { browseState.sort = b.dataset.sort; updateBrowse(); });
}

function applyBrowse(){
  let list = cards.slice();
  if (browseState.tier !== 'all') list = list.filter(c => c.tier === browseState.tier);
  if (browseState.domain !== 'all') list = list.filter(c => c.domain.includes(browseState.domain));
  if (browseState.sort === 'date') list.sort((a,b) => (b.source_date||'').localeCompare(a.source_date||''));
  else if (browseState.sort === 'operator') list.sort((a,b) => a.operator.localeCompare(b.operator));
  else if (browseState.sort === 'tier') list.sort((a,b) => a.tier.localeCompare(b.tier));
  const grid = document.getElementById('browseGrid');
  const results = document.getElementById('browseResults');
  if (!grid) return;
  results.textContent = `${list.length} of ${STATS.cards} cards`;
  if (list.length === 0){
    grid.outerHTML = `<div class='browse-empty'>no cards match these filters.</div>`;
  } else {
    grid.innerHTML = list.map(cardTile).join('');
    if (!reduced) ScrollTrigger.batch('.browse-grid .card.reveal', {
      onEnter: els => gsap.fromTo(els, { opacity:0, y:14 }, { opacity:1, y:0, duration:.5, ease:'power2.out', stagger:.015 }),
      start:'top 95%'
    });
  }
}

function updateBrowse(){
  document.querySelectorAll('#filterbar [data-tier]').forEach(b => b.classList.toggle('active', b.dataset.tier === browseState.tier));
  document.querySelectorAll('#filterbar [data-domain]').forEach(b => b.classList.toggle('active', b.dataset.domain === browseState.domain));
  document.querySelectorAll('#filterbar [data-sort]').forEach(b => b.classList.toggle('active', b.dataset.sort === browseState.sort));
  // Re-render grid in place if it exists; otherwise re-mount
  if (!document.getElementById('browseGrid')){ browse(); return; }
  applyBrowse();
}

/* ============ TIMELINE ============ */
function timeline(){
  const sorted = [...cards].sort((a,b)=> (b.source_date||'').localeCompare(a.source_date||''));
  app.innerHTML = `<section class='timeline-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>timeline</span></div>
    <h1>timeline</h1>
    <div class='timeline-list'>${sorted.map(c=>`
      <a class='titem reveal' href='#/ins/${c.id}'>
        <span class='date'>${c.source_date||'—'}</span>
        <span class='claim'>${escapeHtml(c.claim)}</span>
        <span class='who'>${escapeHtml(c.operator)}</span>
      </a>`).join('')}</div>
  </section>`;
  if (!reduced) ScrollTrigger.batch('.titem.reveal', {
    onEnter: els => gsap.fromTo(els, { opacity:0, x:-12 }, { opacity:1, x:0, duration:.5, ease:'power2.out', stagger:.012 }),
    start:'top 95%'
  });
}

/* ============ ABOUT ============ */
function about(){
  app.innerHTML = `<section class='about-page'>
    <h1>about codex</h1>
    <p>codex is a primary-source library of operator insights — each card carries a named operator, a verifiable source URL, and a date. The corpus is built so you can read one claim, verify the source, and cite it.</p>
    <p>Cross-domain operator wisdom across product, pmm, gtm, ai-native, design, engineering, leadership, sales, growth, research, and founder craft. No client work, no internal team detail, no commentary — just a structured record of what operators have actually said and shipped.</p>
    <ul>
      <li>${STATS.cards} insight cards across ${STATS.domains} domains</li>
      <li>${STATS.operators} operator profiles</li>
      <li>${STATS.patterns} synthesis patterns (3+ operator convergences)</li>
      <li>${STATS.contradictions} documented contradictions</li>
      <li>${STATS.playbooks} methodology playbooks</li>
      <li>${STATS.tierA} Tier A claims</li>
    </ul>
    <p>Source on <a href='https://github.com/k3sava/codex' target='_blank' rel='noopener'>github</a>. Released MIT. Raw sources retain their original copyright; codex archives short excerpts under fair use.</p>
  </section>`;
}

/* ============ MAP ============ */
function graph(){
  app.innerHTML = `<section class='graph-page'>
    <div class='ghead'>
      <h1>knowledge map</h1>
      <p>${STATS.cards} insights orbit between operators and domains. Click any node to open.</p>
    </div>
    <div class='graphWrap'><svg id='graph'></svg></div>
    <aside>
      <div><strong>${STATS.cards}</strong> cards · <strong>${STATS.operators}</strong> profiles</div>
      <div class='legend'>
        <div><span class='sw' style='background:#7d9e7a'></span>domains</div>
        <div><span class='sw' style='background:#5d738f'></span>operators</div>
        <div><span class='sw' style='background:#cb7f46'></span>insights</div>
      </div>
    </aside>
  </section>`;

  requestAnimationFrame(() => {
    const wrap = document.querySelector('.graphWrap');
    const W = wrap.clientWidth, H = wrap.clientHeight;
    const cx = W/2, cy = H/2;
    const svg = d3.select('#graph').attr('viewBox', `0 0 ${W} ${H}`);

    const ops = [...new Set(cards.map(c=>c.operator))]; // operators with cards
    const dR = Math.min(W,H)*0.16;
    const oR = Math.min(W,H)*0.44;
    const iR_min = Math.min(W,H)*0.22, iR_max = Math.min(W,H)*0.36;

    const dNodes = DOMAINS.map((d,i)=>({ id:'d:'+d, label:d, type:'domain', angle:i/DOMAINS.length*Math.PI*2, x: cx + Math.cos(i/DOMAINS.length*Math.PI*2)*dR, y: cy + Math.sin(i/DOMAINS.length*Math.PI*2)*dR }));
    const oNodes = ops.map((o,i)=>({ id:'o:'+o, label:o, type:'operator', slug:slugify(o), angle:i/ops.length*Math.PI*2, x: cx + Math.cos(i/ops.length*Math.PI*2)*oR, y: cy + Math.sin(i/ops.length*Math.PI*2)*oR }));
    const iNodes = cards.map((c,i)=>{ const r = iR_min + (iR_max-iR_min) * (i % 5) / 4; const a = (i / cards.length) * Math.PI*2; return { id:'i:'+c.id, card:c, type:'insight', x: cx + Math.cos(a)*r, y: cy + Math.sin(a)*r }; });

    const all = [...dNodes,...oNodes,...iNodes];
    const idx = new Map(all.map(n=>[n.id,n]));
    const edges = [];
    cards.forEach(c => {
      const ci = idx.get('i:'+c.id), co = idx.get('o:'+c.operator);
      if (ci && co) edges.push({a:ci, b:co});
      c.domain.forEach(d => { const cd = idx.get('d:'+d); if (ci && cd) edges.push({a:ci, b:cd}); });
    });

    const eg = svg.append('g').attr('class','edges');
    eg.selectAll('line').data(edges).enter().append('line')
      .attr('x1',d=>d.a.x).attr('y1',d=>d.a.y).attr('x2',d=>d.b.x).attr('y2',d=>d.b.y)
      .attr('stroke','#1a161412').attr('stroke-width',0.7);

    const ng = svg.append('g').attr('class','nodes');
    const g = ng.selectAll('g').data(all).enter().append('g')
      .attr('transform',d=>`translate(${d.x},${d.y})`).style('cursor','pointer')
      .on('mouseenter', function(_,d){
        d3.select(this).select('circle').transition().duration(150).attr('r', d.type==='domain'?16:d.type==='operator'?9:5);
        if (d.type==='operator' || d.type==='insight'){
          eg.selectAll('line').attr('stroke', e => (e.a.id===d.id || e.b.id===d.id) ? '#cb7f46aa' : '#1a161408').attr('stroke-width', e => (e.a.id===d.id || e.b.id===d.id) ? 1.4 : 0.5);
        }
      })
      .on('mouseleave', function(_,d){
        d3.select(this).select('circle').transition().duration(150).attr('r', d.type==='domain'?12:d.type==='operator'?6:2.6);
        eg.selectAll('line').attr('stroke','#1a161412').attr('stroke-width',0.7);
      })
      .on('click',(_,d)=>{ if (d.type==='insight') location.hash = `#/ins/${d.card.id}`; else if (d.type==='operator') location.hash = `#/o/${d.slug}`; else if (d.type==='domain') location.hash = `#/d/${d.label}`; });

    g.append('circle')
      .attr('r', d => d.type==='domain'?12 : d.type==='operator'?6 : 2.6)
      .attr('fill', d => d.type==='domain'?'#7d9e7a' : d.type==='operator'?'#5d738f' : '#cb7f46')
      .attr('opacity', d => d.type==='insight'?0.85 : 1);

    g.filter(d=>d.type==='domain').append('text')
      .attr('dy', -18).attr('text-anchor','middle')
      .attr('font-family','var(--mono)').attr('font-size',11).attr('fill','#1a1614')
      .text(d=>d.label);

    g.filter(d=>d.type==='operator').append('text')
      .attr('dy', d => Math.sin(d.angle) > 0 ? 18 : -10)
      .attr('text-anchor','middle')
      .attr('font-family','var(--sans)').attr('font-size',9).attr('fill','#7a6e62').attr('opacity',0.55)
      .text(d=>d.label);

    g.append('title').text(d => d.type==='insight'?`${d.card.claim} — ${d.card.operator}`: d.label);

    if (!reduced){
      gsap.from(g.nodes(), { opacity:0, scale:0, duration:.9, stagger:{ each:.003, from:'random' }, ease:'power3.out', transformOrigin:'center' });
      gsap.from(eg.selectAll('line').nodes(), { opacity:0, duration:1.2, ease:'power2.out', delay:.4 });
    }
  });
}

/* ============ ROUTER ============ */
function setActive(){
  const r = (location.hash || '#/').replace(/^#/,'');
  const top = '/'+ (r.split('/')[1] || '');
  document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route === top || (top==='/' && a.dataset.route === '/')));
}

function render(){
  window.scrollTo(0,0);
  ScrollTrigger.getAll().forEach(t=>t.kill());
  const r = (location.hash || '#/').replace(/^#/,'');
  let view;
  if (r==='/'||r==='') view = home;
  else if (r.startsWith('/ins/')) view = () => insight(decodeURIComponent(r.slice(5)));
  else if (r.startsWith('/o/')) view = () => operatorPage(decodeURIComponent(r.slice(3)));
  else if (r==='/operators') view = operatorsList;
  else if (r.startsWith('/d/')) view = () => domainPage(decodeURIComponent(r.slice(3)));
  else if (r==='/patterns') view = patternsList;
  else if (r.startsWith('/pat/')) view = () => patternPage(decodeURIComponent(r.slice(5)));
  else if (r.startsWith('/con/')) view = () => contradictionPage(decodeURIComponent(r.slice(5)));
  else if (r==='/map' || r==='/graph') view = graph;
  else if (r==='/flash') view = flash;
  else if (r==='/browse' || r==='/carousel') view = browse;
  else if (r==='/timeline') view = timeline;
  else if (r==='/about') view = about;
  else view = about;

  // Page transition
  if (!reduced){
    gsap.fromTo(app, { opacity:0, y:8 }, { opacity:1, y:0, duration:.4, ease:'power2.out' });
  }
  view();
}

/* ============ SEARCH ============ */
function wireSearch(){
  const dlg = document.getElementById('searchDialog');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  document.getElementById('searchOpen').onclick = ()=>{ dlg.showModal(); input.focus(); };
  document.addEventListener('keydown', e => {
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); dlg.showModal(); input.focus(); }
    if (e.key==='Escape' && dlg.open) dlg.close();
  });
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

/* ============ HEADER + SCROLL PROGRESS ============ */
function wireHeader(){
  const hdr = document.getElementById('hdr');
  const bar = document.getElementById('scrollProgress');
  const onScroll = () => {
    hdr.classList.toggle('scrolled', window.scrollY > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    bar.style.width = (p * 100) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
}

/* ============ MOBILE MENU ============ */
function wireMobileMenu(){
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  const back = document.getElementById('mobileBackdrop');
  const close = () => { menu.classList.remove('open'); back.classList.remove('show'); };
  const open = () => { menu.classList.add('open'); back.classList.add('show'); };
  btn.onclick = () => menu.classList.contains('open') ? close() : open();
  back.onclick = close;
  menu.querySelectorAll('a').forEach(a => a.onclick = close);
  window.addEventListener('hashchange', close);
}

/* ============ SPLASH ============ */
function dismissSplash(){
  const splash = document.getElementById('splash');
  if (!splash) return;
  if (reduced){ splash.remove(); return; }
  const tl = gsap.timeline({ onComplete: () => splash.remove() });
  tl.to('#splash .progress .bar', { width:'100%', duration:.5, ease:'power2.out' });
  tl.to('#splash .pulse', { scale:1.4, opacity:.4, duration:.4, ease:'power2.out', boxShadow:'0 0 0 18px rgba(203,127,70,0)' }, '<');
  tl.to('#splash', { xPercent:-100, duration:.7, ease:'power3.inOut' }, '+=.1');
}

window.addEventListener('hashchange', () => { render(); setActive(); });
loadIndex().then(() => {
  render();
  setActive();
  wireSearch();
  wireHeader();
  wireMobileMenu();
  dismissSplash();
}).catch(e => {
  document.getElementById('splash')?.remove();
  app.innerHTML = `<section class='about-page'><h1>codex couldn't load.</h1><p style='color:var(--muted)'>${escapeHtml(e.message)}</p></section>`;
});
