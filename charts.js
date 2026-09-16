/* Grafik SVG interaktif, semua dependensi lokal. */
window.drawChart=function(id,labels,series,options={}){
  const host=document.getElementById(id);if(!host)return;
  const state=host._chartState||(host._chartState={hidden:new Set()});
  host.replaceChildren();if(!labels.length){host.innerHTML='<div class="empty">Tidak ada data pada filter ini.</div>';return;}
  const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 720 300');svg.setAttribute('role','group');svg.setAttribute('aria-label',options.title||'Grafik data');
  const tip=document.createElement('div');tip.className='chart-tooltip';host.append(svg,tip);
  const node=(tag,attrs,parent=svg)=>{const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));parent.append(el);return el;};
  const visible=series.filter(s=>!state.hidden.has(s.name));const values=visible.flatMap(s=>s.values.map(Number)),lo=Math.min(0,...values),hi=Math.max(1,...values),range=hi-lo,L=74,T=18,W=625,H=215;
  const y=v=>T+H-(Number(v)-lo)/range*H,step=W/labels.length;
  for(let i=0;i<=4;i++){const v=lo+range*i/4,yy=y(v);node('line',{x1:L,y1:yy,x2:L+W,y2:yy,stroke:'#e8edf5'});const text=node('text',{x:L-9,y:yy+4,'text-anchor':'end',fill:'#667085','font-size':11});text.textContent=new Intl.NumberFormat('id-ID',{notation:'compact',maximumFractionDigits:1}).format(v);}
  function tooltip(event,label,name,value){tip.textContent=label+' • '+name+': '+(options.format||String)(value);tip.style.display='block';const r=host.getBoundingClientRect(),x=event.clientX||r.left+r.width/2;tip.style.left=Math.max(8,Math.min(x-r.left+8,r.width-tip.offsetWidth-8))+'px';tip.style.top='12px';}
  function interact(el,i,s){el.classList.add('chart-point');el.setAttribute('tabindex','0');el.setAttribute('role',options.onSelect?'button':'img');el.setAttribute('aria-label',labels[i]+', '+s.name+': '+(options.format||String)(s.values[i]));el.addEventListener('pointerenter',e=>tooltip(e,labels[i],s.name,s.values[i]));el.addEventListener('focus',e=>tooltip(e,labels[i],s.name,s.values[i]));el.addEventListener('pointerleave',()=>tip.style.display='none');el.addEventListener('blur',()=>tip.style.display='none');el.addEventListener('click',e=>{tooltip(e,labels[i],s.name,s.values[i]);if(options.onSelect)options.onSelect(i);});el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.dispatchEvent(new MouseEvent('click'));}});}
  visible.forEach((s,j)=>{
    if(options.type==='line'){
      node('polyline',{points:s.values.map((v,i)=>(L+step*(i+.5))+','+y(v)).join(' '),fill:'none',stroke:s.color,'stroke-width':3,class:'chart-line'});
      s.values.forEach((v,i)=>{const g=node('g',{});node('circle',{cx:L+step*(i+.5),cy:y(v),r:16,fill:'transparent'},g);node('circle',{cx:L+step*(i+.5),cy:y(v),r:5,fill:s.color,stroke:'white','stroke-width':2},g);interact(g,i,s);});
    }else{
      const bw=Math.min(36,step*.75/Math.max(visible.length,1));s.values.forEach((v,i)=>{const el=node('rect',{x:L+step*(i+.5)-bw*visible.length/2+j*bw,y:Math.min(y(0),y(v)),width:Math.max(1,bw-3),height:Math.max(2,Math.abs(y(v)-y(0))),rx:3,fill:s.color,class:'chart-bar'});interact(el,i,s);});
    }
  });
  labels.forEach((label,i)=>{const el=node('text',{x:L+step*(i+.5),y:264,'text-anchor':'middle',fill:'#667085','font-size':11});el.textContent=String(label).length>15?String(label).slice(0,14)+'…':label;});
  const legend=document.createElement('div');legend.className='chart-legend';series.forEach(s=>{const b=document.createElement('button');b.setAttribute('aria-pressed',!state.hidden.has(s.name));const dot=document.createElement('i');dot.className='swatch';dot.style.background=s.color;b.append(dot,document.createTextNode(s.name));b.onclick=()=>{state.hidden.has(s.name)?state.hidden.delete(s.name):state.hidden.add(s.name);window.drawChart(id,labels,series,options);};legend.append(b);});host.append(legend);
};
