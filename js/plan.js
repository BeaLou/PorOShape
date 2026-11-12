// Plano de treino (divisão de 4 dias em máquinas), medidas, hábitos e dicas.
export const DAYS=[
 {k:'A',name:'Pernas e glúteos',color:'--dayA',ex:[
  {id:'a-legpress',n:'Leg press',s:4,r:'10–12',t:'load',step:5},
  {id:'a-hipthrust',n:'Hip thrust',s:4,r:'8–12',t:'load',step:5},
  {id:'a-stiff',n:'Stiff',s:3,r:'10',t:'load',step:2.5},
  {id:'a-extensora',n:'Cadeira extensora',s:3,r:'12',t:'load',step:2.5},
  {id:'a-flexora',n:'Mesa flexora',s:3,r:'12',t:'load',step:2.5},
  {id:'a-panturrilha',n:'Panturrilha',s:3,r:'15',t:'load',step:2.5,note:'Pare se sentir dor na articulação.'}]},
 {k:'B',name:'Costas e ombros',color:'--dayB',ex:[
  {id:'b-puxada',n:'Puxada alta',s:4,r:'8–12',t:'load',step:5},
  {id:'b-remada',n:'Remada baixa',s:3,r:'10',t:'load',step:5},
  {id:'b-desenv',n:'Desenvolvimento',s:3,r:'8–10',t:'load',step:2.5},
  {id:'b-lateral',n:'Elevação lateral',s:3,r:'12–15',t:'load',step:1},
  {id:'b-facepull',n:'Face pull',s:3,r:'15',t:'load',step:2.5}]},
 {k:'C',name:'Pernas e core',color:'--dayC',ex:[
  {id:'c-agacha',n:'Agachamento no Smith ou goblet',s:4,r:'8–10',t:'load',step:2.5,note:'Vá até uma amplitude confortável.'},
  {id:'c-passada',n:'Passada ou afundo',s:3,r:'10 por perna',t:'load',step:2,alt:{id:'c-legpress-uni',n:'Leg press unilateral',note:'Troca a passada por uma opção de menor impacto.'}},
  {id:'c-abdutora',n:'Abdutora',s:3,r:'15',t:'load',step:5},
  {id:'c-prancha',n:'Prancha',s:3,r:'30–45 s',t:'bw'},
  {id:'c-eleva',n:'Elevação de pernas',s:3,r:'12',t:'bw'}]},
 {k:'D',name:'Superior e condicionamento',color:'--dayD',ex:[
  {id:'d-supino',n:'Supino',s:3,r:'8–10',t:'load',step:2.5},
  {id:'d-remada',n:'Remada',s:3,r:'10',t:'load',step:5},
  {id:'d-triceps',n:'Tríceps',s:2,r:'12',t:'load',step:2.5},
  {id:'d-rosca',n:'Rosca',s:2,r:'12',t:'load',step:2},
  {id:'d-intervalado',n:'Intervalado, 15 min',s:1,r:'1 min forte, 1 min leve',t:'cardio',alt:{id:'d-intervalado-bike',n:'Intervalado na bike, 15 min',note:'Na bike em vez de correr, para reduzir o impacto.'}}]}
];
export const EXMAP={};
DAYS.forEach(d=>d.ex.forEach(e=>{EXMAP[e.id]=Object.assign({},e,{day:d.k});if(e.alt)EXMAP[e.alt.id]=Object.assign({},e,e.alt,{day:d.k})}));

export const MEAS=[
 {k:'cintura',n:'Cintura',h:'Parte mais estreita do tronco'},
 {k:'abdomen',n:'Abdômen',h:'Na altura do umbigo'},
 {k:'quadril',n:'Quadril',h:'Parte mais larga'},
 {k:'braco',n:'Braço',h:'Meio do bíceps, relaxado'},
 {k:'coxa',n:'Coxa',h:'Meio da coxa'},
 {k:'torax',n:'Tórax',h:'Na linha dos mamilos'}
];
export const HABITS=[
 {k:'protein',t:'Proteína em todas as refeições'},
 {k:'water',t:'Água em dia'},
 {k:'sleep',t:'Sono de 7 a 8 h na última noite'},
 {k:'meals',t:'Refeições conforme o plano'},
 {k:'move',t:'Caminhada ou bike além do treino'}
];
export const TIPS=[
 'Proteína em todas as refeições ajuda a manter músculo e dá saciedade.',
 'Dormir 7 a 8 horas diminui a fome do dia seguinte e ajuda na recuperação.',
 'Constância vale mais que perfeição. Um plano que você segue por meses vence um perfeito de duas semanas.',
 'O peso oscila de um dia para o outro. Olhe a tendência das semanas, não o número de hoje.',
 'Em dias sem treino, uma caminhada inclinada ou bike de 20 a 30 minutos já conta.',
 'Dia difícil? Faça a versão mínima e recomece amanhã. Sem culpa.',
 'A balança é só uma medida. Cintura, fotos e cargas também contam a história.',
 'Calorias e cardápio ficam com um nutricionista, que conhece seus exames e sua rotina.'
];
export const DEFAULTS={height:null,startWeight:null,goalWeight:null,lowImpact:false,setup:false};
