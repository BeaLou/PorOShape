// Por o Shape: estado, telas e ações do app.
import {$,iso,parse,today,esc,num,nf,fdate,addDays,mondayOf,clamp,cap,icon} from './util.js';
import {DAYS,EXMAP,MEAS,HABITS,TIPS,CARDIO,DEFAULTS} from './plan.js';
import {lineChart,barChart} from './charts.js';
import {Store} from './store.js';

/* ---------- estado ---------- */
const S={tab:'hoje',settings:Object.assign({},DEFAULTS),days:{},sessions:{},body:{},photos:{},cardio:{},
  loaded:false,ui:{day:'A',date:today(),bodyDate:today(),pose:'Todas',addPose:'Frente',pDate:today(),cmpA:null,cmpB:null,meas:'cintura',exSel:null,cType:'Bicicleta',cMin:20,cOther:'',confirm:null,modal:null,lightbox:null}};
const resolveEx=e=>(S.settings.lowImpact&&e.alt)?Object.assign({},e,e.alt):e;
function paintStatus(){$('#status').innerHTML='<span class="dot'+(Store.ok?'':' local')+'"></span><span>'+(Store.ok?'Dados salvos neste aparelho':'Não consegui salvar. Faça um backup')+'</span>'}
function save(col,id,data){Store.put(col,id,data).catch(()=>toast('Não consegui salvar agora. Tente de novo.'))}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2400)}


/* ---------- cálculos ---------- */
const weights=()=>Object.keys(S.body).filter(d=>S.body[d].weight!=null).sort().map(d=>({date:d,weight:S.body[d].weight}));
const curWeight=()=>{const w=weights();return w.length?w[w.length-1].weight:S.settings.startWeight};
function sessDone(s){let done=0;Object.values(s.ex||{}).forEach(r=>{done+=(r.done||[]).filter(Boolean).length});const day=DAYS.find(d=>d.k===s.day);const total=day?day.ex.reduce((a,e)=>a+e.s,0):1;return {done,total}}
function counted(s){if(s.min)return true;const x=sessDone(s);return x.total>0&&x.done/x.total>=0.5}
const countedSessions=()=>Object.values(S.sessions).filter(counted).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
function weekCount(date){const m=mondayOf(date),e=addDays(m,6);return countedSessions().filter(s=>s.date>=m&&s.date<=e).length}
function nextDay(){const l=countedSessions();if(!l.length)return 'A';const i=DAYS.findIndex(d=>d.k===l[l.length-1].day);return DAYS[(i+1)%DAYS.length].k}
function pace(){const w=weights();if(w.length<2)return null;const last=w[w.length-1];const win=w.filter(x=>x.date>=addDays(last.date,-28));if(win.length<2)return null;const days=(parse(last.date)-parse(win[0].date))/864e5;if(days<6)return null;return (win[0].weight-last.weight)/(days/7)}
function projection(){
  const left=curWeight()-S.settings.goalWeight;if(left<=0)return 'Meta alcançada. Parabéns!';
  const f=n=>parse(addDays(today(),Math.round(n))).toLocaleDateString('pt-BR',{month:'short',year:'numeric'}).replace('.','');
  return 'No ritmo seguro de 0,5 a 0,8 kg por semana, a chegada fica entre '+f(left/0.8*7)+' e '+f(left/0.5*7)+'.';
}
function lastFor(exId,curId){
  let best=null;
  Object.keys(S.sessions).forEach(id=>{if(id===curId)return;const s=S.sessions[id];const r=s.ex&&s.ex[exId];if(!r||r.kg==null||s.date>S.ui.date)return;if(!best||s.date>best.date)best={date:s.date,kg:r.kg,top:!!r.top}});
  return best;
}


/* ---------- telas ---------- */
const TABS=[['hoje','Hoje','home'],['treino','Treino','dumb'],['corpo','Corpo','body'],['fotos','Fotos','cam'],['evolucao','Evolução','chart']];
function vHoje(){
  const t=today(),d=S.days[t]||{},st=S.settings,cur=curWeight();
  const total=Math.max(st.startWeight-st.goalWeight,.1),lost=st.startWeight-cur,pct=clamp(lost/total,0,1),left=Math.max(0,cur-st.goalWeight);
  const hr=new Date().getHours(),greet=hr<12?'Bom dia':hr<18?'Boa tarde':'Boa noite';
  const wk=weekCount(t),nx=nextDay(),nd=DAYS.find(x=>x.k===nx);
  const doneToday=countedSessions().find(s=>s.date===t);
  const m=mondayOf(t),cs=countedSessions();
  const names=['seg','ter','qua','qui','sex','sáb','dom'];
  const dots=names.map((n,i)=>{const dt=addDays(m,i),on=cs.some(s=>s.date===dt);return '<div class="wd'+(on?' on':'')+(dt===t?' today':'')+'"><i>'+icon('check')+'</i>'+n+'</div>'}).join('');
  const hCount=HABITS.filter(h=>d[h.k]).length;
  const tip=TIPS[Math.floor((parse(t)-new Date(parse(t).getFullYear(),0,0))/864e5)%TIPS.length];
  const pc=pace();
  const ms=[5,10,15,20,Math.round(total)].filter((v,i,a)=>v<=total&&a.indexOf(v)===i);
  return '<div><div class="hello">'+greet+'. Vamos cuidar de hoje.</div><div class="date">'+cap(parse(t).toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'}))+'</div></div>'
  +'<div class="tiles"><div class="tile"><div class="v">'+nf(cur)+'<small>kg</small></div><div class="l">Peso atual</div></div>'
  +'<div class="tile"><div class="v">'+nf(left)+'<small>kg</small></div><div class="l">Até a meta</div></div>'
  +'<div class="tile"><div class="v">'+wk+'<small>/4</small></div><div class="l">Treinos na semana</div></div></div>'
  +'<section class="card" style="--dc:var('+nd.color+')"><div class="row between"><h2>'+(doneToday?'Treino de hoje feito':'Próximo treino')+'</h2></div>'
  +'<div class="weekdots" aria-label="Treinos desta semana">'+dots+'</div>'
  +(doneToday?'<div class="note green">Treino '+esc(doneToday.day)+' registrado. Hidrate-se e descanse bem.</div>'
   :'<div class="row"><span class="tag day" style="--dc:var('+nd.color+')">'+nx+'</span><b>'+esc(nd.name)+'</b><span class="muted">'+nd.ex.length+' exercícios</span></div>')
  +'<button class="btn full" data-act="go-treino" data-k="'+nx+'">'+(doneToday?'Ver treinos':'Começar treino '+nx)+'</button></section>'
  +'<section class="card"><div class="row between"><h2>Check-in de hoje</h2><span class="small">'+hCount+' de '+HABITS.length+'</span></div>'
  +HABITS.map(h=>'<button class="habit'+(d[h.k]?' on':'')+'" data-act="habit" data-k="'+h.k+'" aria-pressed="'+(!!d[h.k])+'"><span class="ck">'+icon('check')+'</span><span>'+h.t+'</span></button>').join('')
  +'<div class="row between"><div><b>Passos</b><div class="small">Referência: 7 a 10 mil por dia</div></div><div class="stepper"><button data-act="steps-" aria-label="Menos mil passos">−</button><input id="steps" inputmode="numeric" data-field="steps" value="'+(d.steps!=null?d.steps:'')+'" placeholder="0" aria-label="Passos de hoje"><button data-act="steps+" aria-label="Mais mil passos">+</button></div></div>'
  +'<div class="row"><label class="f" style="flex:1">Peso de hoje (kg)<input id="qw" inputmode="decimal" placeholder="'+nf(cur)+'" value="'+(S.body[t]&&S.body[t].weight!=null?nf(S.body[t].weight):'')+'"></label><button class="btn" data-act="qweight" style="align-self:flex-end">Salvar peso</button></div></section>'
  +'<section class="card"><h2>Minha meta</h2><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(pct*100)+'"><i style="width:'+(pct*100)+'%"></i></div>'
  +'<div class="row between"><span><b>'+(lost>=0?'−':'+')+nf(Math.abs(lost))+' kg</b> de '+nf(total,0)+' kg</span><span class="muted">'+nf(st.startWeight)+' → '+nf(st.goalWeight)+' kg</span></div>'
  +'<div class="row">'+ms.map(v=>'<span class="chip ms'+(lost>=v?' on':'')+'">'+v+' kg</span>').join('')+'</div>'
  +'<p class="muted">'+projection()+(pc!=null?' Seu ritmo das últimas semanas: '+nf(pc,2)+' kg por semana.':'')+'</p></section>'
  +'<section class="note green">'+esc(tip)+'</section>';
}

function vTreino(){
  const u=S.ui,day=DAYS.find(d=>d.k===u.day),id=u.date+'_'+u.day,s=S.sessions[id]||{date:u.date,day:u.day,ex:{},min:false};
  const exs=day.ex.map(resolveEx),dn=sessDone(Object.assign({},s,{ex:s.ex}));
  const pct=dn.total?dn.done/dn.total:0;
  const pills=DAYS.map(d=>'<button class="daypill" style="--dc:var('+d.color+')" data-act="day" data-k="'+d.k+'" aria-pressed="'+(d.k===u.day)+'"><b>'+d.k+'</b><span>'+esc(d.name)+'</span></button>').join('');
  const cards=exs.map(e=>{
    const r=s.ex[e.id]||{kg:null,done:[],top:false},last=e.t==='load'?lastFor(e.id,id):null;
    const done=(r.done||[]).filter(Boolean).length,all=done>=e.s;
    const base=r.kg!=null?r.kg:(last?last.kg:0);
    let sets='';
    if(e.t==='cardio')sets='<button class="set'+(r.done&&r.done[0]?' on':'')+'" data-act="set" data-ex="'+e.id+'" data-i="0" aria-pressed="'+!!(r.done&&r.done[0])+'">Feito</button>';
    else for(let i=0;i<e.s;i++){const on=!!(r.done&&r.done[i]);sets+='<button class="set'+(on?' on':'')+'" data-act="set" data-ex="'+e.id+'" data-i="'+i+'" aria-pressed="'+on+'" aria-label="Série '+(i+1)+'">'+(i+1)+'</button>'}
    const step=e.t==='load'?'<div class="stepper"><button data-act="kg-" data-ex="'+e.id+'" aria-label="Diminuir carga">−</button><input inputmode="decimal" data-field="kg" data-ex="'+e.id+'" value="'+(r.kg!=null?nf(r.kg,2):'')+'" placeholder="'+(last?nf(last.kg,2):'0')+'" aria-label="Carga de '+esc(e.n)+' em kg"><span class="u">kg</span><button data-act="kg+" data-ex="'+e.id+'" aria-label="Aumentar carga">+</button></div>':'';
    let hint='';
    if(last){const sug=last.kg+(e.step||2.5);hint='<div class="hint">Última vez: '+nf(last.kg,2)+' kg em '+fdate(last.date)+(last.top&&r.kg!==sug?' · <b>Bateu o topo, tente '+nf(sug,2)+' kg</b> <button class="btn ghost sm" data-act="usekg" data-ex="'+e.id+'" data-v="'+sug+'">Usar</button>':'')+'</div>'}
    return '<article class="ex'+(all?' ok':'')+'" style="--dc:var('+day.color+')"><div class="ex-h"><div><h3>'+esc(e.n)+'</h3><div class="muted">'+(e.t==='cardio'?esc(e.r):e.s+' × '+esc(e.r)+(e.t==='load'?' · descanso 60–90 s':''))+'</div></div>'+step+'</div>'
      +(e.note?'<div class="note">'+esc(e.note)+'</div>':'')+hint+'<div class="sets">'+sets+'</div>'
      +(e.t==='load'?'<button class="chip'+(r.top?' on':'')+'" style="align-self:flex-start" data-act="top" data-ex="'+e.id+'" aria-pressed="'+!!r.top+'">Fechei o topo das repetições</button>':'')+'</article>';
  }).join('');
  const hasData=x=>counted(x)||sessDone(x).done>0||Object.values(x.ex||{}).some(r=>r.kg!=null);
  const hist=Object.keys(S.sessions).map(k=>Object.assign({id:k},S.sessions[k])).filter(hasData).sort((a,b)=>a.date===b.date?(a.day<b.day?1:-1):a.date<b.date?1:-1).slice(0,10).map(x=>{
    const dd=DAYS.find(q=>q.k===x.day),y=sessDone(x),ask=u.confirm==='sessions'+x.id,inc=!counted(x);
    return '<div class="li"><button style="flex:1;background:none;border:0;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:10px" data-act="open-session" data-d="'+x.date+'" data-k="'+x.day+'"><span class="row"><span class="tag day" style="--dc:var('+dd.color+')">'+x.day+'</span><span>'+fdate(x.date,{weekday:'short',day:'2-digit',month:'2-digit'})+'</span></span><span class="muted">'+(x.min?'versão mínima':y.done+'/'+y.total+' séries'+(inc?' · incompleto':''))+'</span></button>'
      +'<button class="btn ghost sm" data-act="del" data-col="sessions" data-id="'+x.id+'" aria-label="Apagar treino">'+(ask?'Confirmar':icon('trash'))+'</button></div>'}).join('');
  const cList=Object.keys(S.cardio).map(k=>Object.assign({id:k},S.cardio[k])).sort((a,b)=>a.date===b.date?b.ts-a.ts:a.date<b.date?1:-1).slice(0,8);
  const cardio='<section class="card"><div class="row between"><h2>Cardio</h2><span class="small">em '+fdate(u.date)+'</span></div>'
    +'<div class="row">'+CARDIO.map(c=>'<button class="chip'+(u.cType===c?' on':'')+'" data-act="ctype" data-v="'+c+'" aria-pressed="'+(u.cType===c)+'">'+c+'</button>').join('')+'</div>'
    +(u.cType==='Outro'?'<label class="f">Qual cardio?<input id="c-other" data-field="cother" maxlength="40" value="'+esc(u.cOther)+'" placeholder="Ex.: dança, remo"></label>':'')
    +'<div class="row between"><b>Tempo</b><div class="stepper"><button data-act="cmin-" aria-label="Menos 5 minutos">−</button><input id="c-min" inputmode="numeric" data-field="cmin" value="'+u.cMin+'" aria-label="Minutos de cardio"><span class="u">min</span><button data-act="cmin+" aria-label="Mais 5 minutos">+</button></div></div>'
    +'<button class="btn full" data-act="save-cardio">Salvar cardio</button>'
    +(cList.length?'<div class="list">'+cList.map(c=>{const ask=u.confirm==='cardio'+c.id;return '<div class="li"><span><b>'+fdate(c.date,{weekday:'short',day:'2-digit',month:'2-digit'})+'</b> '+esc(c.tipo)+' <span class="muted">· '+c.min+' min</span></span><button class="btn ghost sm" data-act="del" data-col="cardio" data-id="'+c.id+'" aria-label="Apagar cardio">'+(ask?'Confirmar':icon('trash'))+'</button></div>'}).join('')+'</div>':'')+'</section>';
  return '<div class="daypills">'+pills+'</div>'
  +'<section class="card"><div class="row between"><h2>Treino '+day.k+': '+esc(day.name)+'</h2><span class="small">'+dn.done+'/'+dn.total+' séries</span></div>'
  +'<div class="bar"><i style="width:'+(pct*100)+'%"></i></div>'
  +'<div class="row"><label class="f" style="flex:1">Data do treino<input type="date" id="tdate" data-field="tdate" value="'+u.date+'" max="'+today()+'"></label>'
  +'<button class="chip'+(s.min?' on':'')+'" style="align-self:flex-end" data-act="min" aria-pressed="'+!!s.min+'">Só a versão mínima</button></div>'
  +(S.settings.lowImpact?'<div class="note">Modo baixo impacto ligado: exercícios de impacto têm alternativa. Dá para desligar nos ajustes.</div>':'')
  +(S.sessions[id]?'<button class="btn ghost sm" style="align-self:flex-start" data-act="del" data-col="sessions" data-id="'+id+'">'+(u.confirm==='sessions'+id?'Toque de novo para apagar':'Apagar este treino')+'</button>':'')
  +'</section>'+cards+cardio
  +'<section class="card"><h2>Regras do jogo</h2><p class="muted">Descanse 60 a 90 s entre as séries e 2 a 3 min nos exercícios principais. Quando fechar o topo das repetições em todas as séries, suba um pouco a carga. Em dias sem treino, faça caminhada inclinada ou bike por 20 a 30 min.</p></section>'
  +'<section class="card"><h2>Últimos treinos</h2>'+(hist?'<div class="list">'+hist+'</div>':'<div class="empty">Seus treinos registrados aparecem aqui.</div>')+'</section>';
}

function bodyRows(){return Object.keys(S.body).sort().map(d=>Object.assign({date:d},S.body[d]))}
function vCorpo(){
  const u=S.ui,e=S.body[u.bodyDate]||{},rows=bodyRows(),prev=rows.filter(r=>r.date<u.bodyDate).pop()||{};
  const ph=k=>prev[k]!=null?nf(prev[k]):'';
  const fields=MEAS.map(m=>'<label class="f">'+m.n+' (cm)<input id="m-'+m.k+'" inputmode="decimal" value="'+(e[m.k]!=null?nf(e[m.k]):'')+'" placeholder="'+ph(m.k)+'"><span class="small" style="font-weight:400">'+m.h+'</span></label>').join('');
  const first=k=>rows.find(r=>r[k]!=null),last=k=>rows.slice().reverse().find(r=>r[k]!=null);
  const items=[{k:'weight',n:'Peso',u:'kg'},{k:'fat',n:'Gordura corporal',u:'%'}].concat(MEAS.map(m=>({k:m.k,n:m.n,u:'cm'})));
  const sum=items.map(it=>{const a=first(it.k),b=last(it.k);if(!a)return '';const dl=b[it.k]-a[it.k];
    return '<tr><td>'+it.n+'</td><td class="r">'+nf(a[it.k])+'</td><td class="r">'+nf(b[it.k])+' '+it.u+'</td><td class="r '+(dl<0?'down':dl>0?'up':'')+'">'+(dl>0?'+':'')+nf(dl)+'</td></tr>'}).join('');
  const hist=rows.slice().reverse().slice(0,12).map(r=>{
    const parts=[r.weight!=null?nf(r.weight)+' kg':null,r.fat!=null?nf(r.fat)+'% gord.':null,r.cintura!=null?'cintura '+nf(r.cintura):null].filter(Boolean).join(' · ');
    const key='body'+r.date,ask=u.confirm===key;
    return '<div class="li"><button style="background:none;border:0;text-align:left" data-act="edit-body" data-d="'+r.date+'"><b>'+fdate(r.date,{day:'2-digit',month:'2-digit',year:'2-digit'})+'</b> <span class="muted">'+(parts||'medidas')+'</span></button><button class="btn ghost sm" data-act="del" data-col="body" data-id="'+r.date+'" aria-label="Apagar registro">'+(ask?'Confirmar':icon('trash'))+'</button></div>'}).join('');
  return '<section class="card"><h2>Registrar medidas</h2>'
  +'<label class="f">Data<input type="date" id="bdate" data-field="bdate" value="'+u.bodyDate+'" max="'+today()+'"></label>'
  +'<div class="grid2"><label class="f">Peso (kg)<input id="b-weight" inputmode="decimal" value="'+(e.weight!=null?nf(e.weight):'')+'" placeholder="'+ph('weight')+'"></label>'
  +'<label class="f">Gordura corporal (%)<input id="b-fat" inputmode="decimal" value="'+(e.fat!=null?nf(e.fat):'')+'" placeholder="'+ph('fat')+'"></label></div>'
  +'<div class="grid2">'+fields+'</div>'
  +'<button class="btn full" data-act="save-body">Salvar registro</button>'
  +'<p class="small">Meça sempre no mesmo horário, de preferência em jejum e com a fita sem apertar. A cintura costuma contar mais que o número da balança.</p></section>'
  +'<section class="card"><h2>Desde o início</h2>'+(sum?'<div class="scroll-x"><table><thead><tr><th>Medida</th><th class="r">Início</th><th class="r">Agora</th><th class="r">Mudança</th></tr></thead><tbody>'+sum+'</tbody></table></div>':'<div class="empty">Salve seu primeiro registro para acompanhar a mudança.</div>')+'</section>'
  +'<section class="card"><h2>Registros</h2>'+(hist?'<div class="list">'+hist+'</div>':'<div class="empty">Nenhum registro ainda.</div>')+'</section>';
}

function vFotos(){
  const u=S.ui,all=Object.keys(S.photos).map(id=>Object.assign({id:id},S.photos[id])).sort((a,b)=>a.date===b.date?a.ts-b.ts:a.date<b.date?-1:1);
  const poses=['Frente','Lado','Costas'];
  const shown=(u.pose==='Todas'?all:all.filter(p=>p.pose===u.pose)).slice().reverse();
  const cp=poses.includes(u.pose)?u.pose:'Frente',cl=all.filter(p=>p.pose===cp);
  if(!u.cmpSet||!cl.find(p=>p.id===u.cmpA)||!cl.find(p=>p.id===u.cmpB)){u.cmpA=cl.length>1?cl[0].id:null;u.cmpB=cl.length?cl[cl.length-1].id:null;u.cmpSet=false}
  const opt=sel=>cl.map(p=>'<option value="'+p.id+'"'+(p.id===sel?' selected':'')+'>'+fdate(p.date,{day:'2-digit',month:'2-digit',year:'2-digit'})+'</option>').join('');
  const A=S.photos[u.cmpA],B=S.photos[u.cmpB];
  const cmp=(A&&B&&u.cmpA!==u.cmpB)?'<div class="cmp" id="cmp"><img src="'+B.img+'" alt="Depois"><img class="top" src="'+A.img+'" alt="Antes"><span class="hl"></span><span class="lb" style="left:10px">Antes</span><span class="lb" style="right:10px">Depois</span></div><input type="range" id="slider" min="0" max="100" value="50" aria-label="Comparar antes e depois">'
    :'<div class="empty">Adicione ao menos duas fotos de '+cp.toLowerCase()+' em datas diferentes para comparar.</div>';
  return '<section class="card"><h2>Nova foto</h2>'
  +'<div class="row">'+poses.map(p=>'<button class="chip'+(u.addPose===p?' on':'')+'" data-act="addpose" data-v="'+p+'" aria-pressed="'+(u.addPose===p)+'">'+p+'</button>').join('')+'</div>'
  +'<div class="row"><label class="f" style="flex:1">Data<input type="date" id="pdate" data-field="pdate" value="'+u.pDate+'" max="'+today()+'"></label><button class="btn" style="align-self:flex-end" data-act="pick">Escolher foto</button></div>'
  +'<input type="file" id="pfile" accept="image/*" hidden>'
  +'<p class="small">Mesma luz, mesma distância e mesma roupa deixam a comparação mais justa. '+'As fotos ficam só neste aparelho e nunca são enviadas. Faça um backup nos ajustes.'+'</p></section>'
  +'<section class="card"><div class="row between"><h2>Antes e depois</h2><div class="row">'+poses.map(p=>'<button class="chip'+(cp===p?' on':'')+'" data-act="pose" data-v="'+p+'" aria-pressed="'+(cp===p)+'">'+p+'</button>').join('')+'</div></div>'
  +(cl.length>1?'<div class="grid2"><label class="f">Antes<select id="cmpA" data-field="cmpA">'+opt(u.cmpA)+'</select></label><label class="f">Depois<select id="cmpB" data-field="cmpB">'+opt(u.cmpB)+'</select></label></div>':'')
  +cmp+'</section>'
  +'<section class="card"><div class="row between"><h2>Galeria</h2><div class="row"><button class="chip'+(u.pose==='Todas'?' on':'')+'" data-act="pose" data-v="Todas">Todas</button></div></div>'
  +(shown.length?'<div class="photos">'+shown.map(p=>'<button class="ph" data-act="lightbox" data-id="'+p.id+'" aria-label="Foto '+p.pose+' de '+fdate(p.date)+'"><img src="'+p.img+'" alt=""><span>'+fdate(p.date)+' · '+p.pose+'</span></button>').join('')+'</div>':'<div class="empty">Suas fotos de progresso aparecem aqui.</div>')+'</section>';
}

function vEvolucao(){
  const w=weights(),st=S.settings;
  const wChart=w.length?lineChart(w.map(x=>({t:parse(x.date).getTime(),v:x.weight})),{goal:st.goalWeight,unit:' kg',label:'Peso ao longo do tempo'}):'<div class="empty">Registre seu peso para ver a curva aqui.</div>';
  const pc=pace(),lost=w.length?st.startWeight-w[w.length-1].weight:0;
  const rows=bodyRows(),mk=[{k:'fat',n:'Gordura %',u:'%'}].concat(MEAS.map(m=>({k:m.k,n:m.n,u:' cm'})));
  const avail=mk.filter(m=>rows.some(r=>r[m.k]!=null));
  if(!avail.find(m=>m.k===S.ui.meas))S.ui.meas=avail.length?avail[0].k:'cintura';
  const sel=avail.find(m=>m.k===S.ui.meas);
  const mp=sel?rows.filter(r=>r[sel.k]!=null).map(r=>({t:parse(r.date).getTime(),v:r[sel.k]})):[];
  const mChart=mp.length?lineChart(mp,{unit:sel.u,label:sel.n+' ao longo do tempo'}):'<div class="empty">Registre medidas na aba Corpo para ver cada uma aqui.</div>';
  const m0=mondayOf(today()),cs=countedSessions(),weeks=[];
  for(let i=7;i>=0;i--){const a=addDays(m0,-7*i),b=addDays(a,6);weeks.push({l:fdate(a),n:cs.filter(s=>s.date>=a&&s.date<=b).length})}
  const cw=[];for(let i=7;i>=0;i--){const a=addDays(m0,-7*i),b=addDays(a,6);cw.push({l:fdate(a),n:Object.values(S.cardio).filter(c=>c.date>=a&&c.date<=b).reduce((t,c)=>t+c.min,0)})}
  const logged={};Object.values(S.sessions).forEach(s=>Object.keys(s.ex||{}).forEach(k=>{if(s.ex[k].kg!=null&&EXMAP[k])logged[k]=1}));
  const exl=Object.keys(logged);
  if(!exl.includes(S.ui.exSel))S.ui.exSel=exl[0]||null;
  let lc='<div class="empty">Registre cargas na aba Treino para ver a progressão.</div>',lsel='';
  if(S.ui.exSel){
    const pts=Object.values(S.sessions).filter(s=>s.ex&&s.ex[S.ui.exSel]&&s.ex[S.ui.exSel].kg!=null).sort((a,b)=>a.date<b.date?-1:1).map(s=>({t:parse(s.date).getTime(),v:s.ex[S.ui.exSel].kg}));
    lc=lineChart(pts,{unit:' kg',dec:1,label:'Carga de '+EXMAP[S.ui.exSel].n});
    lsel='<label class="f">Exercício<select id="exsel" data-field="exsel">'+exl.map(k=>'<option value="'+k+'"'+(k===S.ui.exSel?' selected':'')+'>'+esc(EXMAP[k].n)+'</option>').join('')+'</select></label>';
  }
  return '<section class="card"><div class="row between"><h2>Peso</h2>'+(w.length>1?'<span class="small">'+(lost>=0?'−':'+')+nf(Math.abs(lost))+' kg desde o início'+(pc!=null?' · '+nf(pc,2)+' kg/sem':'')+'</span>':'')+'</div><div class="chart">'+wChart+'</div></section>'
  +'<section class="card"><h2>Medidas</h2>'+(avail.length?'<div class="row">'+avail.map(m=>'<button class="chip'+(m.k===S.ui.meas?' on':'')+'" data-act="meas" data-v="'+m.k+'" aria-pressed="'+(m.k===S.ui.meas)+'">'+m.n+'</button>').join('')+'</div>':'')+'<div class="chart">'+mChart+'</div></section>'
  +'<section class="card"><h2>Treinos por semana</h2><div class="chart">'+barChart(weeks,4)+'</div><p class="small">Contam treinos com metade das séries feitas ou a versão mínima.</p></section>'
  +'<section class="card"><h2>Cardio por semana</h2>'+(Object.keys(S.cardio).length?'<div class="chart">'+barChart(cw,null,'Minutos de cardio por semana')+'</div><p class="small">Soma dos minutos de cada semana.</p>':'<div class="empty">Registre cardio na aba Treino para ver os minutos por semana.</div>')+'</section>'
  +'<section class="card"><h2>Progressão de carga</h2>'+lsel+'<div class="chart">'+lc+'</div></section>';
}
const VIEWS={hoje:vHoje,treino:vTreino,corpo:vCorpo,fotos:vFotos,evolucao:vEvolucao};

function vSettings(){
  const st=S.settings;
  return '<div class="overlay" data-act="close-modal"><div class="sheet" role="dialog" aria-modal="true" aria-label="Ajustes">'
  +'<div class="row between"><h2 class="h2">Ajustes</h2><button class="btn ghost sm" data-act="close-modal">Fechar</button></div>'
  +'<div class="grid3"><label class="f">Altura (cm)<input id="s-height" inputmode="decimal" data-set="height" value="'+nf(st.height)+'"></label>'
  +'<label class="f">Peso inicial (kg)<input id="s-start" inputmode="decimal" data-set="startWeight" value="'+nf(st.startWeight)+'"></label>'
  +'<label class="f">Meta (kg)<input id="s-goal" inputmode="decimal" data-set="goalWeight" value="'+nf(st.goalWeight)+'"></label></div>'
  +'<button class="habit'+(st.lowImpact?' on':'')+'" data-act="lowimpact" aria-pressed="'+!!st.lowImpact+'"><span class="ck">'+icon('check')+'</span><span>Modo baixo impacto: troca a passada por leg press unilateral e a corrida por bike</span></button>'
  +'<h3>Backup</h3><p class="muted">Baixe uma cópia dos seus registros ou restaure de um arquivo.</p>'
  +'<div class="row"><button class="btn" data-act="export">Exportar tudo</button><button class="btn ghost" data-act="export-lite">Sem fotos</button><button class="btn ghost" data-act="import">Importar</button></div>'
  +'<input type="file" id="impfile" accept=".json,application/json" hidden>'
  +'</div></div>';
}
function vSetup(){
  return '<div class="overlay mid"><div class="sheet center" role="dialog" aria-modal="true" aria-label="Boas-vindas"><h2 class="h2">Vamos começar</h2>'
  +'<p class="muted">Seus dados ficam só neste aparelho. Informe o básico para calcular seu progresso. Dá para mudar depois nos ajustes.</p>'
  +'<div class="grid3"><label class="f">Altura (cm)<input id="su-height" inputmode="decimal" placeholder="165"></label>'
  +'<label class="f">Peso atual (kg)<input id="su-start" inputmode="decimal" placeholder="80"></label>'
  +'<label class="f">Meta (kg)<input id="su-goal" inputmode="decimal" placeholder="70"></label></div>'
  +'<label class="habit"><input type="checkbox" id="su-low" style="width:auto"><span>Modo baixo impacto: troca a passada por leg press unilateral e a corrida por bike</span></label>'
  +'<button class="btn full" data-act="finish-setup">Começar</button></div></div>';
}
function finishSetup(){
  const h=num($('#su-height').value),s=num($('#su-start').value),g=num($('#su-goal').value);
  if(h==null||h<100||h>230||s==null||s<20||s>400||g==null||g<20||g>400){toast('Confira altura, peso e meta.');return}
  S.settings=Object.assign({},S.settings,{height:h,startWeight:s,goalWeight:g,lowImpact:$('#su-low').checked,setup:true});
  save('settings','main',S.settings);render();
}
function vLightbox(){
  const p=S.photos[S.ui.lightbox];if(!p)return '';
  const ask=S.ui.confirm==='photos'+S.ui.lightbox;
  return '<div class="overlay mid" data-act="close-modal"><div class="sheet center" role="dialog" aria-modal="true" aria-label="Foto de progresso"><img class="big" src="'+p.img+'" alt="Foto de progresso, '+p.pose+'"><div class="row between"><b>'+fdate(p.date,{day:'2-digit',month:'long',year:'numeric'})+' · '+p.pose+'</b></div><div class="row"><button class="btn ghost" data-act="close-modal">Fechar</button><button class="btn warn" data-act="del" data-col="photos" data-id="'+S.ui.lightbox+'">'+(ask?'Toque de novo para apagar':'Apagar foto')+'</button></div></div></div>';
}

function render(keepScroll){
  const main=$('#view'),y=main.scrollTop;
  main.innerHTML=!S.loaded?'<div class="empty">Carregando seus dados…</div>':S.settings.setup?VIEWS[S.tab]():'';
  if(keepScroll)main.scrollTop=y;
  $('#nav').innerHTML=TABS.map(t=>'<button data-act="tab" data-v="'+t[0]+'"'+(S.tab===t[0]?' aria-current="page"':'')+'>'+icon(t[2])+t[1]+'</button>').join('');
  $('#overlay').innerHTML=!S.loaded?'':!S.settings.setup?vSetup():S.ui.lightbox?vLightbox():S.ui.modal==='settings'?vSettings():'';
  paintStatus();
}


/* ---------- ações ---------- */
function sessFor(){const u=S.ui,id=u.date+'_'+u.day;return {id:id,s:S.sessions[id]||{date:u.date,day:u.day,ex:{},min:false}}}
function updEx(exId,fn){
  const o=sessFor(),r=o.s.ex[exId]||{kg:null,done:[],top:false};fn(r);o.s.ex[exId]=r;
  S.sessions[o.id]=o.s;save('sessions',o.id,o.s);render(true);
}
function setKg(exId,v){updEx(exId,r=>{r.kg=v==null?null:Math.max(0,Math.round(v*100)/100)})}
function patchDay(k,v){const t=today(),d=Object.assign({},S.days[t]);d[k]=v;S.days[t]=d;save('days',t,d)}
async function compress(file,max,q){
  const url=URL.createObjectURL(file);
  try{
    const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
    const r=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');
    c.width=Math.round(img.naturalWidth*r);c.height=Math.round(img.naturalHeight*r);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c.toDataURL('image/jpeg',q);
  }finally{URL.revokeObjectURL(url)}
}
async function addPhoto(file){
  try{
    const img=await compress(file,720,.72),id='p'+Date.now(),rec={date:S.ui.pDate||today(),pose:S.ui.addPose,img:img,ts:Date.now()};
    S.photos[id]=rec;await Store.put('photos',id,rec);S.ui.pose=S.ui.addPose;render(true);toast('Foto salva');
  }catch(e){toast('Não consegui ler essa imagem. Tente outra foto.')}
}
function exportData(withPhotos){
  const data={app:'por-o-shape',version:1,exportedAt:new Date().toISOString(),settings:S.settings,days:S.days,sessions:S.sessions,body:S.body,cardio:S.cardio,photos:withPhotos?S.photos:{}};
  return JSON.stringify(data);
}
function doExport(withPhotos){
  const blob=new Blob([exportData(withPhotos)],{type:'application/json'}),url=URL.createObjectURL(blob),l=document.createElement('a');
  l.href=url;l.download='por-o-shape-backup-'+today()+'.json';document.body.appendChild(l);l.click();l.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);toast('Backup baixado');
}
async function doImport(file){
  try{
    const d=JSON.parse(await file.text());if(d.app!=='por-o-shape')throw new Error('x');
    const jobs=[];
    if(d.settings){const st=Object.assign({},d.settings);
    if(st.ankle!==undefined&&st.lowImpact===undefined)st.lowImpact=!!st.ankle; // backups da versão antiga
    delete st.ankle;
    S.settings=Object.assign({},DEFAULTS,st,{setup:true});jobs.push(Store.put('settings','main',S.settings))}
    ['days','sessions','body','photos','cardio'].forEach(c=>Object.keys(d[c]||{}).forEach(id=>{S[c][id]=d[c][id];jobs.push(Store.put(c,id,d[c][id]))}));
    await Promise.all(jobs);render(true);toast('Backup restaurado');
  }catch(e){toast('Esse arquivo não é um backup do app.')}
}

document.addEventListener('click',function(ev){
  const el=ev.target.closest('[data-act]');if(!el){return}
  const a=el.dataset.act,u=S.ui;
  if(a==='close-modal'){if(ev.target!==el&&el.classList.contains('overlay'))return;u.modal=null;u.lightbox=null;u.confirm=null;render(true);return}
  if(a!=='del'&&u.confirm){u.confirm=null}
  switch(a){
    case 'tab':S.tab=el.dataset.v;render();$('#view').scrollTop=0;break;
    case 'settings':u.modal='settings';render(true);break;
    case 'go-treino':u.day=el.dataset.k;u.date=today();S.tab='treino';render();$('#view').scrollTop=0;break;
    case 'habit':{const k=el.dataset.k,v=!(S.days[today()]||{})[k];patchDay(k,v);render(true);break}
    case 'steps-':case 'steps+':{const cur=(S.days[today()]||{}).steps||0,nv=Math.max(0,cur+(a==='steps+'?1000:-1000));patchDay('steps',nv);render(true);break}
    case 'qweight':{const v=num($('#qw').value);if(v==null||v<20||v>400){toast('Digite um peso válido em kg.');break}
      const t=today(),e=Object.assign({},S.body[t],{weight:v});S.body[t]=e;save('body',t,e);toast('Peso salvo');render(true);break}
    case 'day':u.day=el.dataset.k;render(true);break;
    case 'open-session':u.day=el.dataset.k;u.date=el.dataset.d;render();$('#view').scrollTop=0;break;
    case 'set':{const ex=el.dataset.ex,i=+el.dataset.i,e=EXMAP[ex];
      updEx(ex,r=>{const n=e.t==='cardio'?1:e.s;r.done=Array.from({length:n},(_,j)=>!!(r.done&&r.done[j]));r.done[i]=!r.done[i]});break}
    case 'kg+':case 'kg-':{const ex=el.dataset.ex,e=EXMAP[ex],o=sessFor(),cur=o.s.ex[ex]&&o.s.ex[ex].kg!=null?o.s.ex[ex].kg:(lastFor(ex,o.id)||{kg:0}).kg;
      setKg(ex,cur+(a==='kg+'?1:-1)*(e.step||2.5));break}
    case 'usekg':setKg(el.dataset.ex,+el.dataset.v);break;
    case 'top':updEx(el.dataset.ex,r=>{r.top=!r.top});break;
    case 'min':{const o=sessFor();o.s.min=!o.s.min;S.sessions[o.id]=o.s;save('sessions',o.id,o.s);render(true);if(o.s.min)toast('Versão mínima conta como treino. Bom recomeço!');break}
    case 'save-body':{
      const t=u.bodyDate,e=Object.assign({},S.body[t]);let any=false,bad=false;
      const read=(id,k,lo,hi)=>{const raw=$(id).value.trim();if(!raw)return;const v=num(raw);if(v==null||v<lo||v>hi){bad=true;return}e[k]=v;any=true};
      read('#b-weight','weight',20,400);read('#b-fat','fat',3,70);MEAS.forEach(m=>read('#m-'+m.k,m.k,5,300));
      if(bad){toast('Confira os valores: algum número está fora do esperado.');break}
      if(!any){toast('Preencha ao menos um campo.');break}
      S.body[t]=e;save('body',t,e);toast('Registro salvo');render(true);break}
    case 'edit-body':u.bodyDate=el.dataset.d;render();$('#view').scrollTop=0;break;
    case 'del':{
      const col=el.dataset.col,id=el.dataset.id,key=col+id;
      if(u.confirm!==key){u.confirm=key;render(true);break}
      delete S[col][id];Store.del(col,id);u.confirm=null;
      if(col==='photos'){u.lightbox=null;}
      render(true);toast('Apagado');break}
    case 'ctype':u.cType=el.dataset.v;render(true);break;
    case 'cmin+':case 'cmin-':u.cMin=clamp((num(u.cMin)||0)+(a==='cmin+'?5:-5),0,600);render(true);break;
    case 'save-cardio':{
      const min=num($('#c-min').value);if(min==null||min<1||min>600){toast('Informe o tempo em minutos.');break}
      const other=$('#c-other'),tipo=u.cType==='Outro'?((other&&other.value.trim())||'Outro'):u.cType;
      const id='c'+Date.now(),rec={date:u.date,tipo:tipo,min:Math.round(min),ts:Date.now()};
      S.cardio[id]=rec;save('cardio',id,rec);toast('Cardio salvo');render(true);break}
    case 'addpose':u.addPose=el.dataset.v;render(true);break;
    case 'pose':u.pose=el.dataset.v;u.cmpSet=false;render(true);break;
    case 'pick':$('#pfile').click();break;
    case 'lightbox':u.lightbox=el.dataset.id;render(true);break;
    case 'meas':u.meas=el.dataset.v;render(true);break;
    case 'lowimpact':S.settings.lowImpact=!S.settings.lowImpact;save('settings','main',S.settings);render(true);break;
    case 'finish-setup':finishSetup();break;
    case 'export':doExport(true);break;
    case 'export-lite':doExport(false);break;
    case 'import':$('#impfile').click();break;
  }
});
document.addEventListener('change',function(ev){
  const el=ev.target,u=S.ui;
  if(el.id==='pfile'&&el.files&&el.files[0]){addPhoto(el.files[0]);el.value='';return}
  if(el.id==='impfile'&&el.files&&el.files[0]){doImport(el.files[0]);el.value='';return}
  if(el.dataset.set){const v=num(el.value),k=el.dataset.set,lim={height:[100,230],startWeight:[20,400],goalWeight:[20,400]}[k];
    if(v==null||v<lim[0]||v>lim[1]){toast('Valor fora do esperado.');el.value=nf(S.settings[k]);return}
    S.settings[k]=v;save('settings','main',S.settings);return}
  switch(el.dataset.field){
    case 'steps':{const v=num(el.value);patchDay('steps',v==null?null:Math.max(0,Math.round(v)));render(true);break}
    case 'kg':{const v=num(el.value);setKg(el.dataset.ex,v);break}
    case 'cmin':{const v=num(el.value);u.cMin=v==null?20:Math.round(v);break}
    case 'cother':u.cOther=el.value;break;
    case 'tdate':if(el.value){u.date=el.value;render(true)}break;
    case 'bdate':if(el.value){u.bodyDate=el.value;render(true)}break;
    case 'pdate':if(el.value)u.pDate=el.value;break;
    case 'cmpA':u.cmpA=el.value;u.cmpSet=true;render(true);break;
    case 'cmpB':u.cmpB=el.value;u.cmpSet=true;render(true);break;
    case 'exsel':u.exSel=el.value;render(true);break;
  }
});
document.addEventListener('input',function(ev){
  if(ev.target.id==='slider'){const v=ev.target.value,c=$('#cmp');if(!c)return;c.querySelector('.top').style.clipPath='inset(0 '+(100-v)+'% 0 0)';c.querySelector('.hl').style.left=v+'%'}
});


/* ---------- início ---------- */
(async function boot(){
  render();
  const recs=await Store.load();
  recs.forEach(r=>{
    if(r.col==='settings')S.settings=Object.assign({},DEFAULTS,r.data);
    else if(S[r.col]&&r.col!=='ui'&&r.col!=='settings')S[r.col][r.id]=r.data;
  });
  S.loaded=true;render();
  Store.persist();
  if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
