const width = () => document.getElementById('stage').clientWidth;
const height = () => document.getElementById('stage').clientHeight;
const svg = d3.select('#graph');
const g = svg.append('g');
const linkLayer = g.append('g');
const nodeLayer = g.append('g');

fetch('graph.json').then(r=>r.json()).then(init);

function init(data){
  document.getElementById('countPill').textContent = `${data.nodes.length} nodes`;
  svg.attr('viewBox', `0 0 ${width()} ${height()}`);

  const sim = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.edges).id(d=>d.id).distance(75).strength(0.35))
    .force('charge', d3.forceManyBody().strength(-120))
    .force('center', d3.forceCenter(width()/2, height()/2));

  const links = linkLayer.selectAll('line').data(data.edges).enter().append('line').attr('class','link');

  const nodes = nodeLayer.selectAll('g').data(data.nodes).enter().append('g').attr('class','node')
    .call(d3.drag().on('start',dragstart).on('drag',drag).on('end',dragend))
    .on('click',(_,d)=>showCards(d,data));

  nodes.append('circle')
    .attr('r',d=>8 + (d.weight||1))
    .attr('fill',d=>d.color || '#76e0ff');

  nodes.append('text').attr('class','label').attr('dy',-12).attr('text-anchor','middle').text(d=>d.label);

  sim.on('tick',()=>{
    links.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
    nodes.attr('transform',d=>`translate(${d.x},${d.y})`);
  });

  const zoom = d3.zoom().scaleExtent([0.3, 4]).on('zoom',e=>g.attr('transform',e.transform));
  svg.call(zoom);
  document.getElementById('zoomIn').onclick=()=>svg.transition().call(zoom.scaleBy,1.25);
  document.getElementById('zoomOut').onclick=()=>svg.transition().call(zoom.scaleBy,0.8);
  document.getElementById('reset').onclick=()=>svg.transition().call(zoom.transform,d3.zoomIdentity);

  function dragstart(event,d){ if(!event.active) sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y;}
  function drag(event,d){ d.fx=event.x; d.fy=event.y;}
  function dragend(event,d){ if(!event.active) sim.alphaTarget(0); d.fx=null; d.fy=null;}
}

function showCards(node,data){
  const tray=document.getElementById('cardTray');
  const cards=document.getElementById('cards');
  cards.innerHTML='';
  const related=data.cards.filter(c=>c.node===node.id).slice(0,8);
  related.forEach(c=>{
    const el=document.createElement('article'); el.className='card';
    el.innerHTML=`<h4>${c.title}</h4><p>${c.text}</p>`;
    cards.appendChild(el);
  });
  tray.classList.remove('hidden');
}
