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
    co_operators: Array.isArray(i.co_operators) ? i.co_operators : (i.co_operators ? [i.co_operators] : []),
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

// Walk rendered HTML and map relative .md paths to SPA routes so clicks stay in-app
// instead of fetching the raw markdown file (or 404'ing on GH Pages).
// Also: if the rendered link text looks slug-like (matches the id, slug, or
// filename), replace it with the resource's actual title/claim/name so readers
// see "A trace tells you nothing…" instead of "ins_traces-need-feedback-to-learn".
function rewriteRelativeLinks(root){
  if (!root) return;
  // Heuristic: link text is auto-generated (replace) vs human-written (keep).
  // Auto-generated = matches the resource id, slug, or filename basename.
  const looksLikeSlug = (text, ...candidates) => {
    const t = (text || '').trim().toLowerCase();
    if (!t) return true;
    return candidates.some(c => c && t === c.toLowerCase());
  };
  root.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || /^https?:/i.test(href) || href.startsWith('mailto:')) return;
    const norm = href.replace(/^\.\//, '').replace(/^insight-library\//, '').toLowerCase();
    const filenameBase = (norm.split('/').pop() || '').replace(/\.md$/, '');
    const setRoute = (route, prettyTitle, ...slugCandidates) => {
      a.setAttribute('href', route);
      a.removeAttribute('target');
      a.removeAttribute('rel');
      if (prettyTitle && looksLikeSlug(a.textContent, ...slugCandidates, filenameBase)){
        a.textContent = prettyTitle;
      }
    };
    const ins = cards.find(c => (c.path || '').toLowerCase() === norm);
    if (ins){ setRoute(`#/ins/${ins.id}`, ins.claim, ins.id); return; }
    const op = operators.find(o => (o.path || '').toLowerCase() === norm);
    if (op){ setRoute(`#/o/${op.slug}`, op.name, op.slug); return; }
    const pat = patterns.find(p => (p.path || '').toLowerCase() === norm);
    if (pat && pat.id){ setRoute(`#/pat/${pat.id}`, pat.title, pat.id); return; }
    const con = contradictions.find(c => (c.path || '').toLowerCase() === norm);
    if (con && con.id){ setRoute(`#/con/${con.id}`, con.title, con.id); return; }
    const pb = playbooks.find(p => (p.path || '').toLowerCase() === norm);
    if (pb && pb.id){ setRoute(`#/play/${pb.id}`, pb.title, pb.id); return; }
  });

  // Cross-references in cards are typically rendered as inline <code>ins_X</code>
  // (backticks in source). Convert known ids into clickable links so cross-references
  // resolve in-app instead of staying as decorative code.
  root.querySelectorAll('code').forEach(code => {
    const t = (code.textContent || '').trim();
    if (!t) return;
    const lower = t.toLowerCase();
    let route = null, title = null;
    if (lower.startsWith('ins_')){
      const ins = cards.find(c => c.id && c.id.toLowerCase() === lower);
      if (ins){ route = `#/ins/${ins.id}`; title = ins.claim; }
    } else if (lower.startsWith('pat_')){
      const p = patterns.find(p => p.id && p.id.toLowerCase() === lower);
      if (p){ route = `#/pat/${p.id}`; title = p.title; }
    } else if (lower.startsWith('con_')){
      const c = contradictions.find(c => c.id && c.id.toLowerCase() === lower);
      if (c){ route = `#/con/${c.id}`; title = c.title; }
    }
    if (route && title){
      const a = document.createElement('a');
      a.className = 'inline-cross-ref';
      a.setAttribute('href', route);
      a.textContent = title;
      code.replaceWith(a);
    }
  });
}
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
      <p class='lede'>Every card here is one idea from one person who actually shipped something. We tell you who said it, where they said it, and when. Then we explain <em>why</em> the idea works, <em>when</em> it applies, and <em>when it doesn't</em> — so you can use it, not just read it.</p>
      <div class='stats'>
        <a class='stat' href='#/browse'><span class='num' data-count='${STATS.cards}'>0</span><span class='lbl'>insight cards</span></a>
        <a class='stat' href='#/operators'><span class='num' data-count='${STATS.operators}'>0</span><span class='lbl'>operators</span></a>
        <a class='stat' href='#/patterns'><span class='num' data-count='${STATS.patterns}'>0</span><span class='lbl'>patterns</span></a>
        <a class='stat' href='#/patterns#contradictions'><span class='num' data-count='${STATS.contradictions}'>0</span><span class='lbl'>contradictions</span></a>
        <a class='stat' href='#/playbooks'><span class='num' data-count='${STATS.playbooks}'>0</span><span class='lbl'>playbooks</span></a>
      </div>
      <a id='helloBar' class='hello-bar' href='#/today' hidden aria-label='What landed today'>
        <div class='hello-marquee' id='helloMarquee' aria-hidden='false'></div>
      </a>
      <div class='scroll-cue' id='scrollCue' aria-hidden='true'>
        <svg class='scroll-icon' viewBox='0 0 24 36' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'>
          <rect x='3' y='1' width='18' height='28' rx='9'/>
          <line class='scroll-icon-dot' x1='12' y1='8' x2='12' y2='13'/>
          <polyline class='scroll-icon-chev' points='8 31 12 35 16 31'/>
        </svg>
      </div>
    </section>

    <section class='section' id='tier-a-section'>
      <div class='section-head'>
        <div>
          <h2>Tier A — the strongest claims</h2>
          <p>The cards we trust most: clean attribution, real evidence, the kind of idea that holds up when you actually try it.</p>
        </div>
        <div class='meta'>${STATS.tierA} cards · view all in <a href='#/browse'>browse</a></div>
      </div>
      <div class='card-grid'>${tierA.slice(0,12).map(cardTile).join('')}</div>
    </section>

    <section class='section'>
      <div class='section-head'>
        <div>
          <h2>Where operators converge</h2>
          <p>When three or more people arrive at the same idea independently, from different angles, it's probably not just a hot take. These are the convergences.</p>
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
          <h2>${STATS.contradictions} places where operators disagree</h2>
          <p>Smart people reach opposite conclusions on the same question all the time. We document the disagreements so you can see both sides — and the conditions that decide which one applies to you.</p>
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
          <h2>Browse by domain</h2>
          <p>Narrow to the surface you're working on right now.</p>
        </div>
        <div class='meta'>${STATS.domains} domains</div>
      </div>
      <div class='chips reveal'>${DOMAINS.map(d=>{
        const ct = cards.filter(c=>c.domain.includes(d)).length;
        return `<a class='chip' href='#/d/${d}'>${d}<span class='ct'>${ct}</span></a>`;
      }).join('')}</div>
    </section>
  `;
  // Hello bar lives inside the hero now; populate it after innerHTML is set
  renderHelloBar();
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
  if (!c){
    app.innerHTML = `<div class='insight-page empty-state'>
      <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/operators'>operators</a> <span>·</span> <span>card</span></div>
      <h1>This card isn't in the codex.</h1>
      <p class='lede'>It may have been renamed, archived, or you typed an id that doesn't exist. Search for the claim, or browse a fresh index.</p>
      <div class='actions empty-actions'><a class='btn' href='#/'>Open the codex</a><a class='btn ghost' href='#/operators'>Browse operators</a><a class='btn ghost' href='#/today'>See what landed today</a></div>
    </div>`;
    return;
  }
  // Compute sibling navigation once so both prev/next + the rail panel agree.
  const siblings = cards.filter(x => x.operator_slug === c.operator_slug);
  const sibIdx = siblings.findIndex(x => x.id === c.id);
  const sibPrev = sibIdx > 0 ? siblings[sibIdx - 1] : null;
  const sibNext = sibIdx >= 0 && sibIdx < siblings.length - 1 ? siblings[sibIdx + 1] : null;
  const relatedItems = (c.related || [])
    .map(r => ({ id: r, card: cards.find(x => x.id === r) }))
    .filter(x => x.card);
  app.innerHTML = `<article class='insight-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/operators'>operators</a> <span>·</span> <a href='#/o/${c.operator_slug}'>${escapeHtml(c.operator)}</a> <span>·</span> <span>${c.id}</span></div>
    <div class='layout'>
      <div>
        <div class='meta-row' style='margin-bottom:14px;font-family:var(--mono);font-size:.7rem;color:var(--muted);display:flex;gap:10px;align-items:center;flex-wrap:wrap'>${tierBadge(c.tier)}<span>${c.domain.join(' · ')}</span>${c.source_date ? `<span>·</span><span>${c.source_date}</span>` : ''}</div>
        <h1>${escapeHtml(c.claim)}</h1>
        <p class='byline'>${escapeHtml(c.operator)}${(c.co_operators||[]).length ? ` <span class='co-byline'>with ${c.co_operators.map(co => `<a href='#/o/${slugify(co)}'>${escapeHtml(co)}</a>`).join(', ')}</span>` : ''}${c.operator_role?`<span class='role'>${escapeHtml(c.operator_role)}</span>`:''}</p>
        <p class='source'>${c.source_url?`<a href='${c.source_url}' target='_blank' rel='noopener'>${escapeHtml(c.source_title||c.source_url)}</a>`:''} ${c.source_date?`<span>·</span><span>${c.source_date}</span>`:''} ${c.source_type?`<span>·</span><span>${c.source_type}</span>`:''}</p>
        <div class='body' id='cardBody'><p class='loading-line'>reading the card…</p></div>
      </div>
      <aside class='ins-rail'>
        <section class='rail-panel'>
          <h4>operator${(c.co_operators||[]).length ? 's' : ''}</h4>
          <p class='rail-op'><a href='#/o/${c.operator_slug}'>${escapeHtml(c.operator)}</a></p>
          ${(c.co_operators||[]).map(co => `<p class='rail-op'><a href='#/o/${slugify(co)}'>${escapeHtml(co)}</a> <span class='rail-meta'>co-author</span></p>`).join('')}
          ${c.operator_role?`<p class='rail-meta-line'>${escapeHtml(c.operator_role)}</p>`:''}
        </section>
        <section class='rail-panel'>
          <h4>actions</h4>
          <div class='rail-actions'>
            <button class='rail-btn' id='citeBtn' aria-label='Copy citation'>
              <svg viewBox='0 0 16 16' aria-hidden='true' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M5 5h6v8H5z'/><path d='M3 3h6v2'/></svg>
              <span>copy citation</span>
            </button>
            <button class='rail-btn' id='copyMdBtn' aria-label='Copy as markdown' title='Copy this card as markdown to paste into your agent'>
              <svg viewBox='0 0 16 16' aria-hidden='true' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='3' width='12' height='10' rx='1.5'/><path d='M5 9V7l1.5 1.5L8 7v2'/><path d='M11 7v3M9.5 8.5L11 10l1.5-1.5'/></svg>
              <span>copy as markdown</span>
            </button>
            <button class='rail-btn' id='shareBtn' aria-label='Share this card' title='Share — uses native share sheet on mobile, copies link otherwise'>
              <svg viewBox='0 0 16 16' aria-hidden='true' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='4' r='1.8'/><circle cx='4' cy='8' r='1.8'/><circle cx='12' cy='12' r='1.8'/><path d='M5.6 7.2l4.8-2.4M5.6 8.8l4.8 2.4'/></svg>
              <span>share</span>
            </button>
            <button class='rail-btn' id='listenBtn' aria-label='Read this card aloud' aria-pressed='false'>
              <svg viewBox='0 0 16 16' aria-hidden='true' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M3 6v4h2l3 2.5v-9L5 6H3z'/><path d='M11 5.5c1 .8 1 4.2 0 5'/><path d='M12.5 4c1.8 1.4 1.8 6.6 0 8'/></svg>
              <span class='listen-label'>listen</span>
            </button>
            <a class='rail-btn' href='${REPO_BASE}/insight-library/${c.path}' target='_blank' rel='noopener' aria-label='View raw source on GitHub'>
              <svg viewBox='0 0 16 16' aria-hidden='true' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M11 3h2v2'/><path d='M13 3l-5 5'/><path d='M12 9v3a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3'/></svg>
              <span>view raw source</span>
            </a>
            ${c.source_url ? `<a class='rail-btn' href='${escapeHtml(c.source_url)}' target='_blank' rel='noopener external' aria-label='Open the original primary source'>
              <svg viewBox='0 0 16 16' aria-hidden='true' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='8' cy='8' r='6'/><path d='M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11'/></svg>
              <span>original source</span>
            </a>` : ''}
          </div>
        </section>
        ${c.lifecycle && c.lifecycle.length ? `<section class='rail-panel'>
          <h4>lifecycle</h4>
          <p class='rail-tags'>${c.lifecycle.join(' · ')}</p>
        </section>` : ''}
        ${relatedItems.length ? `<section class='rail-panel'>
          <h4>related</h4>
          <ul class='rail-related'>${relatedItems.map(({card: r}) => `<li><a href='#/ins/${r.id}'>${escapeHtml(r.claim)}</a></li>`).join('')}</ul>
        </section>` : ''}
        ${(sibPrev || sibNext) ? `<section class='rail-panel rail-sib'>
          <h4>more from ${escapeHtml(c.operator)}</h4>
          ${sibPrev ? `<a class='rail-sib-link' href='#/ins/${sibPrev.id}'>
            <span class='rail-sib-dir'>← previous</span>
            <span class='rail-sib-title'>${escapeHtml(sibPrev.claim)}</span>
          </a>` : ''}
          ${sibNext ? `<a class='rail-sib-link' href='#/ins/${sibNext.id}'>
            <span class='rail-sib-dir'>next →</span>
            <span class='rail-sib-title'>${escapeHtml(sibNext.claim)}</span>
          </a>` : ''}
          <a class='rail-sib-all' href='#/o/${c.operator_slug}'>see all ${siblings.length} cards →</a>
        </section>` : ''}
      </aside>
    </div>
  </article>`;
  const md = await fetchBody(c.path);
  const cardBodyEl = document.getElementById('cardBody');
  cardBodyEl.innerHTML = mdToHtml(md);
  rewriteRelativeLinks(cardBodyEl);
  // Helper that flashes a label on a button for confirmation feedback.
  const flashLabel = (id, msg, ms = 1400) => {
    const b = document.getElementById(id); if (!b) return;
    const labelEl = b.querySelector('span') || b;
    const original = labelEl.textContent;
    labelEl.textContent = msg;
    setTimeout(() => { labelEl.textContent = original; }, ms);
  };

  document.getElementById('citeBtn').onclick = async () => {
    const text = `${c.operator}${(c.co_operators||[]).length ? ' with ' + c.co_operators.join(', ') : ''}, "${c.source_title || c.claim}," ${c.source_url || ''}, ${c.source_date || 'n.d.'}. https://codex.iamkesava.com/ins/${c.id}/`;
    try { await navigator.clipboard.writeText(text); flashLabel('citeBtn', 'copied'); } catch { flashLabel('citeBtn', 'copy failed'); }
  };
  // Osmani's UX bridge layer — give a human-with-an-agent a clean way to grab the
  // card's full markdown for their model.
  document.getElementById('copyMdBtn').onclick = async () => {
    flashLabel('copyMdBtn', 'copying…', 600);
    try {
      const raw = await fetch(`insight-library/${c.path}`).then(r => r.text());
      await navigator.clipboard.writeText(raw);
      setTimeout(() => flashLabel('copyMdBtn', 'copied'), 600);
    } catch {
      setTimeout(() => flashLabel('copyMdBtn', 'copy failed'), 600);
    }
  };
  // Share — native Web Share where available, copy link fallback elsewhere.
  document.getElementById('shareBtn').onclick = async () => {
    const url = `https://codex.iamkesava.com/ins/${c.id}/`;
    const shareData = { title: c.claim, text: `${c.operator}: "${c.claim}"`, url };
    try {
      if (navigator.share && navigator.canShare?.(shareData)){
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        flashLabel('shareBtn', 'link copied');
      }
    } catch (err){
      if (err?.name !== 'AbortError') flashLabel('shareBtn', 'share failed');
    }
  };
  // Read aloud — Web Speech API. Reads claim + body sections in order.
  // Toggles play/stop. Falls back gracefully if the browser doesn't support TTS.
  let utter = null;
  const listenBtn = document.getElementById('listenBtn');
  const listenLabel = listenBtn.querySelector('.listen-label');
  const stopListen = () => {
    if (window.speechSynthesis){ window.speechSynthesis.cancel(); }
    if (listenBtn){ listenBtn.setAttribute('aria-pressed','false'); listenLabel.textContent = 'listen'; }
    utter = null;
  };
  listenBtn.onclick = () => {
    if (!('speechSynthesis' in window)){
      flashLabel('listenBtn', 'not supported');
      return;
    }
    if (utter && window.speechSynthesis.speaking){
      stopListen();
      return;
    }
    // Build readable text: claim, byline-ish framing, then body sections sans markdown noise.
    const bodyText = (cardBodyEl.innerText || '').replace(/[—–]/g, ' — ');
    const text = `${c.claim}. By ${c.operator}${(c.co_operators||[]).length ? ' with ' + c.co_operators.join(' and ') : ''}. ${bodyText}`;
    utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.onend = stopListen;
    utter.onerror = stopListen;
    listenBtn.setAttribute('aria-pressed','true');
    listenLabel.textContent = 'stop';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };
  // Stop TTS on route change so it doesn't bleed into another page.
  window.addEventListener('hashchange', stopListen, { once: true });
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
  // Cards where this operator is the primary author OR a co-author
  const opCards = cards.filter(c => c.operator_slug === slug || (c.co_operators||[]).some(co => slugify(co) === slug));
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
        <div class='body' id='opBio'><p class='loading-line'>reading the profile…</p></div>
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
          </a>`).join('') || `<p class='empty-inline'>No cards attributed to this operator yet. The profile is here, the cards will follow.</p>`}</div>
      </aside>
    </div>
  </article>`;
  if (op.path){
    const md = await fetchBody(op.path);
    const cleaned = stripMdSections(md, ['cards','sources captured','sources']);
    const opBioEl = document.getElementById('opBio');
    opBioEl.innerHTML = mdToHtml(cleaned);
    rewriteRelativeLinks(opBioEl);
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
      ${filtered.length === 0 ? `<div class='ops-empty'>No operators match these filters. Loosen the domain or minimum-card filter to see more.</div>` : ''}
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
  if (!p){
    app.innerHTML = `<div class='insight-page empty-state'>
      <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/playbooks'>playbooks</a> <span>·</span> <span>playbook</span></div>
      <h1>This playbook isn't in the codex.</h1>
      <p class='lede'>27 methodology playbooks distilled across the corpus — pick from the list and start there.</p>
      <div class='actions empty-actions'><a class='btn' href='#/playbooks'>Browse playbooks</a><a class='btn ghost' href='#/'>Open the codex</a></div>
    </div>`;
    return;
  }
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
    if (target){
      target.innerHTML = renderMarkdown(body);
      rewriteRelativeLinks(target);
      // Render any ```mermaid``` blocks that the markdown converted to .mermaid divs.
      // Mermaid is loaded lazily and only when a diagram is actually present.
      if (target.querySelector('.mermaid')){
        try {
          const mermaid = (await import('https://cdn.jsdelivr.net/npm/mermaid@10.9.1/+esm')).default;
          // Theme tuned to the codex palette: paper background, ink text, accent edges.
          const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              primaryColor: isDark ? '#0d1410' : '#e6ebe0',
              primaryBorderColor: isDark ? '#3aaf6d' : '#15803d',
              primaryTextColor: isDark ? '#e6ecdf' : '#0d1410',
              lineColor: isDark ? '#7a8174' : '#6b7868',
              secondaryColor: isDark ? '#0a0e0a' : '#f3f5ee',
              tertiaryColor: isDark ? '#0a0e0a' : '#f3f5ee',
              edgeLabelBackground: isDark ? '#0a0e0a' : '#f3f5ee',
            },
            securityLevel: 'loose',
          });
          await mermaid.run({ nodes: target.querySelectorAll('.mermaid') });
        } catch (e) {
          // Mermaid load failed — leave the placeholder text visible.
          console.warn('mermaid load failed:', e);
        }
      }
    }
  } catch (e){
    const target = document.querySelector('.playbook-content');
    if (target) target.innerHTML = `<p style='color:var(--muted)'>Could not load playbook body. <a href='https://github.com/k3sava/ab-codex/blob/main/insight-library/${p.path}' target='_blank' rel='noopener'>Read on GitHub</a>.</p>`;
  }

  if (!reduced) ScrollTrigger.batch('.card.reveal', { onEnter: els => gsap.fromTo(els, { opacity:0, y:18 }, { opacity:1, y:0, duration:.6, ease:'power3.out', stagger:.03 }), start:'top 92%' });
}

// Minimal markdown renderer for playbook bodies — headings, lists, paragraphs,
// links, code, bold. Plus: ```mermaid blocks become live diagrams and
// blockquotes that contain a single emphatic line render as pull-quotes.
function renderMarkdown(md){
  const lines = md.split('\n');
  const out = [];
  let inList = false;
  let inCode = false;
  let codeLang = '';
  let codeBuf = [];
  let inQuote = false;
  let quoteBuf = [];
  let para = [];
  const flushPara = () => { if (para.length){ out.push(`<p>${inlineMd(para.join(' '))}</p>`); para = []; } };
  const closeList = () => { if (inList){ out.push(inList === 'ol' ? '</ol>' : '</ul>'); inList = false; } };
  const closeQuote = () => {
    if (!inQuote) return;
    const text = quoteBuf.join(' ').trim();
    // A blockquote with a single short, declarative line gets the pull-quote treatment.
    const isPullQuote = text.length < 240 && !/\n/.test(text);
    if (isPullQuote){
      out.push(`<blockquote class='pull-quote'><p>${inlineMd(text)}</p></blockquote>`);
    } else {
      out.push(`<blockquote>${quoteBuf.map(l => `<p>${inlineMd(l)}</p>`).join('')}</blockquote>`);
    }
    inQuote = false; quoteBuf = [];
  };
  for (const ln of lines){
    if (ln.startsWith('```')){
      flushPara(); closeList(); closeQuote();
      if (!inCode){
        codeLang = ln.replace(/^```/, '').trim().toLowerCase();
        codeBuf = [];
        inCode = true;
      }
      else {
        // Mermaid → live diagram placeholder. mermaid.run() picks these up.
        if (codeLang === 'mermaid'){
          out.push(`<div class='mermaid'>${escapeHtml(codeBuf.join('\n'))}</div>`);
        } else {
          out.push(`<pre><code${codeLang ? ` class="language-${escapeHtml(codeLang)}"` : ''}>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
        }
        codeBuf = []; codeLang = ''; inCode = false;
      }
      continue;
    }
    if (inCode){ codeBuf.push(ln); continue; }
    if (/^>\s?/.test(ln)){
      flushPara(); closeList();
      if (!inQuote) inQuote = true;
      quoteBuf.push(ln.replace(/^>\s?/, ''));
      continue;
    }
    if (inQuote && ln.trim() !== '' && !/^>\s?/.test(ln)){
      // soft continuation
      quoteBuf[quoteBuf.length - 1] += ' ' + ln.trim();
      continue;
    }
    if (inQuote && ln.trim() === ''){ closeQuote(); continue; }
    if (/^#{1,6}\s/.test(ln)){
      flushPara(); closeList();
      const m = ln.match(/^(#{1,6})\s+(.*)$/);
      const lv = Math.min(m[1].length + 1, 6);
      out.push(`<h${lv}>${inlineMd(m[2])}</h${lv}>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(ln)){
      flushPara(); closeQuote();
      if (inList === 'ol'){ out.push('</ol>'); inList = false; }
      if (!inList){ out.push('<ul>'); inList = true; }
      out.push(`<li>${inlineMd(ln.replace(/^\s*[-*]\s+/, ''))}</li>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(ln)){
      flushPara(); closeQuote();
      if (inList === true){ out.push('</ul>'); inList = false; }
      if (!inList){ out.push('<ol class="step-list">'); inList = 'ol'; }
      out.push(`<li>${inlineMd(ln.replace(/^\s*\d+\.\s+/, ''))}</li>`);
      continue;
    }
    if (ln.trim() === ''){
      flushPara(); closeList(); closeQuote();
      continue;
    }
    para.push(ln);
  }
  flushPara(); closeList(); closeQuote();
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
  if (!p){
    app.innerHTML = `<div class='insight-page empty-state'>
      <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/patterns'>patterns</a> <span>·</span> <span>pattern</span></div>
      <h1>This pattern isn't in the codex.</h1>
      <p class='lede'>The patterns page lists every cross-operator convergence. Start there.</p>
      <div class='actions empty-actions'><a class='btn' href='#/patterns'>Browse patterns</a><a class='btn ghost' href='#/'>Open the codex</a></div>
    </div>`;
    return;
  }
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
        <p class='loading-line'>reading the playbook…</p>
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
  const patBodyEl = document.getElementById('patBody');
  patBodyEl.innerHTML = mdToHtml(cleaned);
  rewriteRelativeLinks(patBodyEl);
  if (!reduced){
    gsap.from('.pat-head > *', { opacity:0, y:14, duration:.6, ease:'power2.out', stagger:.06 });
    gsap.from('.pat-radial-line', { opacity:0, drawSVG:0, duration:.8, stagger:.04, ease:'power2.out', delay:.3 });
    gsap.from('.pat-radial-op', { opacity:0, scale:.6, duration:.5, stagger:.04, ease:'back.out(1.5)', delay:.4, transformOrigin:'center' });
    gsap.from('.pat-radial-core', { opacity:0, scale:.4, duration:.6, ease:'back.out(1.7)', delay:.2, transformOrigin:'center' });
  }
}

async function contradictionPage(id){
  const c = contradictions.find(x=>x.id===id);
  if (!c){
    app.innerHTML = `<div class='insight-page empty-state'>
      <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/patterns'>patterns</a> <span>·</span> <span>contradiction</span></div>
      <h1>This contradiction isn't in the codex.</h1>
      <p class='lede'>Contradictions document where two operators reach opposing conclusions on the same question. The patterns page lists them all.</p>
      <div class='actions empty-actions'><a class='btn' href='#/patterns#contradictions'>See contradictions</a><a class='btn ghost' href='#/'>Open the codex</a></div>
    </div>`;
    return;
  }
  // Skeleton
  app.innerHTML = `<article class='contradiction-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <a href='#/patterns'>patterns</a> <span>·</span> <span>contradiction</span></div>
    <div class='con-stage' id='conStage'><p class='loading-line' style='text-align:center;padding:80px 0'>reading the contradiction…</p></div>
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
  if (list.length === 0){ out.innerHTML = `<div class='browse-empty'>No cards match these filters. Try widening tier or domain.</div>`; return; }

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
  // Bars: flex-sized by sqrt(card count) so sparse months don't collapse to hairlines.
  // Linear scaling makes a month with 1 card almost invisible next to a month with 100;
  // sqrt compresses the ratio so sparse months stay visible and clickable while dense
  // months still read as denser. CSS min-width gives a final safety floor.
  const flexFor = ct => Math.sqrt(ct); // monotonic, sub-linear
  const barEls = monthKeysAsc.map(ym => {
    const ct = months.get(ym).length;
    const heightPct = Math.max(15, Math.sqrt(ct / maxCt) * 100); // sqrt for height too — same logic
    return `<button class='tspark-bar' data-ym='${ym}' style='flex:${flexFor(ct).toFixed(3)}' aria-label='${fmtMonth(ym)} — ${ct} card${ct===1?'':'s'}' title='${fmtMonth(ym)} — ${ct} card${ct===1?'':'s'}'>
      <span class='tspark-fill' style='height:${heightPct.toFixed(1)}%'></span>
    </button>`;
  }).join('');
  // Year tick row: absolutely-positioned labels at cumulative-flex percentages so they
  // align with the sqrt-scaled bars above. The collision detection then prioritises
  // the latest year, the oldest, and the highest-card-count years.
  const years = [...new Set(monthKeysAsc.map(k => k.slice(0,4)))];
  const yearTotals = years.map(y => monthKeysAsc.filter(k => k.startsWith(y+'-')).reduce((s,k) => s + months.get(k).length, 0));
  const monthFlex = monthKeysAsc.map(k => flexFor(months.get(k).length));
  const totalFlex = monthFlex.reduce((a,b) => a+b, 0) || 1;
  const yearStartsPct = [];
  let accFlex = 0;
  for (const y of years){
    yearStartsPct.push((accFlex / totalFlex) * 100);
    // Advance accFlex by the sum of flex for months in this year
    for (let i = 0; i < monthKeysAsc.length; i++){
      if (monthKeysAsc[i].startsWith(y+'-')) accFlex += monthFlex[i];
    }
  }
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
  // Filter sits on two rows so every chip is one click away — no horizontal
  // scroll. Row 1: tier (always 3 chips) + reset; Row 2: domains (wraps to as
  // many lines as needed). The grid keeps labels aligned across rows.
  const filterRow = `<div class='tlfilter'>
    <div class='tlfilter-row'>
      <span class='tlfilter-label'>tier</span>
      <div class='tlfilter-group'>${tierChips}</div>
      ${filterActive ? `<button class='tlfilter-reset' aria-label='Clear all filters'>reset</button>` : ''}
    </div>
    <div class='tlfilter-row'>
      <span class='tlfilter-label'>domain</span>
      <div class='tlfilter-group tlfilter-domains'>${domainChips}</div>
    </div>
  </div>`;
  app.innerHTML = `<section class='timeline-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>timeline</span></div>
    <h1>timeline</h1>
    <p class='lede'>${dated.length} dated insights · ${dayKeys.length} active days · ${dayKeys[0]||'—'} → ${dayKeys[dayKeys.length-1]||'—'}. <span class='timeline-hint'>bar width = cards in month · click to jump · highlight follows scroll</span></p>
    <div class='timeline-sticky'>
      ${filterRow}
      ${sparkSvg}
    </div>
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
    <h1>About a builder's codex</h1>
    <p class='lede'>A library of ideas from people who've shipped things — every idea attached to the person who said it, the place they said it, and the date.</p>

    <h2>What this is, in one paragraph</h2>
    <p>Imagine you're learning a craft — product marketing, growth, design, building with AI. The smart move is to read what people who've actually done it think. The problem: the good thinking is scattered across podcasts, posts, talks, books, and threads. By the time you find a useful idea, you've forgotten where it came from, who said it, and whether it was even theirs. So you can't go back to verify it. You can't cite it cleanly. You can't tell when an idea has been re-said by ten different people (a real signal) versus invented by one (a hot take).</p>
    <p>This codex fixes that. Every card is one idea from one named person, with a primary source URL and a date. We add three things the original source usually doesn't: <em>why</em> it works (mechanism), <em>when</em> it applies (conditions), and <em>when it fails</em> (counter-evidence). So you can use it, not just read it.</p>

    <h2>How to read a card</h2>
    <p>Every card has the same shape. <strong>Claim</strong> states the idea in one sentence. <strong>Mechanism</strong> explains why it works — the underlying causal model. <strong>Conditions</strong> says when it applies and when it doesn't. <strong>Evidence</strong> is the operator's quote or example, with the source. <strong>Signals</strong> are the things you'd see in your own work if it's working. <strong>Counter-evidence</strong> is where it fails or who disagrees. <strong>Cross-references</strong> link to related cards.</p>
    <p>If you only have a minute, read the Claim and skip the rest. If you're considering acting on the idea, read Conditions. If you want to know whether to trust it, read Evidence + Counter-evidence.</p>

    <h2>Three things you can do here</h2>
    <ul>
      <li><strong>Search</strong>. Hit <kbd>⌘K</kbd> or <kbd>/</kbd> from anywhere. Type a phrase, an operator's name, or a domain.</li>
      <li><strong>Find convergence</strong>. The <a href='#/patterns'>patterns</a> page surfaces ideas where 3+ operators independently agree — the strongest signal in the corpus.</li>
      <li><strong>Cite it</strong>. Every card has Copy citation, Copy as markdown, and the original source link. Use them.</li>
    </ul>

    <h2>The corpus right now</h2>
    <ul>
      <li><strong>${STATS.cards}</strong> insight cards across <strong>${STATS.domains}</strong> domains</li>
      <li><strong>${STATS.operators}</strong> operator profiles</li>
      <li><strong>${STATS.patterns}</strong> synthesis patterns (3+ operator convergences)</li>
      <li><strong>${STATS.contradictions}</strong> documented contradictions (where operators disagree)</li>
      <li><strong>${STATS.playbooks}</strong> methodology playbooks</li>
      <li><strong>${STATS.tierA}</strong> Tier A claims (the highest-confidence, best-attributed)</li>
    </ul>

    <h2>The discipline</h2>
    <p>Every claim traces to its primary source. Nothing is paraphrased without attribution. Nothing is invented. If we're not sure of a date, we say "unknown" rather than guess. Where operators disagree, we document the disagreement as a contradiction. Where multiple operators converge, we document the convergence as a synthesis pattern. The codex is opinionated about epistemics so you don't have to be.</p>

    <h2>For agents and other tools</h2>
    <p>The corpus is designed to be readable by AI search engines and other automated tools. <a href='https://codex.iamkesava.com/insight-library/INDEX.json'>INDEX.json</a> is the canonical machine-readable index. Every record carries id, path, operator, source_url, source_date, domain, lifecycle, and tier. <a href='https://codex.iamkesava.com/llms.txt'>llms.txt</a> documents the structure. <a href='https://codex.iamkesava.com/.well-known/agent-permissions.json'>agent-permissions.json</a> declares the licensing terms (MIT, attribution required).</p>
    <p>Every card has a static URL like <code>codex.iamkesava.com/ins/&lt;id&gt;/</code> with full content + Schema.org structured data, so crawlers and AI search agents can read the page without executing JavaScript.</p>

    <h2>License</h2>
    <p>Source on <a href='https://github.com/k3sava/ab-codex' target='_blank' rel='noopener'>GitHub</a>. Released MIT. Raw sources retain their original copyright; the codex archives short excerpts under fair use, always with attribution and a link to the canonical source.</p>
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
  const entries = RECENT_DAILY || [];
  if (!entries.length){
    app.innerHTML = `<section class='insight-page'>
      <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>today</span></div>
      <h1>nothing has landed yet</h1>
      <p style='color:var(--muted);max-width:60ch'>The release log is empty. Insights, operators, patterns, and playbooks land here as they're added — daily ingests from miniu, plus prompted batches and depth passes.</p>
    </section>`;
    return;
  }
  // Side-rail TOC: all dates linked. Sticky on desktop.
  const toc = entries.map(e => `<li><a href='#r-${e.date}'><span class='toc-date'>${e.date}</span><span class='toc-title'>${escapeHtml(e.title || '')}</span></a></li>`).join('');
  // One card per release, newest first. Bodies lazy-load to keep first paint fast.
  const cards_ = entries.map((e, idx) => {
    const ia = (e.insights_added || []).length;
    const oa = (e.operators_added || []).length;
    const pa = (e.patterns_added || []).length;
    const pba = (e.playbooks_added || []).length;
    const counts = [];
    if (ia) counts.push(`<span class='rc rc-i'>+${ia} insight${ia===1?'':'s'}</span>`);
    if (oa) counts.push(`<span class='rc rc-o'>+${oa} operator${oa===1?'':'s'}</span>`);
    if (pa) counts.push(`<span class='rc rc-p'>+${pa} pattern${pa===1?'':'s'}</span>`);
    if (pba) counts.push(`<span class='rc rc-pb'>+${pba} playbook${pba===1?'':'s'}</span>`);
    return `<article class='release ${idx===0 ? 'release-latest' : ''}' id='r-${e.date}' data-path='${e.path}'>
      <header class='release-head'>
        <a class='release-anchor' href='#r-${e.date}' aria-label='Permalink to ${e.date}'>#</a>
        <time class='release-date' datetime='${e.date}'>${e.date}</time>
        ${idx===0 ? `<span class='release-latest-tag'>latest</span>` : ''}
        <h2 class='release-title'>${escapeHtml(e.title || 'release')}</h2>
        ${counts.length ? `<div class='release-counts'>${counts.join('')}</div>` : ''}
      </header>
      <div class='release-body'><p class='loading-line'>reading what landed…</p></div>
    </article>`;
  }).join('');
  app.innerHTML = `<section class='today-page'>
    <div class='crumbs'><a href='#/'>codex</a> <span>·</span> <span>today</span></div>
    <header class='today-head'>
      <h1>release log</h1>
      <p class='lede'>${entries.length} release${entries.length===1?'':'s'} since ${entries[entries.length-1]?.date}. Newest first. Each entry is a snapshot of what landed in the corpus that day — daily ingests from miniu, prompted batches, depth passes, and infrastructure work.</p>
    </header>
    <div class='today-grid'>
      <aside class='today-toc' aria-label='Release dates'>
        <h2 class='toc-h'>all releases</h2>
        <ul>${toc}</ul>
      </aside>
      <div class='today-stream'>${cards_}</div>
    </div>
  </section>`;
  // Lazy-load each release body, then strip frontmatter + leading H1 (rendered in head).
  const stripFm = m => m.startsWith('---\n') ? m.slice(m.indexOf('\n---', 4) + 4).trimStart() : m;
  for (const e of entries){
    const target = document.querySelector(`article.release[data-path='${e.path.replace(/'/g, "\\'")}'] .release-body`);
    if (!target) continue;
    const md = await fetchBody(e.path);
    const cleaned = stripFm(md).replace(/^#\s+[^\n]+\n+/, '');
    target.innerHTML = mdToHtml(cleaned);
    rewriteRelativeLinks(target);
  }
  // Active TOC entry follows scroll
  const tocLinks = Array.from(document.querySelectorAll('.today-toc a'));
  const releaseEls = Array.from(document.querySelectorAll('article.release'));
  const setTocActive = () => {
    const headerOffset = 60 + 20; // hdr + small breathing room
    let active = releaseEls[0]?.id;
    for (const el of releaseEls){
      if (el.getBoundingClientRect().top - 4 <= headerOffset) active = el.id;
      else break;
    }
    tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + active));
  };
  setTocActive();
  let tocTick = false;
  window.addEventListener('scroll', () => {
    if (tocTick) return;
    tocTick = true;
    requestAnimationFrame(() => { setTocActive(); tocTick = false; });
  }, { passive: true });

  // Intercept clicks on TOC links and on each card's permalink "#" anchor.
  // The SPA's hashchange listener treats any unknown hash like "#r-2026-05-04"
  // as a route (→ falls through to `about`). Smooth-scroll instead and use
  // replaceState to keep the URL consistent without re-rendering.
  const handleAnchorClick = (e, link) => {
    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#r-')) return;
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', '#/today#' + id);
    setTocActive();
  };
  document.querySelectorAll('.today-toc a, .release-anchor').forEach(link => {
    link.addEventListener('click', e => handleAnchorClick(e, link));
  });
}

// Update <title> and <meta description> per route — better SEO/AEO surface and
// matches the descriptive-link best practice the corpus documents.
function setPageMeta(title, description){
  const fullTitle = title ? `${title} · a builder's codex` : `a builder's codex — operator insight library`;
  document.title = fullTitle;
  const set = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute('content', value);
  };
  if (description){
    set('meta[name="description"]', description);
    set('meta[property="og:description"]', description);
    set('meta[name="twitter:description"]', description);
  }
  set('meta[property="og:title"]', fullTitle);
  set('meta[name="twitter:title"]', fullTitle);
  const url = `https://codex.iamkesava.com/${location.hash || '#/'}`;
  set('meta[property="og:url"]', url);
}

function setMetaForRoute(r, anchor){
  if (r==='/'||r==='') return setPageMeta(null, 'A primary-source library of operator insights — atomic claims attributed to named operators with verifiable sources.');
  if (r==='/today') return setPageMeta('release log', 'What\'s new in the codex — daily ingests, prompted batches, and depth passes from inception forward.');
  if (r==='/timeline') return setPageMeta('timeline', `${cards.filter(c=>/^\d{4}-\d{2}/.test(c.source_date||'')).length} dated insights across the corpus, density-scaled by month.`);
  if (r==='/operators') return setPageMeta('operators', `${operators.length} operator profiles. Each one a named voice with attributed claims.`);
  if (r==='/patterns') return setPageMeta('patterns', `${patterns.length} synthesis patterns where 3+ operators converge on the same idea from different angles.`);
  if (r==='/playbooks') return setPageMeta('playbooks', `${playbooks.length} methodology playbooks distilled across the corpus.`);
  if (r==='/browse' || r==='/carousel') return setPageMeta('browse', 'Filter insight cards by tier or domain; sort by date, operator, tier.');
  if (r==='/map' || r==='/graph') return setPageMeta('map', 'Interactive force graph: operators outside, domains in the middle, insights orbiting between.');
  if (r==='/flash') return setPageMeta('flash', 'One card at a time. Prev / next / shuffle.');
  if (r==='/about') return setPageMeta('about', 'About a builder\'s codex — primary-source library of operator insights.');
  if (r.startsWith('/ins/')){
    const id = decodeURIComponent(r.slice(5));
    const c = cards.find(x => x.id === id);
    if (c) return setPageMeta(c.claim, `${c.operator} — "${c.claim}" (${c.source_type || 'source'}, ${c.source_date || 'undated'}).`);
  }
  if (r.startsWith('/o/')){
    const slug = decodeURIComponent(r.slice(3));
    const op = operators.find(o => o.slug === slug);
    if (op) return setPageMeta(op.name, `${op.name} on a builder's codex — operator profile, cards, and primary sources.`);
  }
  if (r.startsWith('/pat/')){
    const id = decodeURIComponent(r.slice(5));
    const p = patterns.find(x => x.id === id);
    if (p) return setPageMeta(p.title, `Synthesis pattern: ${p.title}`);
  }
  if (r.startsWith('/play/')){
    const id = decodeURIComponent(r.slice(6));
    const p = playbooks.find(x => x.id === id);
    if (p) return setPageMeta(p.title, `Playbook: ${p.title}`);
  }
  if (r.startsWith('/con/')){
    const id = decodeURIComponent(r.slice(5));
    const c = contradictions.find(x => x.id === id);
    if (c) return setPageMeta(c.title, `Contradiction: ${c.title}`);
  }
  if (r.startsWith('/d/')){
    const d = decodeURIComponent(r.slice(3));
    return setPageMeta(d, `Domain: ${d} — operator insights tagged ${d}.`);
  }
  setPageMeta(null, null);
}

function render(){
  window.scrollTo(0,0);
  ScrollTrigger.getAll().forEach(t=>t.kill());
  const raw = (location.hash || '#/').replace(/^#/,'');
  const hashIdx = raw.indexOf('#');
  const r = hashIdx === -1 ? raw : raw.slice(0, hashIdx);
  const anchor = hashIdx === -1 ? '' : raw.slice(hashIdx + 1);
  setMetaForRoute(r, anchor);
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
      results.innerHTML = `<div class='search-empty'>Search ${cards.length} insights, ${operators.length} operators, ${patterns.length} patterns. Type to start, <kbd>Esc</kbd> to close.</div>`;
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
    results.innerHTML = groups.length ? groups.join('') : `<div class='search-empty'>No matches for "${escapeHtml(q)}" — try a shorter phrase, an operator's last name, or a domain like ai-native.</div>`;
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

// === Keyboard shortcuts — Apple/GitHub-style global navigation ===
// Site-wide shortcuts that don't fight with form inputs or text selection.
// Triggered handler set is scoped: typing in an input, contenteditable, or
// dialog never fires a shortcut.
function wireKeyboardShortcuts(){
  const dialog = document.getElementById('shortcutDialog');
  const closeBtn = document.getElementById('shortcutClose');
  const isTyping = (e) => {
    const el = e.target;
    if (!el) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  };
  const showHelp = () => { try { dialog.showModal(); } catch { dialog.setAttribute('open',''); } };
  const closeHelp = () => { try { dialog.close(); } catch { dialog.removeAttribute('open'); } };
  closeBtn?.addEventListener('click', closeHelp);
  dialog?.addEventListener('click', (e) => { if (e.target === dialog) closeHelp(); });

  // The "g then X" two-key sequence used by GitHub / Linear. The first 'g'
  // arms the sequence for ~900ms.
  let pendingG = 0;
  const gMap = { h: '#/', t: '#/today', o: '#/operators', p: '#/patterns', b: '#/browse', m: '#/map' };

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return; // let OS / browser handle
    if (isTyping(e)) return;
    const k = e.key;

    // ESC closes any open dialog or stops TTS
    if (k === 'Escape'){
      if (dialog?.open) { closeHelp(); e.preventDefault(); return; }
      if (window.speechSynthesis?.speaking) { window.speechSynthesis.cancel(); }
      return;
    }
    // ? help
    if (k === '?'){ showHelp(); e.preventDefault(); return; }
    // / focus search
    if (k === '/'){ document.getElementById('searchOpen')?.click(); e.preventDefault(); return; }

    // g sequence — arm for 900ms
    if (k === 'g' && !pendingG){
      pendingG = Date.now();
      setTimeout(() => { if (Date.now() - pendingG >= 900) pendingG = 0; }, 950);
      return;
    }
    if (pendingG && (Date.now() - pendingG < 900)){
      const target = gMap[k.toLowerCase()];
      pendingG = 0;
      if (target){ location.hash = target; e.preventDefault(); return; }
    }

    // Insight-page-specific
    const onInsight = (location.hash || '').startsWith('#/ins/');
    if (onInsight){
      // j/k → sibling navigation
      if (k === 'j' || k === 'k'){
        const links = Array.from(document.querySelectorAll('.rail-sib-link'));
        const target = k === 'k' ? links.find(a => a.querySelector('.rail-sib-dir')?.textContent.includes('previous')) :
                                    links.find(a => a.querySelector('.rail-sib-dir')?.textContent.includes('next'));
        if (target){ location.hash = target.getAttribute('href'); e.preventDefault(); return; }
      }
      // l → listen / stop  (insight-page button)
      if (k === 'l'){ document.getElementById('listenBtn')?.click(); e.preventDefault(); return; }
      // s → share (insight-page button)
      if (k === 's'){ document.getElementById('shareBtn')?.click(); e.preventDefault(); return; }
      // c → copy citation
      if (k === 'c'){ document.getElementById('citeBtn')?.click(); e.preventDefault(); return; }
      return;
    }
    // Site-wide share + listen on any page that has a meaningful body.
    if (k === 's'){
      const url = location.href;
      const title = document.title;
      const data = { title, url };
      if (navigator.share && navigator.canShare?.(data)){ navigator.share(data).catch(() => {}); }
      else { navigator.clipboard?.writeText(url); }
      e.preventDefault();
      return;
    }
    if (k === 'l'){
      if (!('speechSynthesis' in window)) return;
      if (window.speechSynthesis.speaking){ window.speechSynthesis.cancel(); e.preventDefault(); return; }
      const main = document.getElementById('app');
      // Pick the most-relevant text container by route.
      const sel = ['.release-body', '.body', 'article', 'main'].map(s => main.querySelector(s)).find(Boolean);
      const text = (sel?.innerText || '').slice(0, 8000); // cap so we don't read forever
      if (!text.trim()) return;
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
      e.preventDefault();
    }
  });
}

window.addEventListener('hashchange', () => { render(); setActive(); window.scrollTo({top:0, behavior:'instant'}); });
loadIndex().then(() => { render(); setActive(); wireSearch(); wireHeader(); wireMobileMenu(); wireTheme(); wireKeyboardShortcuts(); dismissSplash(); }).catch(e => {
  document.getElementById('splash')?.remove();
  app.innerHTML = `<section class='about-page'><h1>codex couldn't load.</h1><p style='color:var(--muted)'>${escapeHtml(e.message)}</p></section>`;
});
