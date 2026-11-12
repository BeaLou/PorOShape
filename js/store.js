// Armazenamento local no navegador (IndexedDB). Nada sai do aparelho.
let dbp;
const open=()=>dbp||(dbp=new Promise((res,rej)=>{
  try{
    const rq=indexedDB.open('por-o-shape',1);
    rq.onupgradeneeded=()=>rq.result.createObjectStore('docs',{keyPath:'k'});
    rq.onsuccess=()=>res(rq.result);
    rq.onerror=()=>rej(rq.error);
  }catch(e){rej(e)}
}));
const tx=(mode,fn)=>open().then(d=>new Promise((res,rej)=>{
  const t=d.transaction('docs',mode);
  const r=fn(t.objectStore('docs'));
  t.oncomplete=()=>res(r&&r.result);
  t.onerror=()=>rej(t.error);
  t.onabort=()=>rej(t.error);
}));

export const Store={
  ok:true,
  async load(){
    try{return (await tx('readonly',s=>s.getAll()))||[]}
    catch(e){this.ok=false;return []}
  },
  async put(col,id,data){
    try{
      await tx('readwrite',s=>s.put({k:col+'__'+id,col:col,id:id,data:JSON.parse(JSON.stringify(data))}));
      this.ok=true;
    }catch(e){this.ok=false;throw e}
  },
  async del(col,id){
    try{await tx('readwrite',s=>s.delete(col+'__'+id))}
    catch(e){this.ok=false;throw e}
  },
  // Pede ao navegador para não apagar os dados quando faltar espaço.
  async persist(){
    try{return navigator.storage&&navigator.storage.persist?await navigator.storage.persist():false}
    catch(e){return false}
  }
};
