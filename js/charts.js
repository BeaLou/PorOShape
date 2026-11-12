// Gráficos em SVG puro, sem bibliotecas.
import {esc,nf,clamp} from './util.js';
export function lineChart(pts,o){
  o=o||{};const W=340,H=190,L=38,R=16,T=16,B=26;
  const vs=pts.map(p=>p.v);if(o.goal!=null)vs.push(o.goal);
  let mn=Math.min.apply(null,vs),mx=Math.max.apply(null,vs);if(mx-mn<1){mx+=.5;mn-=.5}
  const lo=mn,hi=mx,pd=(mx-mn)*.15;mn-=pd;mx+=pd;
  const t0=pts[0].t,t1=pts[pts.length-1].t,sp=t1-t0||1;
  const X=t=>pts.length===1?L+(W-L-R)/2:L+(t-t0)/sp*(W-L-R);
  const Y=v=>T+(mx-v)/(mx-mn)*(H-T-B);
  let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(o.label||'Gráfico')+'">';
  for(let i=0;i<4;i++){const v=lo+(hi-lo)*i/3;s+='<line class="grid-l" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text class="axis" x="'+(L-6)+'" y="'+(Y(v)+3)+'" text-anchor="end">'+nf(v,o.dec==null?1:o.dec)+'</text>'}
  if(o.goal!=null)s+='<line class="goal-l" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(o.goal)+'" y2="'+Y(o.goal)+'"/><text class="goal-t" x="'+(W-R)+'" y="'+(Y(o.goal)-4)+'" text-anchor="end">meta '+nf(o.goal)+'</text>';
  const d=pts.map((p,i)=>(i?'L':'M')+X(p.t).toFixed(1)+' '+Y(p.v).toFixed(1)).join(' ');
  if(pts.length>1)s+='<path class="area" d="'+d+' L'+X(t1)+' '+(H-B)+' L'+X(t0)+' '+(H-B)+' Z"/><path class="ln" d="'+d+'"/>';
  pts.forEach((p,i)=>{const end=i===pts.length-1;if(end||pts.length<=24)s+='<circle class="pt'+(end?' end':'')+'" cx="'+X(p.t)+'" cy="'+Y(p.v)+'" r="'+(end?5:3.5)+'"/>'});
  const e=pts[pts.length-1];
  s+='<text class="val-t" x="'+clamp(X(e.t),L+14,W-R)+'" y="'+(Y(e.v)-10)+'" text-anchor="'+(pts.length===1?'middle':'end')+'">'+nf(e.v,o.dec==null?1:o.dec)+(o.unit||'')+'</text>';
  const dl=t=>new Date(t).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
  if(pts.length===1)s+='<text class="axis" x="'+X(t0)+'" y="'+(H-8)+'" text-anchor="middle">'+dl(t0)+'</text>';
  else s+='<text class="axis" x="'+L+'" y="'+(H-8)+'">'+dl(t0)+'</text><text class="axis" x="'+(W-R)+'" y="'+(H-8)+'" text-anchor="end">'+dl(t1)+'</text>';
  return s+'</svg>';
}
export function barChart(items,target){
  const W=340,H=170,L=14,R=12,T=18,B=24;const mx=Math.max(target,Math.max.apply(null,items.map(i=>i.n)),1);
  const Y=v=>T+(mx-v)/mx*(H-T-B);const bw=(W-L-R)/items.length;
  let s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Treinos por semana">';
  s+='<line class="grid-l" x1="'+L+'" x2="'+(W-R)+'" y1="'+(H-B)+'" y2="'+(H-B)+'"/>';
  s+='<line class="goal-l" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(target)+'" y2="'+Y(target)+'"/><text class="goal-t" x="'+(W-R)+'" y="'+(Y(target)-4)+'" text-anchor="end">meta '+target+'</text>';
  items.forEach((it,i)=>{const x=L+i*bw+bw*.2,w=bw*.6,y=Y(it.n);
    s+='<rect class="bar-r'+(it.n>=target?' hit':'')+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+Math.max(0,H-B-y)+'" rx="4"/>';
    if(it.n>0)s+='<text class="val-t" x="'+(x+w/2)+'" y="'+(y-4)+'" text-anchor="middle">'+it.n+'</text>';
    s+='<text class="axis" x="'+(x+w/2)+'" y="'+(H-8)+'" text-anchor="middle">'+it.l+'</text>'});
  return s+'</svg>';
}

