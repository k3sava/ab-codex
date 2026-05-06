// codex frontend — primary-source operator insight library
const REPO_BASE = 'https://github.com/k3sava/ab-codex/blob/main';
const app = document.getElementById('app');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.registerPlugin(ScrollTrigger);

let cards = [], operators = [], patterns = [], contradictions = [], playbooks = [];
let STATS = {};
let DOMAINS = [];
let LATEST_DAILY = null;
let RECENT_DAILY = [];

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
  playbooks = (data.playbooks||[]).map(p => ({ id:p.id, title:p.title, path:p.path, domain:p.domain||[], uses_cards:p.uses_cards||[], originating_operators:p.originating_operators||[], maintained_by:p.maintained_by||'', captured_date:p.captured_date||'' }));
  DOMAINS = [...new Set(cards.flatMap(c=>c.domain))].sort();
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
  LATEST_DAILY = data.latest_daily || null;
  RECENT_DAILY = data.daily || [];
}

function renderHelloBar(){
  const bar = document.getElementById('helloBar');
  const marquee = document.getElementById('helloMarquee');
  if (!bar || !marquee || !LATEST_DAILY) return;
  // Only show if the entry is reasonably recent (last 14 days) — stale "what's new" is worse than no banner
  const d = LATEST_DAILY.date;
  if (!d) return;
  const ageMs = Date.now() - new Date(d + 'T00:00:00').getTime();
  if (ageMs < 0 || ageMs > 14 * 24 * 60 * 60 * 1000) return;
  const counts = [];
  const ia = (LATEST_DAILY.insights_added || []).length;
  const oa = (LATEST_DAILY.operators_added || []).length;
  const pa = (LATEST_DAILY.patterns_added || []).length;
  const pba = (LATEST_DAILY.playbooks_added || []).length;
  if (ia) counts.push(`${ia} insight${ia===1?'':'s'}`);
  if (oa) counts.push(`${oa} operator${oa===1?'':'s'}`);
  if (pa) counts.push(`${pa} pattern${pa===1?'':'s'}`);
  if (pba) counts.push(`${pba} playbook${pba===1?'':'s'}`);
  const lead = counts.length ? counts.join(' · ') : '';
  const title = LATEST_DAILY.title || 'what landed';
  const text = lead ? `${lead} — ${title}` : title;
  // One "group" of content — duplicated below for seamless marquee loop.
  const group = `<span class="hello-group">
    <span class="hello-mark">NEW</span>
    <span class="hello-date">${escapeHtml(d)}</span>
    <span class="hello-sep" aria-hidden="true">·</span>
    <span class="hello-text">${escapeHtml(text)}</span>
    <span class="hello-arrow" aria-hidden="true">→</span>
  </span>`;
  // Two copies inside a track that translates -50%; seamless when the second copy lines up with the start.
  marquee.innerHTML = `<div class="hello-track">${group}${group}</div>`;
  bar.hidden = false;
  // Tune animation duration to a constant scrolling speed regardless of content length.
  requestAnimationFrame(() => {
    const track = marquee.querySelector('.hello-track');
    if (!track) return;
    const groupWidth = track.firstElementChild?.getBoundingClientRect().width || 0;
    if (groupWidth <= 0) return;
    const speedPxPerSec = 70;
    const durationSec = Math.max(20, groupWidth / speedPxPerSec);
    track.style.animationDuration = durationSec.toFixed(1) + 's';
  });
}

async function fetchBody(path){
  try { const r = await fetch(`insight-library/${path}`); return await r.text(); } catch { return ''; }
}
function stripFrontmatter(md){ if (md.startsWith('---\n')){ const e = md.indexOf('\n---',4); if (e>0) return md.slice(e+4).trimStart(); } return md; }
const ACRONYMS = ['AI','GTM','PMM','PLG','ICP','JTBD','ROI','KPI','SEO','AEO','LLM','LLMs','API','APIs','CRO','B2B','B2C','SaaS','CEO','CTO','CMO','CFO','COO','VP','VPs','UI','UX','SDK','MCP','RAG','SQL','URL','URLs','HTML','CSS','JS','JSON','HTTP','HTTPS','PDF','PR','PRs','QA','GTM','OKR','OKRs','POV','SDR','BDR','AE','AEs','RevOps','GTM','TAM','SAM','LTV','CAC','MRR','ARR','PMF','MVP','NPS','CSM','CX','VPC','SNM','TPS','OS','iOS','iPadOS','macOS'];
function fixAcronymsAndSmallWords(text){
  if (!text) return text;
  for (const a of ACRONYMS){
    const re = new RegExp(`\\b${a.replace(/[A-Z]/g, c => `[${c}${c.toLowerCase()}]`)}\\b`, 'g');
    text = text.replace(re, a);
  }
  // Lowercase common small words inside title-cased phrases (not at start)
  text = text.replace(/(\S)\s+(And|Or|Of|To|The|A|An|In|On|By|For|With|At|As|But|Vs|Via|From)\s+/g, (m, prev, w) => `${prev} ${w.toLowerCase()} `);
  return text;
}
function mdToHtml(md){
  let html = stripFrontmatter(md);
  html = fixAcronymsAndSmallWords(html);
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
      <h1 id='heroH'>learn from the <em>best</em></h1>
      <p class='lede'>codex is a primary-source corpus of operator-attributed claims across product, pmm, gtm, ai-native, design, and leadership. every card carries a named operator, source url, date, mechanism, conditions, and evidence.</p>
      <div class='stats'>
        <a class='stat' href='#/browse'><span class='num' data-count='${STATS.cards}'>0</span><span class='lbl'>insight cards</span></a>
        <a class='stat' href='#/operators'><span class='num' data-count='${STATS.operators}'>0</span><span class='lbl'>operators</span></a>
        <a class='stat' href='#/patterns'><span class='num' data-count='${STATS.patterns}'>0</span><span class='lbl'>patterns</span></a>
        <a class='stat' href='#/patterns#contradictions'><span class='num' data-count='${STATS.contradictions}'>0</span><span class='lbl'>contradictions</span></a>
        <a class='stat' href='#/playbooks'><span class='num' data-count='${STATS.playbooks}'>0</span><span class='lbl'>playbooks</span></a>
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
          <h2>Where operators converge</h2>
          <p>Synthesis patterns: three or more operators arrive at the same idea from different angles.</p>
        </div>
        <div class='meta'><a href='#/patterns'>${STATS.patterns} patterns →</a></div>
      </div>
      <ol class='converge-list reveal'>${patterns.slice(0,8).map((p, idx)=>{
        const ops = (p.uses_cards||[]).map(cid => {
          const card = cards.find(c => c.id === cid);
          return card ? card.operator : null;
        }).filter(Boolean);
        const uniqOps = [...new Set(ops)].slice(0,7);
        return `<li class='converge-item reveal'>
          <a href='#/pat/${p.id}' class='converge-link'>
            <span class='converge-num'>${String(idx+1).padStart(2,'0')}</span>
            <span class='converge-body'>
              <span class='converge-title'>${escapeHtml(p.title)}</span>
              <span class='converge-ops'>${uniqOps.map(o => `<span class='converge-op'>${escapeHtml(o)}</span>`).join('')}${ops.length > uniqOps.length ? `<span class='converge-more'>+${ops.length - uniqOps.length}</span>` : ''}</span>
            </span>
            <span class='converge-meta'>${(p.domains||[]).slice(0,2).join(' · ')}</span>
          </a>
        </li>`;
      }).join('')}</ol>
    </section>

    ${STATS.contradictions > 0 ? `<section class='section section-contradictions'>
      <div class='section-head'>
        <div>
          <h2>${STATS.contradictions} places operators disagree</h2>
          <p>Productive disagreements. Where smart operators reach opposing conclusions on the same question.</p>
        </div>
        <div class='meta'><a href='#/patterns#contradictions'>see all →</a></div>
      </div>
      <div class='con-strip'>${contradictions.slice(0,4).map(c=>`
        <a class='con-strip-item reveal' href='#/con/${c.id}'>
          <span class='con-strip-vs'>vs</span>
          <span class='con-strip-title'>${escapeHtml(c.title)}</span>
        </a>`).join('')}</div>
    </section>` : ''}

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
    gsap.to({n:0}, { n: target, duration: 1.6, ease:'power2.out', delay:.3,
      onUpdate(){ el.textContent = Math.round(this.targets()[0].n); } });
  });
  gsap.from('.hero .stats', { opacity:0, y:24, duration:.8, ease:'power2.out', delay:.6 });
  gsap.fromTo('#scrollCue', { opacity:0 }, { opacity:.6, duration:.6, delay:1.4 });
  gsap.to('#scrollCue', { opacity:0, scrollTrigger:{ trigger:'.hero', start:'bottom 80%', scrub:true } });
  ScrollTrigger.batch('.section-head', { onEnter: els => gsap.fromTo(els, { opacity:0, y:24 }, { opacity:1, y:0, duration:.7, ease:'power3.out', stagger:.08 }), start:'top 85%' });
  ScrollTrigger.batch('.reveal', { onEnter: els => gsap.fromTo(els, { opacity:0, y:18 }, { opacity:1, y:0, duration:.7, ease:'power3.out', stagger:.04 }), start:'top 92%' });
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
        ${(()=>{ const sib = cards.filter(x=>x.operator_slug===c.operator_slug); const i = sib.findIndex(x=>x.id===c.id); const prev = i>0?sib[i-1]:null; const next = i>=0&&i<sib.length-1?sib[i+1]:null; return (prev||next) ? `<nav class='ins-nav'>${prev?`<a class='ins-nav-prev' href='#/ins/${prev.id}'><span>← previous</span><em>${escapeHtml(prev.claim.slice(0,80))}${prev.claim.length>80?'…':''}</em></a>`:'<span></span>'}${next?`<a class='ins-nav-next' href='#/ins/${next.id}'><span>next →</span><em>${escapeHtml(next.claim.slice(0,80))}${next.claim.length>80?'…':''}</em></a>`:'<span></span>'}</nav>` : ''; })()}
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
function stripMdSections(md, titlesLower){
  const lines = md.split('\n');
  const out = [];
  let skip = false;
  for (const line of lines){
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m){
      const t = m[1].toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();
      skip = titlesLower.includes(t);
      if (skip) continue;
    }
    if (!skip) out.push(line);
  }
  return out.join('\n');
}

async function operatorPage(slug){
  const op = operators.find(o=>o.slug===slug) || { name:slug, slug, roles:[], path:`operators/${slug}/README.md`, domains_active:[] };
  const opCards = cards.filter(c => c.operator_slug === slug);
  // Source-type glyph reused from operators list
  const srcGlyph = { podcast: '◔', essay: '✎', book: '▭', thread: '#', research: '⌘', talk: '▷', '': '·' };
  // Unique sources from cards (dedupe by source_url)
  const sourceMap = new Map();
  for (const c of opCards){
    if (!c.source_url || sourceMap.has(c.source_url)) continue;
    sourceMap.set(c.source_url, { url: c.source_url, title: c.source_title || c.source_url, date: c.source_date || '', type: c.source_type || '' });
  }
  const sources = [...sourceMap.values()].sort((a,b)=> (b.date||'').localeCompare(a.date||''));

  app.innerHTML = `<article class='operator-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/operators'>operators</a> <span>·</span> <span>${escapeHtml(op.name||slug)}</span></div>
    <h1>${escapeHtml(op.name||slug)}</h1>
    ${op.roles.length?`<div class='roles'>${op.roles.map(r=>`<span class='chip'>${escapeHtml(r)}</span>`).join('')}</div>`:''}
    <div class='op-grid'>
      <div class='op-main'>
        <div class='body' id='opBio'><p style='color:var(--muted);font-family:var(--mono);font-size:.8rem'>loading…</p></div>
        ${sources.length ? `<section class='op-sources'>
          <h3>Sources</h3>
          <ul>${sources.map(s => `<li>
            <span class='op-src-glyph' title='${s.type||'source'}'>${srcGlyph[s.type]||'·'}</span>
            <a href='${s.url}' target='_blank' rel='noopener'>${escapeHtml(s.title)}</a>
            ${s.date?`<span class='op-src-date'>${s.date}</span>`:''}
          </li>`).join('')}</ul>
        </section>` : ''}
      </div>
      <aside class='op-aside'>
        <div class='op-aside-head'>${opCards.length} insight${opCards.length===1?'':'s'}</div>
        <div class='op-card-list'>${opCards.map(c => `
          <a class='op-mini' href='#/ins/${c.id}'>
            <div class='op-mini-top'>${tierBadge(c.tier)}<span class='op-mini-dom'>${(c.domain||[]).slice(0,2).join(' · ')}</span></div>
            <div class='op-mini-claim'>${escapeHtml(c.claim||c.id)}</div>
          </a>`).join('') || '<p style="color:var(--muted)">no cards yet</p>'}</div>
      </aside>
    </div>
  </article>`;
  if (op.path){
    const md = await fetchBody(op.path);
    const cleaned = stripMdSections(md, ['cards','sources captured','sources']);
    document.getElementById('opBio').innerHTML = mdToHtml(cleaned);
  }
  if (!reduced) gsap.from('.operator-page > *', { opacity:0, y:18, duration:.6, ease:'power3.out', stagger:.05 });
}

/* ============ OPERATORS LIST ============ */
const opsState = { sort: 'count', dir: 'desc', q: '', domain: 'all', minCards: 0 };
function operatorsList(){
  // Compute per-operator stats
  const byOp = new Map();
  for (const c of cards){
    const key = c.operator_slug;
    if (!byOp.has(key)) byOp.set(key, { count: 0, domains: new Set(), srcs: new Set(), latest: '' });
    const e = byOp.get(key);
    e.count++;
    (c.domain||[]).forEach(d => e.domains.add(d));
    if (c.source_type) e.srcs.add(c.source_type);
    if (c.source_date && c.source_date > e.latest) e.latest = c.source_date;
  }
  const ops = operators.map(o => {
    const s = byOp.get(o.slug) || { count: 0, domains: new Set(), srcs: new Set(), latest: '' };
    return { ...o, count: s.count, op_domains: [...s.domains].sort(), op_srcs: [...s.srcs].sort(), latest: s.latest };
  });
  // Build domain options (top 12 by appearance)
  const domCounts = new Map();
  ops.forEach(o => o.op_domains.forEach(d => domCounts.set(d, (domCounts.get(d)||0) + 1)));
  const topDomains = [...domCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(e=>e[0]);
  // Apply filters
  const q = opsState.q.toLowerCase();
  let filtered = ops.filter(o => {
    if (opsState.minCards > 0 && o.count < opsState.minCards) return false;
    if (opsState.domain !== 'all' && !o.op_domains.includes(opsState.domain)) return false;
    if (q && !(o.name.toLowerCase().includes(q) || (o.roles||[]).some(r=>r.toLowerCase().includes(q)) || o.op_domains.some(d=>d.includes(q)))) return false;
    return true;
  });
  // Sort
  const cmp = (a, b) => {
    let r = 0;
    if (opsState.sort === 'name') r = a.name.localeCompare(b.name);
    else if (opsState.sort === 'count') r = b.count - a.count;
    else if (opsState.sort === 'latest') r = (b.latest||'').localeCompare(a.latest||'');
    else if (opsState.sort === 'domain') r = (a.op_domains[0]||'zz').localeCompare(b.op_domains[0]||'zz');
    if (opsState.dir === 'asc' && opsState.sort !== 'count' && opsState.sort !== 'latest') r = -r;
    if (opsState.dir === 'asc' && (opsState.sort === 'count' || opsState.sort === 'latest')) r = -r;
    return r || a.name.localeCompare(b.name);
  };
  filtered.sort(cmp);

  const arrow = key => opsState.sort === key ? (opsState.dir === 'desc' ? ' ▼' : ' ▲') : '';
  const srcGlyph = { podcast: '◔', essay: '✎', book: '▭', thread: '#', research: '⌘', talk: '▷', '': '·' };

  app.innerHTML = `<section class='list-page operators-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>operators</span></div>
    <h1>operators</h1>
    <p class='lede'>${STATS.operators} operator profiles. <span id='opsResultCount'>${filtered.length}</span> shown after filters.</p>
    <div class='ops-toolbar'>
      <input id='opsSearch' class='ops-search' type='search' placeholder='search name, role, domain…' value='${escapeHtml(opsState.q)}' />
      <div class='ops-chips'>
        <button class='chip ${opsState.domain==='all'?'active':''}' data-domain='all'>all</button>
        ${topDomains.map(d=>`<button class='chip ${opsState.domain===d?'active':''}' data-domain='${d}'>${d}<span class='ct'>${domCounts.get(d)}</span></button>`).join('')}
      </div>
      <label class='ops-min'>
        min cards
        <select id='opsMin'>
          ${[0,1,2,3,5,10].map(n=>`<option value='${n}' ${opsState.minCards===n?'selected':''}>${n}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class='ops-table-wrap'>
      <table class='ops-table'>
        <colgroup>
          <col class='c-name' /><col class='c-role' /><col class='c-doms' /><col class='c-srcs' /><col class='c-latest' /><col class='c-count' />
        </colgroup>
        <thead>
          <tr>
            <th class='th-sort' data-sort='name'>name${arrow('name')}</th>
            <th class='th-role'>role</th>
            <th class='th-doms th-sort' data-sort='domain'>domains${arrow('domain')}</th>
            <th class='th-srcs'>sources</th>
            <th class='th-latest th-sort' data-sort='latest'>latest${arrow('latest')}</th>
            <th class='th-count th-sort' data-sort='count'>cards${arrow('count')}</th>
          </tr>
        </thead>
        <tbody>${filtered.map(o => {
          const role = (o.roles||[])[0] || '';
          const dchips = o.op_domains.slice(0,3).map(d=>`<span class='dchip'>${d}</span>`).join('');
          const srcdots = o.op_srcs.map(s=>`<span class='srcdot' title='${s}'>${srcGlyph[s]||'·'}</span>`).join('');
          return `<tr class='op-row reveal' data-href='#/o/${o.slug}' tabindex='0' role='link'>
            <td class='td-name'><span class='nm'>${escapeHtml(o.name)}</span></td>
            <td class='td-role'>${escapeHtml(role)}</td>
            <td class='td-doms'>${dchips}</td>
            <td class='td-srcs'>${srcdots}</td>
            <td class='td-latest'>${o.latest||'—'}</td>
            <td class='td-count'>${o.count || '—'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
      ${filtered.length === 0 ? `<div class='ops-empty'>No operators match these filters.</div>` : ''}
    </div>
  </section>`;

  // Wire interactions
  const refresh = () => operatorsList();
  document.getElementById('opsSearch').addEventListener('input', e => { opsState.q = e.target.value; clearTimeout(window._opsT); window._opsT = setTimeout(refresh, 120); });
  document.getElementById('opsMin').addEventListener('change', e => { opsState.minCards = +e.target.value; refresh(); });
  document.querySelectorAll('.ops-chips .chip').forEach(b => b.addEventListener('click', () => { opsState.domain = b.dataset.domain; refresh(); }));
  document.querySelectorAll('.th-sort').forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.sort;
    if (opsState.sort === k) opsState.dir = opsState.dir === 'desc' ? 'asc' : 'desc';
    else { opsState.sort = k; opsState.dir = (k === 'count' || k === 'latest') ? 'desc' : 'asc'; }
    refresh();
  }));
  document.querySelectorAll('.op-row').forEach(r => {
    r.addEventListener('click', () => location.hash = r.dataset.href);
    r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); location.hash = r.dataset.href; } });
  });

  if (!reduced) ScrollTrigger.batch('.op-row.reveal', { onEnter: els => gsap.fromTo(els, { opacity:0, y:6 }, { opacity:1, y:0, duration:.35, ease:'power2.out', stagger:.005 }), start:'top 96%' });
}

/* ============ DOMAIN ============ */
function domainPage(d){
  const list = cards.filter(c => c.domain.includes(d));
  // Top operators in this domain by card count
  const opCount = new Map();
  for (const c of list){ opCount.set(c.operator, (opCount.get(c.operator) || 0) + 1); }
  const topOps = [...opCount.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8);
  // Top tier-A insights in domain
  const topA = list.filter(c => c.tier === 'A').slice(0, 6);
  const restCount = list.length - topA.length;
  // Patterns tagged with this domain
  const relPatterns = patterns.filter(p => (p.domains||[]).includes(d));
  // Lifecycle distribution
  const lifeCount = new Map();
  for (const c of list){ for (const l of (c.lifecycle||[])){ lifeCount.set(l, (lifeCount.get(l) || 0) + 1); } }
  const topLife = [...lifeCount.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);

  app.innerHTML = `<section class='domain-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/browse'>browse</a> <span>·</span> <span>${d}</span></div>
    <header class='dom-head'>
      <p class='dom-eyebrow'>domain</p>
      <h1>${d}</h1>
      <p class='dom-summary'>${list.length} cards · ${opCount.size} operators · ${list.filter(c=>c.tier==='A').length} tier-A claims · ${relPatterns.length} synthesis pattern${relPatterns.length===1?'':'s'}.</p>
    </header>

    ${topA.length ? `<section class='dom-section'>
      <header class='dom-sec-head'><h2>Strongest claims</h2><span class='dom-sec-meta'>${topA.length} of ${list.filter(c=>c.tier==='A').length} tier A</span></header>
      <ol class='dom-strongs'>${topA.map((c, i) => `
        <li><a href='#/ins/${c.id}'>
          <span class='dom-strongs-num'>${String(i+1).padStart(2,'0')}</span>
          <span class='dom-strongs-claim'>${escapeHtml(c.claim)}</span>
          <span class='dom-strongs-op'>${escapeHtml(c.operator)}</span>
        </a></li>`).join('')}</ol>
    </section>` : ''}

    <div class='dom-grid'>
      <section class='dom-block'>
        <h3>Top operators</h3>
        <ul class='dom-ops'>${topOps.map(([name, ct]) => {
          const op = operators.find(o => o.name === name);
          const slug = op ? op.slug : slugify(name);
          return `<li><a href='#/o/${slug}'><span>${escapeHtml(name)}</span><span class='ct'>${ct}</span></a></li>`;
        }).join('')}</ul>
      </section>

      ${relPatterns.length ? `<section class='dom-block'>
        <h3>Synthesis patterns</h3>
        <ul class='dom-pats'>${relPatterns.slice(0, 8).map(p => `
          <li><a href='#/pat/${p.id}'>
            ${p.tier ? tierBadge(p.tier) : ''}
            <span>${escapeHtml(p.title)}</span>
          </a></li>`).join('')}</ul>
      </section>` : ''}

      ${topLife.length ? `<section class='dom-block'>
        <h3>Most-active lifecycle stages</h3>
        <ul class='dom-life'>${topLife.map(([life, ct]) => `
          <li><span class='dom-life-name'>${life.replace(/-/g,' ')}</span><span class='dom-life-bar'><span style='width:${(ct/list.length*100).toFixed(0)}%'></span></span><span class='dom-life-ct'>${ct}</span></li>`).join('')}</ul>
      </section>` : ''}
    </div>

    <section class='dom-section'>
      <header class='dom-sec-head'><h2>All ${list.length} cards</h2><a class='dom-sec-link' href='#/browse'>browse with filters →</a></header>
      <div class='card-grid'>${list.slice(0, 24).map(cardTile).join('')}</div>
      ${list.length > 24 ? `<p class='dom-more'><a href='#/browse'>see all ${list.length} →</a></p>` : ''}
    </section>
  </section>`;
  if (!reduced){
    gsap.from('.dom-head > *', { opacity:0, y:14, duration:.6, ease:'power2.out', stagger:.06 });
    ScrollTrigger.batch('.dom-strongs li, .dom-block li, .card.reveal', { onEnter: els => gsap.fromTo(els, { opacity:0, y:12 }, { opacity:1, y:0, duration:.5, ease:'power2.out', stagger:.02 }), start:'top 95%' });
  }
}

/* ============ PATTERNS ============ */
function patternsList(){
  const byTier = { A: patterns.filter(p=>p.tier==='A'), B: patterns.filter(p=>p.tier==='B'), C: patterns.filter(p=>p.tier==='C'), other: patterns.filter(p=>!['A','B','C'].includes(p.tier)) };

  const dotCluster = (n) => {
    const dots = Math.min(n, 24);
    return `<span class='pat-dots' aria-hidden='true'>${Array.from({length:dots}).map(()=>`<i></i>`).join('')}${n>24?`<em>+${n-24}</em>`:''}</span>`;
  };

  const tierA = byTier.A.length ? `
    <section class='pat-tier pat-tier-a'>
      <header class='pat-tier-head'><h2>Tier A</h2><span class='ct'>${byTier.A.length}</span><p>High-confidence convergences. Strong evidence, broad transferability.</p></header>
      <div class='pat-tiles'>${byTier.A.map(p=>`
        <a class='pat-tile reveal' href='#/pat/${p.id}'>
          <div class='pat-tile-top'>${tierBadge(p.tier)}<span class='pat-doms'>${(p.domains||[]).slice(0,2).join(' · ')}</span></div>
          <h3>${escapeHtml(p.title)}</h3>
          <div class='pat-tile-foot'>
            ${dotCluster((p.uses_cards||[]).length)}
            <span class='pat-conv'>${(p.uses_cards||[]).length} operators converge</span>
          </div>
        </a>`).join('')}</div>
    </section>` : '';

  const tierB = byTier.B.length ? `
    <section class='pat-tier pat-tier-b'>
      <header class='pat-tier-head'><h2>Tier B</h2><span class='ct'>${byTier.B.length}</span><p>Solid convergences. More context-dependent.</p></header>
      <div class='pat-rows'>${byTier.B.map(p=>`
        <a class='pat-row reveal' href='#/pat/${p.id}'>
          <span class='pat-row-title'>${escapeHtml(p.title)}</span>
          <span class='pat-row-doms'>${(p.domains||[]).slice(0,2).join(' · ')}</span>
          <span class='pat-row-ct'>${(p.uses_cards||[]).length} ops</span>
        </a>`).join('')}</div>
    </section>` : '';

  const tierC = byTier.C.length ? `
    <section class='pat-tier pat-tier-c'>
      <header class='pat-tier-head'><h2>Tier C</h2><span class='ct'>${byTier.C.length}</span><p>Emerging. Treat as hypotheses.</p></header>
      <p class='pat-inline'>${byTier.C.map(p=>`<a href='#/pat/${p.id}'>${escapeHtml(p.title)} <em>·${(p.uses_cards||[]).length}</em></a>`).join('<span class="sep">,</span> ')}</p>
    </section>` : '';

  const tierOther = byTier.other.length ? `
    <section class='pat-tier'>
      <header class='pat-tier-head'><h2>Untiered</h2><span class='ct'>${byTier.other.length}</span></header>
      <p class='pat-inline'>${byTier.other.map(p=>`<a href='#/pat/${p.id}'>${escapeHtml(p.title)}</a>`).join('<span class="sep">,</span> ')}</p>
    </section>` : '';

  app.innerHTML = `<section class='list-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>patterns</span></div>
    <h1>synthesis patterns</h1>
    <p class='lede'>${STATS.patterns} convergences. ${STATS.contradictions} contradictions. Across ${STATS.cards} cards.</p>
    ${tierA}${tierB}${tierC}${tierOther}

    ${contradictions.length ? `
    <section id='contradictions' class='contradictions-section reveal'>
      <div class='head'>
        <h2>Contradictions</h2>
        <span class='ct'>${STATS.contradictions} surfaced</span>
      </div>
      <p class='lede'>Where operators disagree on substantive questions — not vocabulary, but mechanism. Often resolvable by stage, layer, or context.</p>
      <div class='card-grid'>${contradictions.map(c=>`
        <a class='card reveal' href='#/con/${c.id}'>
          <div class='meta-row'><span>contradiction</span></div>
          <h3>${escapeHtml(c.title)}</h3>
        </a>`).join('')}</div>
    </section>` : ''}
  </section>`;
  if (!reduced) ScrollTrigger.batch('.pat-tile.reveal, .pat-row.reveal, .card.reveal', { onEnter: els => gsap.fromTo(els, { opacity:0, y:18 }, { opacity:1, y:0, duration:.6, ease:'power3.out', stagger:.03 }), start:'top 92%' });
}

function playbookCategoryFromPath(path){
  const parts = (path || '').split('/');
  return parts.length >= 2 ? parts[1] : 'other';
}

const PLAYBOOK_CATEGORY_LABELS = {
  'aeo': 'answer engine optimization',
  'ai-native-gtm': 'ai-native gtm',
  'competitive': 'competitive intelligence',
  'copywriting': 'copywriting',
  'design': 'design',
  'jtbd': 'jobs to be done',
  'launch': 'launch',
  'measurement': 'measurement',
  'messaging': 'messaging',
  'narrative': 'narrative',
  'positioning': 'positioning',
  'sales-enablement': 'sales enablement',
};

function playbooksList(){
  const byCat = {};
  playbooks.forEach(p => {
    const key = playbookCategoryFromPath(p.path);
    (byCat[key] = byCat[key] || []).push(p);
  });
  const order = Object.keys(byCat).sort((a, b) => byCat[b].length - byCat[a].length || a.localeCompare(b));
  app.innerHTML = `<section class='list-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>playbooks</span></div>
    <h1>methodology playbooks</h1>
    <p class='lede'>${STATS.playbooks} playbooks across ${order.length} categories. Each bundles operator-attributed insights into a working procedure with inputs, process, outputs, and quality gates.</p>
    ${order.map(cat => {
      const items = byCat[cat];
      const label = PLAYBOOK_CATEGORY_LABELS[cat] || cat;
      return `
      <section class='tier-group'>
        <header class='tier-head'>
          <h2>${label}</h2>
          <span class='ct'>${items.length} playbook${items.length===1?'':'s'}</span>
        </header>
        <div class='pb-grid'>${items.map(p => `
          <a class='card pb-card reveal' href='#/play/${p.id}'>
            <div class='meta-row'><span>playbook</span><span>${(p.domain||[]).slice(0,3).join(' · ')}</span></div>
            <h3>${escapeHtml(p.title)}</h3>
            <div class='converge'>${(p.uses_cards||[]).length} insight${(p.uses_cards||[]).length===1?'':'s'} · ${(p.originating_operators||[]).length} operator${(p.originating_operators||[]).length===1?'':'s'}</div>
          </a>`).join('')}</div>
      </section>`;
    }).join('')}
  </section>`;
  if (!reduced) ScrollTrigger.batch('.card.reveal', { onEnter: els => gsap.fromTo(els, { opacity:0, y:18 }, { opacity:1, y:0, duration:.6, ease:'power3.out', stagger:.03 }), start:'top 92%' });
}

async function playbookPage(id){
  let p = playbooks.find(x => x.id === id);
  if (!p && !id.startsWith('pb_')) p = playbooks.find(x => x.id === 'pb_' + id);
  if (!p) p = playbooks.find(x => (x.path || '').toLowerCase().endsWith('/' + id.toLowerCase() + '.md'));
  if (!p){ app.innerHTML = `<div class='insight-page'><p>playbook not found.</p></div>`; return; }
  const cat = playbookCategoryFromPath(p.path);
  const catLabel = PLAYBOOK_CATEGORY_LABELS[cat] || cat;
  // Render skeleton immediately
  app.innerHTML = `<article class='insight-page playbook-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/playbooks'>playbooks</a> <span>·</span> <span>${escapeHtml(catLabel)}</span></div>
    <header class='playbook-head'>
      <div class='meta-row' style='margin-bottom:14px;font-family:var(--mono);font-size:.7rem;color:var(--muted)'>
        <span>${escapeHtml(catLabel)}</span>
        ${p.captured_date ? `<span>·</span><span>${escapeHtml(p.captured_date)}</span>` : ''}
        ${p.maintained_by ? `<span>·</span><span>maintained by ${escapeHtml(p.maintained_by)}</span>` : ''}
      </div>
      <h1>${escapeHtml(p.title)}</h1>
      <div class='chips'>${(p.domain||[]).map(d => `<a class='chip-link' href='#/d/${d}'>${escapeHtml(d)}</a>`).join('')}</div>
    </header>

    ${(p.originating_operators||[]).length ? `
    <section class='playbook-section'>
      <h2>Originating operators</h2>
      <div class='chips'>${p.originating_operators.map(slug => {
        const op = operators.find(o => o.slug === slug);
        return `<a class='chip-link' href='#/o/${slug}'>${escapeHtml(op ? op.name : slug)}</a>`;
      }).join('')}</div>
    </section>` : ''}

    ${(p.uses_cards||[]).length ? `
    <section class='playbook-section'>
      <h2>Insights used (${p.uses_cards.length})</h2>
      <div class='card-grid'>${p.uses_cards.map(insId => {
        const c = cards.find(x => x.id === insId);
        if (!c) return `<div class='card' style='opacity:.5'><div class='meta-row'><span>missing</span></div><h3>${escapeHtml(insId)}</h3></div>`;
        return `<a class='card reveal' href='#/ins/${c.id}'>
          <div class='meta-row'>${tierBadge(c.tier)}<span>${escapeHtml(c.operator || '')}</span></div>
          <h3>${escapeHtml(c.claim || c.title || c.id)}</h3>
        </a>`;
      }).join('')}</div>
    </section>` : ''}

    <section class='playbook-section playbook-body' id='playbookBody'>
      <h2>Playbook</h2>
      <div class='playbook-content'><p class='lede' style='color:var(--muted)'>loading playbook…</p></div>
    </section>

    <section class='playbook-section'>
      <p style='color:var(--muted);font-size:.85rem'>Source on <a href='https://github.com/k3sava/ab-codex/blob/main/insight-library/${p.path}' target='_blank' rel='noopener'>GitHub</a>.</p>
    </section>
  </article>`;

  // Fetch markdown body
  try {
    const res = await fetch(`https://raw.githubusercontent.com/k3sava/ab-codex/main/insight-library/${p.path}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();
    // Strip frontmatter
    let body = md;
    if (body.startsWith('---\n')){
      const end = body.indexOf('\n---', 4);
      if (end >= 0) body = body.slice(end + 4).trimStart();
    }
    // Strip the leading H1 (already in header)
    body = body.replace(/^#\s+[^\n]+\n+/, '');
    const target = document.querySelector('.playbook-content');
    if (target) target.innerHTML = renderMarkdown(body);
  } catch (e){
    const target = document.querySelector('.playbook-content');
    if (target) target.innerHTML = `<p style='color:var(--muted)'>Could not load playbook body. <a href='https://github.com/k3sava/ab-codex/blob/main/insight-library/${p.path}' target='_blank' rel='noopener'>Read on GitHub</a>.</p>`;
  }

  if (!reduced) ScrollTrigger.batch('.card.reveal', { onEnter: els => gsap.fromTo(els, { opacity:0, y:18 }, { opacity:1, y:0, duration:.6, ease:'power3.out', stagger:.03 }), start:'top 92%' });
}

// Minimal markdown renderer for playbook bodies — headings, lists, paragraphs, links, code, bold.
function renderMarkdown(md){
  const lines = md.split('\n');
  const out = [];
  let inList = false;
  let inCode = false;
  let para = [];
  const flushPara = () => { if (para.length){ out.push(`<p>${inlineMd(para.join(' '))}</p>`); para = []; } };
  const closeList = () => { if (inList){ out.push('</ul>'); inList = false; } };
  for (const ln of lines){
    if (ln.startsWith('```')){
      flushPara(); closeList();
      if (!inCode){ out.push('<pre><code>'); inCode = true; }
      else { out.push('</code></pre>'); inCode = false; }
      continue;
    }
    if (inCode){ out.push(escapeHtml(ln)); continue; }
    if (/^#{1,6}\s/.test(ln)){
      flushPara(); closeList();
      const m = ln.match(/^(#{1,6})\s+(.*)$/);
      const lv = Math.min(m[1].length + 1, 6);
      out.push(`<h${lv}>${inlineMd(m[2])}</h${lv}>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(ln)){
      flushPara();
      if (!inList){ out.push('<ul>'); inList = true; }
      out.push(`<li>${inlineMd(ln.replace(/^\s*[-*]\s+/, ''))}</li>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(ln)){
      flushPara();
      if (!inList){ out.push('<ol>'); inList = 'ol'; }
      out.push(`<li>${inlineMd(ln.replace(/^\s*\d+\.\s+/, ''))}</li>`);
      continue;
    }
    if (ln.trim() === ''){
      flushPara(); closeList();
      continue;
    }
    para.push(ln);
  }
  flushPara(); closeList();
  return out.join('\n');
}
function inlineMd(s){
  // links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href='${escapeHtml(u)}' target='_blank' rel='noopener'>${escapeHtml(t)}</a>`);
  // bold **x**
  s = s.replace(/\*\*([^*]+)\*\*/g, (_, t) => `<strong>${escapeHtml(t)}</strong>`);
  // inline code `x`
  s = s.replace(/`([^`]+)`/g, (_, t) => `<code>${escapeHtml(t)}</code>`);
  // remaining text — already escaped where needed inside replacers; outside text isn't escaped, do it now
  // Actually our replacers escape inside themselves; unmatched text passes through with original chars.
  // To keep it simple, wrap in a final pass that escapes lone < > & not inside a tag — skip for now (input is trusted markdown).
  return s;
}

async function patternPage(id){
  const p = patterns.find(x=>x.id===id);
  if (!p){ app.innerHTML = `<div class='insight-page'><p>pattern not found.</p></div>`; return; }
  // Build operator-converge data
  const usedCards = (p.uses_cards||[]).map(cid => cards.find(x => x.id === cid)).filter(Boolean);
  const uniqOps = [...new Set(usedCards.map(c => c.operator))];
  const N = uniqOps.length;
  // Radial SVG: operators arranged in a circle around the pattern title
  const W = 520, H = 360, cx = W/2, cy = H/2, r = Math.min(W, H) * 0.36;
  const radial = N > 0 ? `<svg class='pat-radial' viewBox='0 0 ${W} ${H}' aria-hidden='true'>
    ${uniqOps.map((_, i) => {
      const a = (i / N) * 2 * Math.PI - Math.PI/2;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      return `<line x1='${cx}' y1='${cy}' x2='${x.toFixed(1)}' y2='${y.toFixed(1)}' class='pat-radial-line' />`;
    }).join('')}
    <circle cx='${cx}' cy='${cy}' r='28' class='pat-radial-core' />
    <text x='${cx}' y='${cy + 4}' text-anchor='middle' class='pat-radial-core-text'>${N}</text>
    ${uniqOps.map((name, i) => {
      const a = (i / N) * 2 * Math.PI - Math.PI/2;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      const labelX = cx + (r + 24) * Math.cos(a);
      const labelY = cy + (r + 24) * Math.sin(a);
      const anchor = Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle';
      const op = operators.find(o => o.name === name);
      const slug = op ? op.slug : slugify(name);
      return `<g class='pat-radial-op' data-slug='${slug}'>
        <circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='6' class='pat-radial-dot' />
        <text x='${labelX.toFixed(1)}' y='${(labelY + 4).toFixed(1)}' text-anchor='${anchor}' class='pat-radial-label'>${escapeHtml(name)}</text>
      </g>`;
    }).join('')}
  </svg>` : '';

  app.innerHTML = `<article class='pattern-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/patterns'>patterns</a> <span>·</span> <span>${p.id}</span></div>
    <header class='pat-head'>
      <div class='pat-meta'>
        ${p.tier ? tierBadge(p.tier) : ''}
        <span class='pat-eyebrow'>synthesis pattern</span>
        ${(p.domains||[]).slice(0,3).map(d => `<a class='pat-dom' href='#/d/${d}'>${d}</a>`).join('')}
      </div>
      <h1>${escapeHtml(p.title)}</h1>
      <p class='pat-converge-line'>${N} operators converge from ${[...new Set(usedCards.flatMap(c => c.domain || []))].length} domains</p>
    </header>
    ${radial ? `<div class='pat-radial-wrap'>${radial}</div>` : ''}
    <div class='pat-layout'>
      <main class='pat-body' id='patBody'>
        <p style='color:var(--muted);font-family:var(--mono);font-size:.8rem'>loading…</p>
      </main>
      <aside class='pat-side'>
        <h4>operator quotes</h4>
        <ul class='pat-quotes'>${usedCards.map(c => `
          <li><a href='#/ins/${c.id}'>
            <span class='pat-quote-op'>${escapeHtml(c.operator)}</span>
            <span class='pat-quote-claim'>${escapeHtml(c.claim || c.id)}</span>
            ${tierBadge(c.tier)}
          </a></li>`).join('')}</ul>
      </aside>
    </div>
    <p class='pat-source'><a href='${REPO_BASE}/insight-library/${p.path}' target='_blank' rel='noopener'>Source on GitHub →</a></p>
  </article>`;
  // Wire radial → operator
  document.querySelectorAll('.pat-radial-op').forEach(g => {
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => location.hash = `#/o/${g.dataset.slug}`);
  });
  const md = await fetchBody(p.path);
  // Strip frontmatter, leading H1, and duplicated Operators/Sources sections (rendered in side rail)
  const stripFm = m => m.startsWith('---\n') ? m.slice(m.indexOf('\n---', 4) + 4).trimStart() : m;
  const cleaned = stripMdSections(stripFm(md).replace(/^#\s+[^\n]+\n+/, ''), ['operators','sources','sources captured']);
  document.getElementById('patBody').innerHTML = mdToHtml(cleaned);
  if (!reduced){
    gsap.from('.pat-head > *', { opacity:0, y:14, duration:.6, ease:'power2.out', stagger:.06 });
    gsap.from('.pat-radial-line', { opacity:0, drawSVG:0, duration:.8, stagger:.04, ease:'power2.out', delay:.3 });
    gsap.from('.pat-radial-op', { opacity:0, scale:.6, duration:.5, stagger:.04, ease:'back.out(1.5)', delay:.4, transformOrigin:'center' });
    gsap.from('.pat-radial-core', { opacity:0, scale:.4, duration:.6, ease:'back.out(1.7)', delay:.2, transformOrigin:'center' });
  }
}

async function contradictionPage(id){
  const c = contradictions.find(x=>x.id===id);
  if (!c){ app.innerHTML = `<div class='insight-page'><p>not found.</p></div>`; return; }
  // Skeleton
  app.innerHTML = `<article class='contradiction-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/patterns'>patterns</a> <span>·</span> <span>contradiction</span></div>
    <div class='con-stage' id='conStage'><p style='color:var(--muted);font-family:var(--mono);font-size:.8rem;text-align:center;padding:80px 0'>loading…</p></div>
  </article>`;
  const md = await fetchBody(c.path);
  // Parse the two positions
  const stripFrontmatter = m => m.startsWith('---\n') ? m.slice(m.indexOf('\n---', 4) + 4).trimStart() : m;
  const body = stripFrontmatter(md).replace(/^#\s+[^\n]+\n+/, '');
  const sections = body.split(/^##\s+/m).slice(1); // first split is empty before first ##
  const posA = sections.find(s => /^Position A/i.test(s));
  const posB = sections.find(s => /^Position B/i.test(s));
  const conditions = sections.find(s => /^Conditions/i.test(s));
  const resolution = sections.find(s => /^Resolution|^Synthesis/i.test(s));

  const parsePos = (raw) => {
    if (!raw) return null;
    const lines = raw.split('\n');
    const heading = lines[0].replace(/^[^—–-]+[—–-]\s*/, '').trim();
    let op = '', claim = '', cardIds = [];
    for (let i = 1; i < lines.length; i++){
      const l = lines[i];
      if (/^[-*]\s*Operator:/i.test(l)) op = l.replace(/^[-*]\s*Operator:\s*/i, '').trim();
      else if (/^[-*]\s*Card[s]?:/i.test(l)){
        const m = l.replace(/^[-*]\s*Card[s]?:\s*/i, '');
        cardIds = [...m.matchAll(/`(ins_[^`]+)`/g)].map(x=>x[1]);
      }
      else if (/^[-*]\s*Claim:/i.test(l)) claim = l.replace(/^[-*]\s*Claim:\s*/i, '').trim();
      // also pick up multi-line claim continuation
      else if (claim && l.startsWith('  ')) claim += ' ' + l.trim();
    }
    return { heading, op, claim, cardIds };
  };
  const A = parsePos(posA);
  const B = parsePos(posB);

  const opLink = name => {
    if (!name) return '';
    const op = operators.find(o => o.name === name);
    return op ? `<a class='con-op' href='#/o/${op.slug}'>${escapeHtml(name)}</a>` : `<span class='con-op'>${escapeHtml(name)}</span>`;
  };
  const cardLink = id => {
    const card = cards.find(x => x.id === id);
    return card ? `<a class='con-card' href='#/ins/${id}'>${tierBadge(card.tier)}<span>${escapeHtml(card.claim || id)}</span></a>` : '';
  };
  const fmtBlock = raw => raw ? mdToHtml(raw.split('\n').slice(1).join('\n')) : '';

  document.getElementById('conStage').innerHTML = `
    <div class='con-meta'>
      <span class='con-eyebrow'>contradiction</span>
      ${c.captured_date ? `<span>·</span><span>${escapeHtml(c.captured_date)}</span>` : ''}
    </div>
    <h1 class='con-title'>${escapeHtml(c.title)}</h1>
    <div class='con-versus'>
      <section class='con-side con-side-a'>
        <header><span class='con-tag'>Position A</span></header>
        ${A ? `<h2>${escapeHtml(A.heading)}</h2>` : ''}
        ${A?.op ? `<div class='con-op-row'>${opLink(A.op)}</div>` : ''}
        ${A?.claim ? `<p class='con-claim'>${escapeHtml(A.claim)}</p>` : ''}
        ${A?.cardIds?.length ? `<div class='con-cards'>${A.cardIds.map(cardLink).join('')}</div>` : ''}
      </section>
      <div class='con-vs' aria-hidden='true'><span>vs</span></div>
      <section class='con-side con-side-b'>
        <header><span class='con-tag'>Position B</span></header>
        ${B ? `<h2>${escapeHtml(B.heading)}</h2>` : ''}
        ${B?.op ? `<div class='con-op-row'>${opLink(B.op)}</div>` : ''}
        ${B?.claim ? `<p class='con-claim'>${escapeHtml(B.claim)}</p>` : ''}
        ${B?.cardIds?.length ? `<div class='con-cards'>${B.cardIds.map(cardLink).join('')}</div>` : ''}
      </section>
    </div>
    ${conditions ? `<section class='con-section'><h3>Where they differ</h3><div class='con-prose'>${fmtBlock(conditions)}</div></section>` : ''}
    ${resolution ? `<section class='con-section con-resolution'><h3>Reconciliation</h3><div class='con-prose'>${fmtBlock(resolution)}</div></section>` : ''}
    <p class='con-source'><a href='https://github.com/k3sava/ab-codex/blob/main/insight-library/${c.path}' target='_blank' rel='noopener'>Source on GitHub →</a></p>
  `;
  if (!reduced){
    gsap.from('.con-side-a', { opacity:0, x:-24, duration:.6, ease:'power3.out' });
    gsap.from('.con-side-b', { opacity:0, x:24, duration:.6, ease:'power3.out' });
    gsap.from('.con-vs', { opacity:0, scale:.6, duration:.5, ease:'back.out(1.7)', delay:.2 });
  }
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

/* ============ BROWSE — dual-pane condensed list ============ */
const browseState = { tier:'all', domain:'all', sort:'date', q:'' };
function browse(){
  const tierCounts = { A: cards.filter(c=>c.tier==='A').length, B: cards.filter(c=>c.tier==='B').length, C: cards.filter(c=>c.tier==='C').length };
  const domCounts = Object.fromEntries(DOMAINS.map(d => [d, cards.filter(c => c.domain.includes(d)).length]));
  app.innerHTML = `<section class='browse-page browse-dual'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>browse</span></div>
    <header class='browse-head'>
      <h1>browse</h1>
      <div class='browse-meta'><span id='browseResults'>${STATS.cards}</span> of ${STATS.cards} cards</div>
    </header>
    <div class='browse-shell'>
      <aside class='browse-rail' id='browseRail'>
        <div class='br-search'><input id='browseQ' type='search' placeholder='search claims, operators…' value='${escapeHtml(browseState.q)}' /></div>
        <div class='br-section'>
          <div class='br-label'>sort</div>
          <div class='br-row'>
            <button class='chip ${browseState.sort==='date'?'active':''}' data-sort='date'>date</button>
            <button class='chip ${browseState.sort==='tier'?'active':''}' data-sort='tier'>tier</button>
            <button class='chip ${browseState.sort==='operator'?'active':''}' data-sort='operator'>operator</button>
          </div>
        </div>
        <div class='br-section'>
          <div class='br-label'>tier</div>
          <div class='br-list'>
            <button class='br-item ${browseState.tier==='all'?'active':''}' data-tier='all'><span>all</span><span class='ct'>${STATS.cards}</span></button>
            <button class='br-item ${browseState.tier==='A'?'active':''}' data-tier='A'><span>tier A</span><span class='ct'>${tierCounts.A}</span></button>
            <button class='br-item ${browseState.tier==='B'?'active':''}' data-tier='B'><span>tier B</span><span class='ct'>${tierCounts.B}</span></button>
            <button class='br-item ${browseState.tier==='C'?'active':''}' data-tier='C'><span>tier C</span><span class='ct'>${tierCounts.C}</span></button>
          </div>
        </div>
        <div class='br-section'>
          <div class='br-label'>domain</div>
          <div class='br-list'>
            <button class='br-item ${browseState.domain==='all'?'active':''}' data-domain='all'><span>all</span><span class='ct'>${STATS.cards}</span></button>
            ${DOMAINS.filter(d => domCounts[d] > 0).sort((a,b)=>domCounts[b]-domCounts[a]).map(d=>`<button class='br-item ${browseState.domain===d?'active':''}' data-domain='${d}'><span>${d}</span><span class='ct'>${domCounts[d]}</span></button>`).join('')}
          </div>
        </div>
      </aside>
      <button class='browse-rail-toggle' id='browseRailToggle' aria-label='Open filters'>filters</button>
      <main class='browse-list' id='browseList'></main>
    </div>
  </section>`;
  applyBrowse();
  document.querySelectorAll('#browseRail [data-tier]').forEach(b => b.onclick = () => { browseState.tier = b.dataset.tier; updateBrowse(); });
  document.querySelectorAll('#browseRail [data-domain]').forEach(b => b.onclick = () => { browseState.domain = b.dataset.domain; updateBrowse(); });
  document.querySelectorAll('#browseRail [data-sort]').forEach(b => b.onclick = () => { browseState.sort = b.dataset.sort; updateBrowse(); });
  const qel = document.getElementById('browseQ');
  qel.addEventListener('input', e => { browseState.q = e.target.value; clearTimeout(window._brT); window._brT = setTimeout(updateBrowse, 100); });
  document.getElementById('browseRailToggle').onclick = () => document.getElementById('browseRail').classList.toggle('open');
}
function applyBrowse(){
  let list = cards.slice();
  if (browseState.tier !== 'all') list = list.filter(c => c.tier === browseState.tier);
  if (browseState.domain !== 'all') list = list.filter(c => c.domain.includes(browseState.domain));
  const q = browseState.q.toLowerCase();
  if (q) list = list.filter(c => (c.claim||'').toLowerCase().includes(q) || (c.operator||'').toLowerCase().includes(q));
  if (browseState.sort === 'date') list.sort((a,b) => (b.source_date||'').localeCompare(a.source_date||''));
  else if (browseState.sort === 'operator') list.sort((a,b) => a.operator.localeCompare(b.operator) || (b.source_date||'').localeCompare(a.source_date||''));
  else if (browseState.sort === 'tier') list.sort((a,b) => a.tier.localeCompare(b.tier) || (b.source_date||'').localeCompare(a.source_date||''));
  const out = document.getElementById('browseList');
  const results = document.getElementById('browseResults');
  if (!out) return;
  if (results) results.textContent = list.length;
  if (list.length === 0){ out.innerHTML = `<div class='browse-empty'>no cards match these filters.</div>`; return; }

  // Group by tier when sort is tier; otherwise no groups
  const rowHtml = c => `<a class='brow reveal' href='#/ins/${c.id}'>
    ${tierBadge(c.tier)}
    <span class='brow-domain'>${(c.domain[0]||'·')}</span>
    <span class='brow-claim'>${escapeHtml(c.claim)}</span>
    <span class='brow-op'>${escapeHtml(c.operator)}</span>
    <span class='brow-date'>${c.source_date||'—'}</span>
  </a>`;
  if (browseState.sort === 'tier'){
    const groups = { A: list.filter(c=>c.tier==='A'), B: list.filter(c=>c.tier==='B'), C: list.filter(c=>c.tier==='C'), other: list.filter(c=>!['A','B','C'].includes(c.tier)) };
    const block = (lab, arr) => arr.length ? `<section class='brow-group'><header class='brow-group-head'><h2>tier ${lab}</h2><span class='ct'>${arr.length}</span></header><div class='brow-rows'>${arr.map(rowHtml).join('')}</div></section>` : '';
    out.innerHTML = block('A', groups.A) + block('B', groups.B) + block('C', groups.C) + block('—', groups.other);
  } else {
    out.innerHTML = `<div class='brow-rows'>${list.map(rowHtml).join('')}</div>`;
  }
  if (!reduced) ScrollTrigger.batch('.brow.reveal', { onEnter: els => gsap.fromTo(els, { opacity:0, x:-6 }, { opacity:1, x:0, duration:.3, ease:'power2.out', stagger:.005 }), start:'top 96%' });
}
function updateBrowse(){
  document.querySelectorAll('#browseRail [data-tier]').forEach(b => b.classList.toggle('active', b.dataset.tier === browseState.tier));
  document.querySelectorAll('#browseRail [data-domain]').forEach(b => b.classList.toggle('active', b.dataset.domain === browseState.domain));
  document.querySelectorAll('#browseRail [data-sort]').forEach(b => b.classList.toggle('active', b.dataset.sort === browseState.sort));
  applyBrowse();
}

/* ============ TIMELINE ============ */
// Persisted timeline filter state — survives re-renders triggered by filter changes.
const tlFilter = window.tlFilter || (window.tlFilter = { tiers: new Set(['A','B','C']), domains: new Set() });
function tlMatches(c){
  if (!tlFilter.tiers.has(c.tier || 'C')) return false;
  if (tlFilter.domains.size === 0) return true; // empty domains set = no domain restriction
  for (const d of c.domain) if (tlFilter.domains.has(d)) return true;
  return false;
}

function timeline(){
  // Apply filters to corpus
  const allDated = cards.filter(c => /^\d{4}-\d{2}/.test(c.source_date||''));
  const allUndated = cards.filter(c => !/^\d{4}-\d{2}/.test(c.source_date||''));
  const dated = allDated.filter(tlMatches);
  const undated = allUndated.filter(tlMatches);
  dated.sort((a,b)=> (b.source_date||'').localeCompare(a.source_date||''));
  const months = new Map();
  for (const c of dated){
    const ym = c.source_date.slice(0,7);
    if (!months.has(ym)) months.set(ym, []);
    months.get(ym).push(c);
  }
  const orderedMonths = [...months.keys()]; // newest first (matches dated sort)
  // Density-scaled spark — each month bar's width is proportional to its card count, oldest → newest
  const monthKeysAsc = [...months.keys()].sort();
  const dayKeys = [...new Set(dated.map(c => c.source_date.slice(0,10)))].sort();
  const totalCards = dated.length;
  const maxCt = Math.max(1, ...[...months.values()].map(arr => arr.length));
  const fmtMonth = ym => {
    const [y, m] = ym.split('-');
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${monthNames[+m-1]} ${y}`;
  };
  // Bars: flex-sized by card count. Height of inner fill encodes density.
  const barEls = monthKeysAsc.map(ym => {
    const ct = months.get(ym).length;
    const heightPct = Math.max(8, (ct / maxCt) * 100);
    return `<button class='tspark-bar' data-ym='${ym}' style='flex:${ct}' aria-label='${fmtMonth(ym)} — ${ct} card${ct===1?'':'s'}' title='${fmtMonth(ym)} — ${ct} card${ct===1?'':'s'}'>
      <span class='tspark-fill' style='height:${heightPct.toFixed(1)}%'></span>
    </button>`;
  }).join('');
  // Year tick row: absolutely-positioned labels at cumulative-card percentages.
  // Sparse years would get tiny flex widths and truncate, so we position by
  // cumulative-card-count and hide labels that would overlap their neighbour.
  const years = [...new Set(monthKeysAsc.map(k => k.slice(0,4)))];
  const yearTotals = years.map(y => monthKeysAsc.filter(k => k.startsWith(y+'-')).reduce((s,k) => s + months.get(k).length, 0));
  // cumulative start position (percentage) of each year's bar block in the density-scaled axis
  const totalAll = yearTotals.reduce((a,b) => a+b, 0) || 1;
  const yearStartsPct = [];
  let acc = 0;
  for (const t of yearTotals){ yearStartsPct.push((acc / totalAll) * 100); acc += t; }
  // First pass — render every year as a tick + label; collision detection runs after layout.
  const yearEls = years.map((y, i) => `<button class='tspark-year' data-year='${y}' data-pct='${yearStartsPct[i].toFixed(3)}' data-cards='${yearTotals[i]}' style='left:${yearStartsPct[i].toFixed(3)}%' aria-label='Jump to ${y} (${yearTotals[i]} card${yearTotals[i]===1?'':'s'})'><span class='tspark-tick' aria-hidden='true'></span><span class='tspark-year-label'>${y}</span></button>`).join('');
  // Bar control row: undated link, total
  const sparkSvg = monthKeysAsc.length > 0 ? `<div class='timeline-spark-wrap' role='tablist' aria-label='Timeline navigation'>
    <div class='timeline-spark-bars'>${barEls}</div>
    <div class='timeline-spark-years'>${yearEls}</div>
  </div>` : '';
  // Filter chips — built from the un-filtered corpus so the choices stay stable
  const allDomains = [...new Set(allDated.flatMap(c => c.domain))].sort();
  const tierCounts = { A: 0, B: 0, C: 0 };
  for (const c of allDated) tierCounts[c.tier || 'C']++;
  const domainCounts = new Map();
  for (const c of allDated) for (const d of c.domain) domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
  const tierChips = ['A','B','C'].map(t => `<button class='tlfilter-chip tlfilter-tier ${tlFilter.tiers.has(t) ? 'on' : ''}' data-tier='${t}'>tier ${t}<span class='tlfilter-ct'>${tierCounts[t]}</span></button>`).join('');
  const domainChips = allDomains.map(d => `<button class='tlfilter-chip tlfilter-domain ${tlFilter.domains.has(d) ? 'on' : ''}' data-domain='${d}'>${d}<span class='tlfilter-ct'>${domainCounts.get(d) || 0}</span></button>`).join('');
  const filterActive = tlFilter.tiers.size < 3 || tlFilter.domains.size > 0;
  const filterRow = `<div class='tlfilter'>
    <span class='tlfilter-label'>tier</span>
    <div class='tlfilter-group'>${tierChips}</div>
    <span class='tlfilter-divider' aria-hidden='true'></span>
    <span class='tlfilter-label'>domain</span>
    <div class='tlfilter-group tlfilter-domains'>${domainChips}</div>
    ${filterActive ? `<button class='tlfilter-reset'>reset</button>` : ''}
  </div>`;
  app.innerHTML = `<section class='timeline-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>timeline</span></div>
    <h1>timeline</h1>
    <p class='lede'>${dated.length} dated insights · ${dayKeys.length} active days · ${dayKeys[0]||'—'} → ${dayKeys[dayKeys.length-1]||'—'}. <span class='timeline-hint'>bar width = cards in month · click to jump · highlight follows scroll</span></p>
    ${filterRow}
    ${sparkSvg}
    <div class='timeline-stream'>${orderedMonths.map(ym => `
      <section class='tmonth' data-ym='${ym}' id='tm-${ym}'>
        <header class='tmonth-head'><h2>${fmtMonth(ym)}</h2><span class='ct'>${months.get(ym).length}</span></header>
        <div class='tmonth-rows'>${months.get(ym).map(c=>`
          <a class='trow reveal' href='#/ins/${c.id}'>
            <span class='trow-claim'>${escapeHtml(c.claim)}</span>
            <span class='trow-who'>${escapeHtml(c.operator)}</span>
            <span class='trow-date'>${c.source_date.slice(0,10)}</span>
            ${tierBadge(c.tier)}
          </a>`).join('')}</div>
      </section>`).join('')}
      ${undated.length ? `<section class='tmonth' data-ym='undated' id='tm-undated'>
        <header class='tmonth-head'><h2>Undated</h2><span class='ct'>${undated.length}</span></header>
        <div class='tmonth-rows'>${undated.map(c=>`
          <a class='trow reveal' href='#/ins/${c.id}'>
            <span class='trow-claim'>${escapeHtml(c.claim)}</span>
            <span class='trow-who'>${escapeHtml(c.operator)}</span>
            <span class='trow-date'>—</span>
            ${tierBadge(c.tier)}
          </a>`).join('')}</div>
      </section>` : ''}
    </div>
  </section>`;

  // Year-label collision detection.
  // Strategy: prioritise high-card-count years and the latest year, then place oldest as a baseline.
  // Place labels in priority order; for each, hide it if its label box would overlap any already-placed label.
  // The tick mark stays visible regardless.
  const reflowYearLabels = () => {
    const yearsRow = document.querySelector('.timeline-spark-years');
    if (!yearsRow) return;
    const rowWidth = yearsRow.getBoundingClientRect().width;
    if (!rowWidth) return;
    const labels = Array.from(yearsRow.querySelectorAll('.tspark-year'));
    if (!labels.length) return;
    const minGap = 8;
    // Reset
    labels.forEach(el => el.classList.add('label-hidden'));
    // Measure each label's width (force show momentarily)
    const measured = labels.map(el => {
      const lbl = el.querySelector('.tspark-year-label');
      lbl.style.visibility = 'hidden';
      lbl.style.display = 'inline-block';
      const w = lbl.getBoundingClientRect().width;
      lbl.style.visibility = '';
      lbl.style.display = '';
      const leftPct = +(el.dataset.pct || 0);
      const leftPx = (leftPct / 100) * rowWidth;
      const cards = +(el.dataset.cards || 0);
      const idx = labels.indexOf(el);
      return { el, leftPx, w, cards, idx };
    });
    // Priority order: latest year first (idx=last), then by card count desc, then oldest (idx=0).
    const placed = []; // sorted by leftPx for collision check
    const placeIfFits = (item) => {
      const start = item.leftPx;
      const end = item.leftPx + item.w;
      // Adjust if running off the right edge
      const adjustedEnd = Math.min(end, rowWidth);
      const adjustedStart = adjustedEnd === rowWidth ? rowWidth - item.w : start;
      for (const p of placed){
        const pStart = p.adjustedStart;
        const pEnd = pStart + p.w;
        if (!(adjustedEnd + minGap <= pStart || adjustedStart >= pEnd + minGap)){
          return false; // overlaps
        }
      }
      item.adjustedStart = adjustedStart;
      placed.push(item);
      placed.sort((a,b) => a.adjustedStart - b.adjustedStart);
      item.el.classList.remove('label-hidden');
      // If we shifted leftward to fit on screen, update the left style so the label aligns where it actually sits
      if (adjustedStart !== start){
        item.el.style.left = ((adjustedStart / rowWidth) * 100).toFixed(3) + '%';
      } else {
        item.el.style.left = '';
        item.el.style.left = ((start / rowWidth) * 100).toFixed(3) + '%';
      }
      return true;
    };
    // 1. Latest year always
    placeIfFits(measured[measured.length - 1]);
    // 2. Oldest year (gives left-edge anchor)
    if (measured.length > 1) placeIfFits(measured[0]);
    // 3. Remaining by card count desc, then by leftPx asc as tiebreaker
    const remaining = measured.slice(1, -1).sort((a,b) => b.cards - a.cards || a.leftPx - b.leftPx);
    for (const item of remaining) placeIfFits(item);
  };

  // Wire clicks — bar or year jumps to first matching .tmonth
  const setActive = (ym) => {
    document.querySelectorAll('.tspark-bar').forEach(b => b.classList.toggle('active', b.dataset.ym === ym));
    const y = ym && ym.slice(0,4);
    document.querySelectorAll('.tspark-year').forEach(el => el.classList.toggle('active', el.dataset.year === y));
  };
  const scrollToMonth = (ym) => {
    const el = document.getElementById('tm-' + ym);
    if (!el) return;
    // Account for sticky header + hello bar + spark wrap height when scrolling.
    const wrap = document.querySelector('.timeline-spark-wrap');
    const wrapH = wrap ? wrap.getBoundingClientRect().height : 0;
    const helloH = document.querySelector('.hello-bar:not([hidden])') ? 32 : 0;
    const offset = 60 /* hdr */ + helloH + wrapH + 16;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };
  document.querySelectorAll('.tspark-bar').forEach(b => b.addEventListener('click', () => {
    setActive(b.dataset.ym);
    scrollToMonth(b.dataset.ym);
  }));
  document.querySelectorAll('.tspark-year').forEach(el => el.addEventListener('click', () => {
    // Jump to the first month of that year present in the corpus (chronologically earliest, since we render newest-first)
    const y = el.dataset.year;
    const yMonths = orderedMonths.filter(k => k.startsWith(y+'-')).sort(); // ascending → first month of year
    if (yMonths.length){ setActive(yMonths[0]); scrollToMonth(yMonths[0]); }
  }));

  // After layout settles, hide overlapping year labels.
  reflowYearLabels();
  let resizeT = 0;
  const onResize = () => { clearTimeout(resizeT); resizeT = setTimeout(reflowYearLabels, 80); };
  window.addEventListener('resize', onResize, { passive: true });

  // Filter chip handlers — toggle and re-render the timeline page in place
  const reRender = () => {
    const y = window.scrollY;
    timeline();
    // Restore scroll position so users don't lose their place when toggling filters
    window.scrollTo(0, y);
  };
  document.querySelectorAll('.tlfilter-tier').forEach(btn => btn.addEventListener('click', () => {
    const t = btn.dataset.tier;
    if (tlFilter.tiers.has(t)) tlFilter.tiers.delete(t); else tlFilter.tiers.add(t);
    if (tlFilter.tiers.size === 0) tlFilter.tiers = new Set(['A','B','C']); // never empty — reset to all
    reRender();
  }));
  document.querySelectorAll('.tlfilter-domain').forEach(btn => btn.addEventListener('click', () => {
    const d = btn.dataset.domain;
    if (tlFilter.domains.has(d)) tlFilter.domains.delete(d); else tlFilter.domains.add(d);
    reRender();
  }));
  const resetBtn = document.querySelector('.tlfilter-reset');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    tlFilter.tiers = new Set(['A','B','C']);
    tlFilter.domains.clear();
    reRender();
  });

  // Scroll-driven active bar — find the .tmonth whose top is closest below the spark, fallback to last passed
  if (orderedMonths.length){
    setActive(orderedMonths[0]); // default: newest month (top of stream, since cards are sorted desc)
    const sections = Array.from(document.querySelectorAll('.tmonth'));
    let lastActive = orderedMonths[0];
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const wrap = document.querySelector('.timeline-spark-wrap');
        const sparkBottom = wrap ? wrap.getBoundingClientRect().bottom : 0;
        // Active = first section whose top is at or just below the spark (the one being entered into).
        const threshold = sparkBottom - 8;
        let active = null;
        for (const s of sections){
          if (s.getBoundingClientRect().top >= threshold){ active = s.dataset.ym; break; }
        }
        // If nothing is below the spark, we've scrolled past everything → use the last (oldest) section.
        if (!active) active = sections[sections.length - 1]?.dataset.ym;
        if (active && active !== lastActive){
          lastActive = active;
          setActive(active);
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial sync (in case the page loaded scrolled)
    onScroll();
  }

  if (!reduced) ScrollTrigger.batch('.trow.reveal', { onEnter: els => gsap.fromTo(els, { opacity:0, x:-8 }, { opacity:1, x:0, duration:.4, ease:'power2.out', stagger:.008 }), start:'top 95%' });
}

/* ============ ABOUT (scrubbed copy) ============ */
function about(){
  app.innerHTML = `<section class='about-page'>
    <h1>about a builder's codex</h1>
    <p>A builder's codex is an open, primary-source library of operator insights. Each card carries a named operator, a verifiable source URL, and a date — so anyone can read one claim, verify the source, and cite it.</p>
    <p>The corpus spans product, pmm, gtm, ai-native operating, design, engineering, leadership, sales, growth, research, and founder craft. It is a structured record of what operators have published — books, podcasts, essays, talks, threads — distilled into atomic claims with mechanism, conditions, evidence, and counter-evidence.</p>
    <p>Every claim traces back to its primary source. Nothing is paraphrased without attribution. Nothing is invented. Where operators disagree, the disagreement is documented as a contradiction. Where multiple operators converge, the convergence is documented as a synthesis pattern.</p>
    <ul>
      <li>${STATS.cards} insight cards across ${STATS.domains} domains</li>
      <li>${STATS.operators} operator profiles</li>
      <li>${STATS.patterns} synthesis patterns (3+ operator convergences)</li>
      <li>${STATS.contradictions} documented contradictions</li>
      <li>${STATS.playbooks} methodology playbooks</li>
      <li>${STATS.tierA} Tier A claims</li>
    </ul>
    <p>Source on <a href='https://github.com/k3sava/ab-codex' target='_blank' rel='noopener'>GitHub</a>. Released MIT. Raw sources retain their original copyright; the codex archives short excerpts under fair use, always with attribution and a link to the canonical source.</p>
    <p>To consume the corpus from another project, read <a href='https://raw.githubusercontent.com/k3sava/ab-codex/main/insight-library/INDEX.json' target='_blank' rel='noopener'>INDEX.json</a> directly. Every record carries id, path, operator, source_url, source_date, domain, lifecycle, and tier — link to cards by id, fetch their markdown bodies at the listed paths.</p>
  </section>`;
}

/* ============ MAP — interactive force graph (drag, zoom, hover) ============ */
function graph(){
  // Mobile: render constellation (sectioned per-domain top operators) instead of force graph
  const isMobile = window.matchMedia('(max-width:768px)').matches;
  if (isMobile){ return constellation(); }
  app.innerHTML = `<section class='graph-page'>
    <div class='ghead'>
      <h1>knowledge map</h1>
      <p>${STATS.cards} insights · ${STATS.operators} operators · ${STATS.domains} domains. Drag, zoom, click.</p>
    </div>
    <div class='graphWrap'>
      <svg id='graph'></svg>
      <div class='graph-controls'>
        <button id='zoomIn' title='Zoom in'>+</button>
        <button id='zoomOut' title='Zoom out'>−</button>
        <button id='zoomReset' title='Reset'>⟲</button>
      </div>
      <div class='graph-info'>
        <div><strong>${STATS.cards}</strong> cards · <strong>${STATS.operators}</strong> profiles</div>
        <div class='legend'>
          <div><span class='sw' style='background:var(--accent)'></span>domains</div>
          <div><span class='sw' style='background:#5d738f'></span>operators</div>
          <div><span class='sw' style='background:#9c9082'></span>insights</div>
        </div>
        <div class='hint'>drag · scroll to zoom · click to open</div>
      </div>
      <div class='graph-tooltip' id='graphTip'></div>
    </div>
  </section>`;

  requestAnimationFrame(() => buildForceGraph());
}

function constellation(){
  // Sectioned per-domain view: top 6 operators per domain, sorted by card count in that domain
  const byDomain = new Map();
  for (const c of cards){
    for (const d of (c.domain || [])){
      if (!byDomain.has(d)) byDomain.set(d, new Map());
      const m = byDomain.get(d);
      m.set(c.operator, (m.get(c.operator) || 0) + 1);
    }
  }
  const domains = [...byDomain.entries()]
    .map(([d, opMap]) => ({
      domain: d,
      total: [...opMap.values()].reduce((a,b)=>a+b,0),
      ops: [...opMap.entries()].sort((a,b)=>b[1]-a[1])
    }))
    .sort((a,b) => b.total - a.total);
  app.innerHTML = `<section class='constellation-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>map</span></div>
    <h1>knowledge map</h1>
    <p class='lede'>${STATS.cards} insights · ${STATS.operators} operators · ${domains.length} domains.</p>
    <div class='constellation'>${domains.map(({domain, total, ops}) => `
      <section class='cnst-domain'>
        <header class='cnst-head'>
          <a class='cnst-name' href='#/d/${domain}'>${domain}</a>
          <span class='cnst-ct'>${total} card${total===1?'':'s'}</span>
        </header>
        <ol class='cnst-ops'>${ops.slice(0,7).map(([name, ct]) => `
          <li><a href='#/o/${slugify(name)}'><span class='cnst-op-name'>${escapeHtml(name)}</span><span class='cnst-op-ct'>${ct}</span></a></li>`).join('')}
        ${ops.length > 7 ? `<li class='cnst-more'><a href='#/d/${domain}'>+${ops.length - 7} more</a></li>` : ''}
        </ol>
      </section>`).join('')}</div>
  </section>`;
  if (!reduced) ScrollTrigger.batch('.cnst-domain', { onEnter: els => gsap.fromTo(els, { opacity:0, y:14 }, { opacity:1, y:0, duration:.5, ease:'power2.out', stagger:.04 }), start:'top 95%' });
}

function buildForceGraph(){
  const wrap = document.querySelector('.graphWrap');
  const svgEl = document.getElementById('graph');
  const tip = document.getElementById('graphTip');
  const W = wrap.clientWidth - 32;
  const H = svgEl.clientHeight;

  const nodes = [
    ...DOMAINS.map(d => ({ id:'d:'+d, label:d, type:'domain', radius:14, link:`#/d/${d}` })),
    ...[...new Set(cards.map(c=>c.operator))].map(o => ({ id:'o:'+o, label:o, type:'operator', radius:7, link:`#/o/${slugify(o)}` })),
    ...cards.map(c => ({ id:'i:'+c.id, label:c.claim, type:'insight', radius:3.5, card:c, link:`#/ins/${c.id}` })),
  ];
  const idx = new Map(nodes.map(n => [n.id, n]));
  const links = [];
  cards.forEach(c => {
    const i = idx.get('i:'+c.id);
    const o = idx.get('o:'+c.operator);
    if (i && o) links.push({ source:i, target:o, kind:'op' });
    c.domain.forEach(d => { const dn = idx.get('d:'+d); if (i && dn) links.push({ source:i, target:dn, kind:'dom' }); });
  });

  const svg = d3.select('#graph');
  svg.selectAll('*').remove();
  svg.attr('viewBox', `0 0 ${W} ${H}`);

  const themeAttr = document.documentElement.dataset.theme;
  const isDark = themeAttr === 'dark' || (!themeAttr && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const accent = isDark ? '#39ff14' : '#1f9d55';
  const edgeColor = isDark ? '#39ff1418' : '#0d141014';
  const edgeColorHi = isDark ? '#39ff14aa' : '#1f9d55aa';
  const opColor = isDark ? '#88a3c7' : '#5d738f';
  const insColor = isDark ? '#7d8a78' : '#9c9082';
  const labelColor = isDark ? '#d6e8d8' : '#0d1410';
  const labelMuted = isDark ? '#6c8773' : '#7a6e62';

  const g = svg.append('g');
  const linkG = g.append('g').attr('class','links');
  const nodeG = g.append('g').attr('class','nodes');

  const link = linkG.selectAll('line').data(links).enter().append('line')
    .attr('stroke', edgeColor).attr('stroke-width', 0.7);

  const node = nodeG.selectAll('g').data(nodes).enter().append('g')
    .style('cursor','pointer');

  node.append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => d.type==='domain' ? accent : d.type==='operator' ? opColor : insColor)
    .attr('opacity', d => d.type==='insight' ? 0.85 : 1)
    .attr('stroke', d => d.type==='domain' ? accent : 'transparent')
    .attr('stroke-width', d => d.type==='domain' ? 0 : 0)
    .attr('filter', d => d.type==='domain' && isDark ? 'url(#glow)' : null);

  // Glow filter for domain nodes in dark mode
  if (isDark){
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id','glow').attr('x','-50%').attr('y','-50%').attr('width','200%').attr('height','200%');
    filter.append('feGaussianBlur').attr('stdDeviation','3').attr('result','blur');
    const m = filter.append('feMerge'); m.append('feMergeNode').attr('in','blur'); m.append('feMergeNode').attr('in','SourceGraphic');
  }

  node.filter(d => d.type==='domain').append('text')
    .attr('dy', -20).attr('text-anchor','middle')
    .attr('font-family','JetBrains Mono, ui-monospace, monospace').attr('font-size', 11).attr('fill', labelColor)
    .text(d => d.label);

  // Top-15 operators get permanent labels (desktop)
  const opCounts = new Map();
  cards.forEach(c => opCounts.set(c.operator, (opCounts.get(c.operator)||0)+1));
  const topOps = new Set([...opCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,15).map(e=>e[0]));
  if (window.matchMedia('(min-width:769px)').matches){
    node.filter(d => d.type==='operator' && topOps.has(d.label)).append('text')
      .attr('dy', -11).attr('text-anchor','middle')
      .attr('font-family','JetBrains Mono, ui-monospace, monospace').attr('font-size', 10).attr('fill', labelMuted)
      .style('pointer-events','none')
      .text(d => d.label);
  }
  // Dim insight nodes whose operator has only 1 card
  node.filter(d => d.type==='insight' && (opCounts.get(d.card?.operator)||0) <= 1)
    .select('circle').attr('opacity', 0.35);

  // Operator labels appear on hover only via tooltip; insights via tooltip
  // Drag behavior
  const drag = d3.drag()
    .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
    .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
    .on('end', (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });

  node.call(drag);

  // Hover behavior
  node.on('mouseenter', function(event, d){
    const sel = d3.select(this).select('circle');
    sel.transition().duration(150).attr('r', d.radius * 1.7);
    link
      .attr('stroke', l => (l.source.id===d.id || l.target.id===d.id) ? edgeColorHi : edgeColor)
      .attr('stroke-width', l => (l.source.id===d.id || l.target.id===d.id) ? 1.4 : 0.4);
    if (d.type !== 'domain'){
      tip.textContent = d.type==='insight' ? `${d.label} — ${d.card.operator}` : d.label;
      const rect = svgEl.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      tip.style.left = (event.clientX - wrapRect.left + 14) + 'px';
      tip.style.top = (event.clientY - wrapRect.top + 14) + 'px';
      tip.style.opacity = '1';
    }
  });
  node.on('mousemove', (event) => {
    const wrapRect = wrap.getBoundingClientRect();
    tip.style.left = (event.clientX - wrapRect.left + 14) + 'px';
    tip.style.top = (event.clientY - wrapRect.top + 14) + 'px';
  });
  node.on('mouseleave', function(event, d){
    d3.select(this).select('circle').transition().duration(150).attr('r', d.radius);
    link.attr('stroke', edgeColor).attr('stroke-width', 0.7);
    tip.style.opacity = '0';
  });
  node.on('click', (_, d) => { location.hash = d.link; });

  // Force simulation
  const sim = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(d => d.target.type==='domain' ? 60 : 30).strength(0.15))
    .force('charge', d3.forceManyBody().strength(d => d.type==='domain' ? -260 : d.type==='operator' ? -90 : -18))
    .force('center', d3.forceCenter(W/2, H/2))
    .force('collide', d3.forceCollide().radius(d => d.radius + 2))
    .force('x', d3.forceX(W/2).strength(0.04))
    .force('y', d3.forceY(H/2).strength(0.04))
    .on('tick', () => {
      link.attr('x1', l => l.source.x).attr('y1', l => l.source.y).attr('x2', l => l.target.x).attr('y2', l => l.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

  // Zoom + pan
  const zoom = d3.zoom().scaleExtent([0.3, 5]).on('zoom', e => g.attr('transform', e.transform));
  svg.call(zoom);

  document.getElementById('zoomIn').onclick = () => svg.transition().duration(300).call(zoom.scaleBy, 1.4);
  document.getElementById('zoomOut').onclick = () => svg.transition().duration(300).call(zoom.scaleBy, 1/1.4);
  document.getElementById('zoomReset').onclick = () => svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);

  if (!reduced){
    gsap.from('.graph-info, .graph-controls', { opacity:0, y:8, duration:.5, delay:.3, ease:'power2.out' });
  }

  // Re-render on resize
  let rafId;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const newW = wrap.clientWidth - 32, newH = svgEl.clientHeight;
      svg.attr('viewBox', `0 0 ${newW} ${newH}`);
      sim.force('center', d3.forceCenter(newW/2, newH/2));
      sim.alpha(0.3).restart();
    });
  }, { once:true });
}

/* ============ ROUTER ============ */
function setActive(){
  const r = (location.hash || '#/').replace(/^#/,'');
  const top = '/'+ (r.split('/')[1] || '');
  document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route === top || (top==='/' && a.dataset.route === '/')));
}
async function today(){
  const ld = LATEST_DAILY;
  if (!ld){
    app.innerHTML = `<section class='insight-page'>
      <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>today</span></div>
      <h1>nothing has landed yet</h1>
      <p style='color:var(--muted);max-width:60ch'>The daily log is empty. New insights, operators, patterns, and playbooks will appear here as they're added to the corpus.</p>
    </section>`;
    return;
  }
  app.innerHTML = `<article class='insight-page today-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>today — ${ld.date}</span></div>
    <div id='todayBody' style='max-width:72ch'><p style='color:var(--muted);font-family:var(--mono);font-size:.8rem'>loading…</p></div>
    ${RECENT_DAILY.length > 1 ? `<aside class='today-recent' style='margin-top:48px;padding-top:24px;border-top:1px solid var(--line)'>
      <h2 style='font-size:.85rem;font-family:var(--mono);text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:14px'>earlier days</h2>
      <ul style='list-style:none;display:flex;flex-direction:column;gap:8px;font-family:var(--mono);font-size:.8rem'>
        ${RECENT_DAILY.slice(1, 11).map(d => `<li><a href='${REPO_BASE}/insight-library/${d.path}' target='_blank' rel='noopener'>${d.date} — ${escapeHtml(d.title || '')}</a></li>`).join('')}
      </ul>
    </aside>` : ''}
  </article>`;
  const body = document.getElementById('todayBody');
  const md = await fetchBody(ld.path);
  // strip frontmatter; rendered title comes from body H1
  body.innerHTML = mdToHtml(md);
}

function render(){
  window.scrollTo(0,0);
  ScrollTrigger.getAll().forEach(t=>t.kill());
  const raw = (location.hash || '#/').replace(/^#/,'');
  const hashIdx = raw.indexOf('#');
  const r = hashIdx === -1 ? raw : raw.slice(0, hashIdx);
  const anchor = hashIdx === -1 ? '' : raw.slice(hashIdx + 1);
  let view;
  if (r==='/'||r==='') view = home;
  else if (r==='/today') view = today;
  else if (r.startsWith('/ins/')) view = () => insight(decodeURIComponent(r.slice(5)));
  else if (r.startsWith('/o/')) view = () => operatorPage(decodeURIComponent(r.slice(3)));
  else if (r==='/operators') view = operatorsList;
  else if (r.startsWith('/d/')) view = () => domainPage(decodeURIComponent(r.slice(3)));
  else if (r==='/patterns') view = patternsList;
  else if (r==='/playbooks') view = playbooksList;
  else if (r.startsWith('/play/')) view = () => playbookPage(decodeURIComponent(r.slice(6)));
  else if (r.startsWith('/pat/')) view = () => patternPage(decodeURIComponent(r.slice(5)));
  else if (r.startsWith('/con/')) view = () => contradictionPage(decodeURIComponent(r.slice(5)));
  else if (r==='/map' || r==='/graph') view = graph;
  else if (r==='/flash') view = flash;
  else if (r==='/browse' || r==='/carousel') view = browse;
  else if (r==='/timeline') view = timeline;
  else if (r==='/about') view = about;
  else view = about;
  if (!reduced) gsap.fromTo(app, { opacity:0 }, { opacity:1, duration:.3, ease:'power2.out', clearProps:'transform,translate,rotate,scale' });
  view();
  // Allow render then refresh ScrollTrigger so currently-visible reveals fire
  setTimeout(() => {
    ScrollTrigger.refresh();
    if (anchor){
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 80);
}

/* ============ SEARCH ============ */
function wireSearch(){
  const dlg = document.getElementById('searchDialog');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const RECENTS_KEY = 'codex-search-recents';
  const loadRecents = () => { try { return JSON.parse(localStorage.getItem(RECENTS_KEY)||'[]'); } catch(e){ return []; } };
  const pushRecent = (item) => { const cur = loadRecents().filter(r=>r.href!==item.href); cur.unshift(item); try { localStorage.setItem(RECENTS_KEY, JSON.stringify(cur.slice(0,8))); } catch(e){} };

  // Fuzzy scoring: exact phrase > prefix > all-tokens-present > subsequence
  const score = (text, q, tokens) => {
    if (!text) return 0;
    const t = text.toLowerCase();
    if (t === q) return 1000;
    if (t.startsWith(q)) return 600;
    if (t.includes(q)) return 400 - t.indexOf(q);
    let s = 0;
    for (const tk of tokens){ if (t.includes(tk)) s += 60; else return 0; }
    return s;
  };

  let activeIdx = 0;
  let flatItems = [];

  const renderEmpty = () => {
    const recents = loadRecents();
    if (!recents.length){
      results.innerHTML = `<div class='search-empty'>Type to search ${cards.length} insights, ${operators.length} operators, ${patterns.length} patterns.</div>`;
      flatItems = []; return;
    }
    results.innerHTML = `<div class='search-group'><div class='search-group-h'>Recent</div>${recents.map((r,i)=>`<a class='search-item${i===0?' active':''}' href='${r.href}' data-href='${r.href}'><span class='kind'>${r.kind}</span><b>${escapeHtml(r.title)}</b><span class='mono'>${escapeHtml(r.sub||'')}</span></a>`).join('')}</div>`;
    flatItems = [...results.querySelectorAll('.search-item')]; activeIdx = 0;
  };

  const renderResults = (q) => {
    const tokens = q.split(/\s+/).filter(Boolean);
    const cardHits = cards.map(c => ({ c, s: score(c.claim, q, tokens) + score(c.operator, q, tokens)*0.6 + score((c.domain||[]).join(' '), q, tokens)*0.3 })).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,12);
    const opHits = operators.map(o => ({ o, s: score(o.name, q, tokens) + score((o.roles||[]).join(' '), q, tokens)*0.4 })).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,6);
    const patHits = patterns.map(p => ({ p, s: score(p.title||'', q, tokens) })).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,5);

    const groups = [];
    if (opHits.length) groups.push(`<div class='search-group'><div class='search-group-h'>Operators</div>${opHits.map(({o})=>`<a class='search-item' href='#/o/${o.slug}' data-href='#/o/${o.slug}' data-kind='operator' data-title='${escapeHtml(o.name)}'><span class='kind'>op</span><b>${escapeHtml(o.name)}</b><span class='mono'>${escapeHtml((o.roles||[])[0]||'')}</span></a>`).join('')}</div>`);
    if (patHits.length) groups.push(`<div class='search-group'><div class='search-group-h'>Patterns</div>${patHits.map(({p})=>`<a class='search-item' href='#/pat/${p.id}' data-href='#/pat/${p.id}' data-kind='pattern' data-title='${escapeHtml(p.title)}'><span class='kind'>pat</span><b>${escapeHtml(p.title)}</b><span class='mono'>tier ${p.tier||'—'}</span></a>`).join('')}</div>`);
    if (cardHits.length) groups.push(`<div class='search-group'><div class='search-group-h'>Insights</div>${cardHits.map(({c})=>`<a class='search-item' href='#/ins/${c.id}' data-href='#/ins/${c.id}' data-kind='insight' data-title='${escapeHtml(c.claim)}' data-sub='${escapeHtml(c.operator)}'><span class='kind'>ins</span><b>${escapeHtml(c.claim)}</b><span class='mono'>${escapeHtml(c.operator)}</span></a>`).join('')}</div>`);
    results.innerHTML = groups.length ? groups.join('') : `<div class='search-empty'>No matches for "${escapeHtml(q)}"</div>`;
    flatItems = [...results.querySelectorAll('.search-item')];
    activeIdx = 0;
    setActiveItem();
  };

  const setActiveItem = () => {
    flatItems.forEach((el,i)=>el.classList.toggle('active', i===activeIdx));
    if (flatItems[activeIdx]) flatItems[activeIdx].scrollIntoView({ block:'nearest' });
  };

  const openItem = (el, newTab) => {
    if (!el) return;
    const href = el.dataset.href || el.getAttribute('href');
    pushRecent({ href, kind: el.dataset.kind || 'recent', title: el.dataset.title || el.querySelector('b')?.textContent || href, sub: el.dataset.sub || el.querySelector('.mono')?.textContent || '' });
    dlg.close();
    if (newTab){ window.open(location.origin + location.pathname + href, '_blank'); }
    else { location.hash = href.startsWith('#') ? href.slice(1) : href; }
  };

  document.getElementById('searchOpen').onclick = ()=>{ dlg.showModal(); input.value=''; renderEmpty(); input.focus(); };
  // Click outside (on backdrop) closes — mouse and touch parity with esc
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('touchend', e => { if (e.target === dlg) dlg.close(); }, { passive:true });
  document.addEventListener('keydown', e => {
    if ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); if (!dlg.open){ dlg.showModal(); input.value=''; renderEmpty(); } input.focus(); }
    if (e.key==='Escape' && dlg.open) dlg.close();
  });

  input.oninput = e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q){ renderEmpty(); return; }
    renderResults(q);
  };

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ e.preventDefault(); if (flatItems.length){ activeIdx = (activeIdx+1) % flatItems.length; setActiveItem(); } }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); if (flatItems.length){ activeIdx = (activeIdx-1+flatItems.length) % flatItems.length; setActiveItem(); } }
    else if (e.key === 'Enter'){ e.preventDefault(); openItem(flatItems[activeIdx], e.metaKey||e.ctrlKey); }
  });

  results.addEventListener('click', e => {
    const a = e.target.closest('.search-item');
    if (!a) return;
    e.preventDefault();
    openItem(a, e.metaKey||e.ctrlKey);
  });
  results.addEventListener('mousemove', e => {
    const a = e.target.closest('.search-item');
    if (!a) return;
    const i = flatItems.indexOf(a);
    if (i >= 0 && i !== activeIdx){ activeIdx = i; setActiveItem(); }
  });
}

/* ============ HEADER + SCROLL ============ */
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
  tl.to('#splash .pulse', { scale:1.4, opacity:.4, duration:.4, ease:'power2.out' }, '<');
  tl.to('#splash', { xPercent:-100, duration:.7, ease:'power3.inOut' }, '+=.1');
}

/* ============ THEME TOGGLE ============ */
function wireTheme(){
  const btn = document.getElementById('themeBtn');
  if (!btn) return;
  const apply = (t) => {
    if (t) document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
    try { if (t) localStorage.setItem('codex-theme', t); else localStorage.removeItem('codex-theme'); } catch(e){}
    // Update theme-color meta
    const meta = document.querySelector('meta[name="theme-color"]:not([media])') || document.createElement('meta');
    meta.setAttribute('name','theme-color');
    const dark = (t==='dark') || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    meta.setAttribute('content', dark ? '#0a0e0a' : '#f3f5ee');
    if (!meta.parentNode) document.head.appendChild(meta);
  };
  btn.onclick = () => {
    const cur = document.documentElement.dataset.theme;
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = cur === 'dark' ? 'light' : cur === 'light' ? (sysDark ? 'dark' : null) : (sysDark ? 'light' : 'dark');
    apply(next);
    // If on map page, redraw graph to pick up new colors
    if ((location.hash || '#/').includes('/map') || (location.hash || '#/').includes('/graph')){
      requestAnimationFrame(() => buildForceGraph());
    }
  };
}

window.addEventListener('hashchange', () => { render(); setActive(); window.scrollTo({top:0, behavior:'instant'}); });
loadIndex().then(() => { renderHelloBar(); render(); setActive(); wireSearch(); wireHeader(); wireMobileMenu(); wireTheme(); dismissSplash(); }).catch(e => {
  document.getElementById('splash')?.remove();
  app.innerHTML = `<section class='about-page'><h1>codex couldn't load.</h1><p style='color:var(--muted)'>${escapeHtml(e.message)}</p></section>`;
});
