// Funções utilitárias: DOM, datas, números e ícones.
export const $=(s,r=document)=>r.querySelector(s);
export const pad=n=>String(n).padStart(2,'0');
export const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
export const parse=s=>new Date(s+'T12:00:00');
export const today=()=>iso(new Date());
export const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const num=v=>{const n=parseFloat(String(v==null?'':v).replace(',','.'));return isFinite(n)?n:null};
export const nf=(v,d=1)=>v==null?'–':Number(v).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:d});
export const fdate=(s,o)=>parse(s).toLocaleDateString('pt-BR',o||{day:'2-digit',month:'2-digit'});
export const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
export const mondayOf=s=>{const d=parse(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d)};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const cap=x=>x.charAt(0).toUpperCase()+x.slice(1);
export const clone=o=>JSON.parse(JSON.stringify(o));
export const IC={
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  dumb:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  body:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 10a5 5 0 0 1 8 0"/><path d="M12 10l2-2.5"/>',
  cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  chart:'<path d="M4 20V4M4 20h16"/><path d="M8 15l4-4 3 3 5-6"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'
};
export const icon=(n,c)=>'<svg class="i'+(c?' '+c:'')+'" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>';

