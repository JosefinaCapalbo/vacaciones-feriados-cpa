import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jqoqczroydpxolrrpppa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxb3FjenJveWRweG9scnJwcHBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MTkzNTIsImV4cCI6MjA5NjM5NTM1Mn0.DFfNGRJ_DDWwLIiwzkaB-0Y7s2XpTiohGH-PNMwzyTY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const DB_KEY = "vacapp7";
const EMAILJS_SERVICE = "service_nddypor";
const EMAILJS_TEMPLATE = "template_pyfoylq";
const EMAILJS_KEY = "mTbhXul9SOOdg7MYq";

const EMPS_DEF = ["Josefina Capalbo","Federico Hechtenkopf","Florencia Merkier","Solange Dabbah","Gonzalo Lottero","Kevin Rafael","Barbara Nietsch","Federico Ferrero"];
const PASS = "admin123";
const MAX_DEF = 10;
const GCAL_CLIENT_ID = "1072225517712-ajq2f5fif713m6qob8jim6pkprrmi75b.apps.googleusercontent.com";
const GCAL_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const COLORS = ["#e8874a","#3a8fd4","#4aad4a","#9b59b6","#d4a017","#c0392b","#16a085","#8e44ad"];
const AVA = ["#f7c5a8","#c5dff8","#d4f0c0","#e8d5f5","#fde8b4","#fadadd","#c8e6f5","#f5d4c8"];
const BG="#fdf6f0",CARD="#fff",BDR="#ead9ce",TXT="#5a4a42",MUT="#9e8a80",PRI="#f0a07a";
const inp={width:"100%",boxSizing:"border-box",padding:"10px",border:"1px solid "+BDR,borderRadius:10,fontSize:16,color:TXT,background:BG,outline:"none",marginBottom:4};

function toISO(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function fmt(s){if(!s)return"";const[y,m,d]=s.split("-");return d+"/"+m+"/"+y;}
function ini2(n){return n.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase();}
function diasHab(a,b){if(!a||!b)return 0;let n=0,d=new Date(a+"T12:00:00"),e=new Date(b+"T12:00:00");while(d<=e){const w=d.getDay();if(w>0&&w<6)n++;d.setDate(d.getDate()+1);}return n;}
function splitAnio(a,b){const segs=[];let cur=new Date(a+"T12:00:00");const end=new Date(b+"T12:00:00");while(cur<=end){const y=cur.getFullYear(),yEnd=new Date(y,11,31,12,0,0),segEnd=yEnd<end?yEnd:end;const d=diasHab(toISO(cur),toISO(segEnd));if(d>0)segs.push({anio:y,ini:toISO(cur),fin:toISO(segEnd),dias:d});cur=new Date(segEnd);cur.setDate(cur.getDate()+1);}return segs;}
function usados(regs,tipo,anio){return(regs||[]).filter(r=>r.tipo===tipo&&r.anio===anio).reduce((a,r)=>a+r.dias,0);}
function getMax(cfg,nom,tipo){const c=(cfg[nom]||{});return tipo==="vacaciones"?(c.mv!=null?c.mv:MAX_DEF):(c.mf!=null?c.mf:MAX_DEF);}
function grupos(datos,empN){const g={};(datos[empN]||[]).forEach(r=>{const k=r.grupoId||r.id;if(!g[k])g[k]={id:r.id,gid:k,tipo:r.tipo,segs:[],total:0};g[k].segs.push(r);g[k].total+=r.dias;});return Object.values(g).sort((a,b)=>{const fa=a.segs[0].ini,fb=b.segs[0].ini;return fb>fa?1:fb<fa?-1:0;});}

async function dbLoad(){try{const{data,error}=await supabase.from("vacaciones_app").select("data").eq("id",DB_KEY).single();if(error||!data)return null;return JSON.parse(data.data);}catch{return null;}}
async function dbSave(state){try{await supabase.from("vacaciones_app").upsert({id:DB_KEY,data:JSON.stringify(state),updated_at:new Date().toISOString()});}catch(e){console.error("Error:",e);}}

async function sendAdminEmail(empName, tipo, fechaIni, fechaFin, dias, comentario){
  try{
    await fetch("https://api.emailjs.com/api/v1.0/email/send",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        service_id:EMAILJS_SERVICE,
        template_id:EMAILJS_TEMPLATE,
        user_id:EMAILJS_KEY,
        template_params:{
          nombre:empName,
          tipo:tipo==="vacaciones"?"🌴 Vacaciones":"🎉 Feriado",
          fecha_ini:fechaIni.split("-").reverse().join("/"),
          fecha_fin:fechaFin?fechaFin.split("-").reverse().join("/"):fechaIni.split("-").reverse().join("/"),
          dias:dias===0.5?"½ día":dias+" día(s)",
          comentario:comentario||"(sin comentario)"
        }
      })
    });
  }catch(e){console.error("EmailJS error:",e);}
}

function Btn({onClick,bg2,tc,disabled,children,small}){return <button onClick={onClick} disabled={disabled} style={{display:"block",width:"100%",marginTop:small?6:10,padding:small?"8px":"12px",background:bg2||PRI,color:tc||"#fff",border:"none",borderRadius:12,fontWeight:600,fontSize:small?13:16,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1}}>{children}</button>;}
function Card({title,children,style}){return <div style={{background:CARD,borderRadius:14,border:"1px solid "+BDR,padding:"14px",marginBottom:12,...style}}>{title&&<div style={{fontWeight:600,fontSize:15,color:TXT,marginBottom:12}}>{title}</div>}{children}</div>;}
function Saldo({label,uso,max,emoji,color,tc}){const disponible=max-uso;const negativo=disponible<0;const pct=negativo?100:Math.min((uso/max)*100,100);const bgColor=negativo?"#fadadd":color;const textColor=negativo?"#b94a4a":tc;return <div style={{background:bgColor,borderRadius:14,padding:"14px"}}><div style={{fontSize:13,color:textColor,fontWeight:600}}>{emoji} {label}</div><div style={{fontSize:28,fontWeight:700,color:textColor}}>{disponible}</div><div style={{fontSize:12,color:textColor,opacity:0.8,marginBottom:8}}>{negativo?"días excedidos":"días disponibles"}</div><div style={{background:"rgba(255,255,255,0.4)",borderRadius:6,height:6}}><div style={{background:textColor,opacity:0.5,borderRadius:6,height:6,width:pct+"%"}}/></div><div style={{fontSize:11,color:textColor,opacity:0.7,marginTop:4}}>{uso}/{max} usados</div></div>;}
function useGCal(){
  const [token,setToken]=useState(null);
  const [status,setStatus]=useState("idle");
  function conectar(){setStatus("loading");if(!window.google?.accounts?.oauth2){const s=document.createElement("script");s.src="https://accounts.google.com/gsi/client";s.onload=()=>iniciar();s.onerror=()=>setStatus("error");document.head.appendChild(s);}else{iniciar();}}
  function iniciar(){try{const client=window.google.accounts.oauth2.initTokenClient({client_id:GCAL_CLIENT_ID,scope:GCAL_SCOPE,callback:(resp)=>{if(resp.error){setStatus("error");return;}setToken(resp.access_token);setStatus("ok");}});client.requestAccessToken();}catch(e){setStatus("error");}}
  async function crearEvento(titulo,iniISO,finISO){if(!token)return false;const finD=new Date(finISO+"T12:00:00");finD.setDate(finD.getDate()+1);try{const r=await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({summary:titulo,start:{date:iniISO},end:{date:toISO(finD)}})});return r.ok;}catch{return false;}}
  return {token,status,conectar,crearEvento};
}

function CalendarioPublico({emps,datos}){
  const hoy=new Date();
  const [anio,setAnio]=useState(hoy.getFullYear());
  const [mes,setMes]=useState(hoy.getMonth());
  const [tipDia,setTipDia]=useState(null);
  function prev(){if(mes===0){setMes(11);setAnio(a=>a-1);}else setMes(m=>m-1);}
  function next(){if(mes===11){setMes(0);setAnio(a=>a+1);}else setMes(m=>m+1);}
  const mapa={};
  emps.forEach((emp,i)=>{(datos[emp]||[]).filter(r=>r.anio===anio).forEach(r=>{let d=new Date(r.ini+"T12:00:00"),e=new Date(r.fin+"T12:00:00");while(d<=e){if(d.getMonth()===mes&&d.getFullYear()===anio){const k=toISO(d);if(!mapa[k])mapa[k]=[];mapa[k].push({emp,tipo:r.tipo});}d.setDate(d.getDate()+1);}});});
  const p=new Date(anio,mes,1).getDay(),ult=new Date(anio,mes+1,0).getDate();
  const celdas=[...Array(p).fill(null),...Array.from({length:ult},(_,i)=>i+1)];
  while(celdas.length%7)celdas.push(null);
  const conDias=emps.filter(e=>Object.values(mapa).some(evs=>evs.some(ev=>ev.emp===e)));
  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
      <button onClick={prev} style={{background:CARD,border:"1px solid "+BDR,borderRadius:10,padding:"10px 18px",cursor:"pointer",fontSize:20,color:TXT}}>◄</button>
      <div style={{textAlign:"center"}}><div style={{fontWeight:700,fontSize:22,color:TXT}}>{MESES[mes]}</div><div style={{fontSize:14,color:MUT}}>{anio}</div></div>
      <button onClick={next} style={{background:CARD,border:"1px solid "+BDR,borderRadius:10,padding:"10px 18px",cursor:"pointer",fontSize:20,color:TXT}}>►</button>
    </div>
    {conDias.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>{conDias.map(e=>{const i=emps.indexOf(e);return <div key={e} style={{display:"flex",alignItems:"center",gap:5,background:CARD,borderRadius:8,padding:"4px 10px",border:"1px solid "+BDR,fontSize:13}}><div style={{width:10,height:10,borderRadius:"50%",background:COLORS[i%COLORS.length]}}/><span style={{color:TXT}}>{e.split(" ")[0]}</span></div>;})}</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>{["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map(d=><div key={d} style={{textAlign:"center",fontSize:12,color:MUT,fontWeight:600,padding:"4px 0"}}>{d}</div>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
      {celdas.map((d,i)=>{if(!d)return <div key={i}/>;const iso=anio+"-"+String(mes+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");const evs=mapa[iso]||[];const esHoy=iso===toISO(hoy);const dow=new Date(iso+"T12:00:00").getDay();const bg=evs.length===1?COLORS[emps.indexOf(evs[0].emp)%COLORS.length]+"33":"transparent";return <div key={i} onClick={()=>evs.length&&setTipDia(tipDia===iso?null:iso)} style={{borderRadius:10,padding:"6px 2px",textAlign:"center",background:bg,border:esHoy?"2px solid "+PRI:"2px solid transparent",cursor:evs.length?"pointer":"default",minHeight:48}}><div style={{fontSize:16,fontWeight:esHoy?700:400,color:(dow===0||dow===6)?MUT:TXT}}>{d}</div>{evs.length>0&&<div style={{display:"flex",justifyContent:"center",gap:2,marginTop:3}}>{evs.slice(0,3).map((ev,j)=><div key={j} style={{width:7,height:7,borderRadius:"50%",background:COLORS[emps.indexOf(ev.emp)%COLORS.length]}}/>)}</div>}</div>;})}
    </div>
    {tipDia&&<div style={{marginTop:12,background:CARD,borderRadius:12,border:"1px solid "+BDR,padding:"12px"}} onClick={()=>setTipDia(null)}><div style={{fontWeight:600,fontSize:14,color:TXT,marginBottom:8}}>{fmt(tipDia)}</div>{(mapa[tipDia]||[]).map((ev,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,fontSize:14,color:TXT}}><div style={{width:10,height:10,borderRadius:"50%",background:COLORS[emps.indexOf(ev.emp)%COLORS.length],flexShrink:0}}/><span>{ev.emp}</span><span style={{marginLeft:"auto",fontSize:12,color:ev.tipo==="vacaciones"?"#2a6496":"#2d6a1f",fontWeight:600}}>{ev.tipo==="vacaciones"?"🌴 Vac.":"🎉 Fer."}</span></div>)}</div>}
    {conDias.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:MUT,fontSize:15}}>Sin días cargados en {MESES[mes]} {anio}</div>}
  </div>;
}
export default function App(){
  const [emps,setEmps]=useState(EMPS_DEF);
  const [cfg,setCfg]=useState({});
  const [datos,setDatos]=useState({});
  const [ready,setReady]=useState(false);
  const [vista,setVista]=useState("login");
  const [loginTab,setLoginTab]=useState("emp");
  const [empSel,setEmpSel]=useState("");
  const [pass,setPass]=useState("");
  const [passErr,setPassErr]=useState(false);
  const [adminTab,setAdminTab]=useState("resumen");
  const [adminEmp,setAdminEmp]=useState("");
  const [form,setForm]=useState({tipo:"vacaciones",ini:"",fin:"",medioDia:false,comentario:""});
  const [editGid,setEditGid]=useState(null);
  const [msgOk,setMsgOk]=useState("");
  const [msgErr,setMsgErr]=useState("");
  const [nuevoNom,setNuevoNom]=useState("");
  const [nuevoErr,setNuevoErr]=useState("");
  const [filtroAnio,setFiltroAnio]=useState(new Date().getFullYear());
  const [adminForm,setAdminForm]=useState({tipo:"vacaciones",ini:"",fin:"",medioDia:false,comentario:""});
  const [adminEditGid,setAdminEditGid]=useState(null);
  const [adminMsgOk,setAdminMsgOk]=useState("");
  const [adminMsgErr,setAdminMsgErr]=useState("");
  const ANIO=new Date().getFullYear();
  const gcal=useGCal();

  useEffect(()=>{dbLoad().then(s=>{if(s){if(s.emps)setEmps(s.emps);if(s.cfg)setCfg(s.cfg);if(s.datos)setDatos(s.datos);}setReady(true);});},[]);

  function save(e2,c2,d2){const e=e2||emps,c=c2!=null?c2:cfg,d=d2!=null?d2:datos;setEmps(e);setCfg(c);setDatos(d);dbSave({emps:e,cfg:c,datos:d});}
  function reset(){setForm({tipo:"vacaciones",ini:"",fin:"",medioDia:false,comentario:""});setEditGid(null);setMsgOk("");setMsgErr("");}
  function resetAdmin(){setAdminForm({tipo:"vacaciones",ini:"",fin:"",medioDia:false,comentario:""});setAdminEditGid(null);setAdminMsgOk("");setAdminMsgErr("");}

  // Empleado: solo puede agregar nuevo o editar comentario de uno existente
  async function cargar(){
    setMsgOk("");setMsgErr("");
    const{tipo,ini:a,fin:b}=form;
    if(editGid){
      // solo guarda comentario, mantiene todo lo demás igual
      const nuevosRegs=(datos[empSel]||[]).map(r=>((r.grupoId||r.id)===editGid?{...r,comentario:form.comentario||""}:r));
      save(null,null,{...datos,[empSel]:nuevosRegs});
      setMsgOk("✓ Comentario actualizado.");
      reset();
      return;
    }
    if(!a)return setMsgErr("Ingresá fecha de inicio.");
    if(tipo==="vacaciones"&&!b)return setMsgErr("Ingresá fecha de fin.");
    const finR=b||a;
    if(b&&b<a)return setMsgErr("Fin no puede ser anterior al inicio.");
    const segs=splitAnio(a,finR);
    if(!segs.length)return setMsgErr("Sin días hábiles en el rango.");
    const gid=Date.now();
    const diasFinal=(tipo==="feriados"&&form.medioDia)?0.5:undefined;
    const nuevos=segs.map((seg,i)=>({id:gid+i,grupoId:gid,tipo,ini:seg.ini,fin:seg.fin,dias:diasFinal||seg.dias,anio:seg.anio,comentario:form.comentario||""}));
    save(null,null,{...datos,[empSel]:[...(datos[empSel]||[]),...nuevos]});
    const total=segs.reduce((a,s)=>a+s.dias,0),cruzaMsg=segs.length>1?" (cruza año)":"";
    sendAdminEmail(empSel,tipo,a,finR,diasFinal||total,form.comentario);
    if(gcal.token){const titulo=(tipo==="vacaciones"?"🌴 Vacaciones - ":"🎉 Feriado - ")+empSel;const ok=await gcal.crearEvento(titulo,a,finR);setMsgOk("✓ "+total+"d registrado(s)"+cruzaMsg+(ok?" y sincronizado con Google Calendar 🗓️":" (error al crear evento en Calendar)"));}
    else{setMsgOk("✓ "+total+"d registrado(s)"+cruzaMsg);}
    reset();
  }

  // Admin: puede cargar, editar todo y eliminar
  async function adminCargar(){
    setAdminMsgOk("");setAdminMsgErr("");
    const{tipo,ini:a,fin:b}=adminForm;
    if(!a)return setAdminMsgErr("Ingresá fecha de inicio.");
    if(tipo==="vacaciones"&&!b)return setAdminMsgErr("Ingresá fecha de fin.");
    const finR=b||a;
    if(b&&b<a)return setAdminMsgErr("Fin no puede ser anterior al inicio.");
    const segs=splitAnio(a,finR);
    if(!segs.length)return setAdminMsgErr("Sin días hábiles en el rango.");
    const gid=adminEditGid||Date.now();
    const diasFinal=(tipo==="feriados"&&adminForm.medioDia)?0.5:undefined;
    const nuevos=segs.map((seg,i)=>({id:gid+i,grupoId:gid,tipo,ini:seg.ini,fin:seg.fin,dias:diasFinal||seg.dias,anio:seg.anio,comentario:adminForm.comentario||""}));
    let regs=(datos[adminEmp]||[]);
    if(adminEditGid)regs=regs.filter(r=>(r.grupoId||r.id)!==adminEditGid);
    save(null,null,{...datos,[adminEmp]:[...regs,...nuevos]});
    const total=segs.reduce((a,s)=>a+s.dias,0),cruzaMsg=segs.length>1?" (cruza año)":"";
    setAdminMsgOk("✓ "+total+"d registrado(s)"+cruzaMsg);
    resetAdmin();
  }

  function eliminar(empN,gid){save(null,null,{...datos,[empN]:(datos[empN]||[]).filter(r=>(r.grupoId||r.id)!==gid)});}

  if(!ready)return <div style={{padding:40,textAlign:"center",color:MUT,fontFamily:"'Segoe UI',sans-serif"}}>Conectando con Supabase...</div>;
  const visibles=emps.filter(e=>!(cfg[e]||{}).oculto);
  const page={fontFamily:"'Segoe UI',sans-serif",background:BG,minHeight:"100vh",padding:"1rem"};

  if(vista==="login")return(<div style={page}><div style={{maxWidth:460,margin:"0 auto"}}>
    <div style={{background:"#f9e4d4",borderRadius:18,padding:"1.2rem",marginBottom:14,textAlign:"center"}}><div style={{fontSize:36}}>🌴</div><h1 style={{margin:"6px 0 0",fontSize:20,fontWeight:600,color:TXT}}>Vacaciones & Feriados</h1></div>
    <div style={{display:"flex",gap:6,marginBottom:14}}>{[["emp","👤 Ingresar"],["cal","📅 Calendario"]].map(([t,l])=><button key={t} onClick={()=>setLoginTab(t)} style={{flex:1,background:loginTab===t?"#f7c5a8":CARD,border:"1px solid "+BDR,borderRadius:10,padding:"10px",cursor:"pointer",fontWeight:loginTab===t?600:400,color:TXT,fontSize:15}}>{l}</button>)}</div>
    {loginTab==="emp"&&<><Card title="Acceso empleado"><label style={{fontSize:14,color:MUT,display:"block",marginBottom:6}}>Tu nombre</label><select value={empSel} onChange={e=>setEmpSel(e.target.value)} style={inp}><option value="">-- Elegir --</option>{[...visibles].sort((a,b)=>a.localeCompare(b,"es")).map(e=><option key={e}>{e}</option>)}</select><Btn onClick={()=>{if(empSel){setVista("emp");reset();}}} disabled={!empSel}>Ingresar</Btn></Card>
    <Card title="Acceso administrador"><label style={{fontSize:14,color:MUT,display:"block",marginBottom:6}}>Contraseña</label><input type="password" value={pass} placeholder="Contraseña" onChange={e=>{setPass(e.target.value);setPassErr(false);}} onKeyDown={e=>{if(e.key==="Enter"){if(pass===PASS){setVista("admin");setAdminEmp(emps[0]||"");}else setPassErr(true);}}} style={inp}/>{passErr&&<p style={{color:"#b94a4a",fontSize:13,margin:"4px 0"}}>Contraseña incorrecta.</p>}<Btn bg2="#c5b4e3" tc={TXT} onClick={()=>{if(pass===PASS){setVista("admin");setAdminEmp(emps[0]||"");}else setPassErr(true);}}>Ingresar como admin</Btn></Card></>}
    {loginTab==="cal"&&<Card><CalendarioPublico emps={emps} datos={datos}/></Card>}
  </div></div>);

  if(vista==="emp"){
    const regs=datos[empSel]||[],uV=usados(regs,"vacaciones",ANIO),uF=usados(regs,"feriados",ANIO);
    const mV=getMax(cfg,empSel,"vacaciones"),mF=getMax(cfg,empSel,"feriados");
    const prev=form.ini?splitAnio(form.ini,form.fin||form.ini).reduce((a,s)=>a+s.dias,0):0;
    const gs=grupos(datos,empSel),aniosDisp=[...new Set(regs.map(r=>r.anio))].sort((a,b)=>b-a);
    return <div style={page}><div style={{maxWidth:500,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><div style={{width:42,height:42,borderRadius:"50%",background:AVA[emps.indexOf(empSel)%AVA.length],display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15,color:TXT}}>{ini2(empSel)}</div><div><div style={{fontWeight:600,fontSize:16,color:TXT}}>{empSel}</div><div style={{fontSize:12,color:MUT}}>Panel de empleado</div></div><button onClick={()=>{setVista("login");reset();}} style={{marginLeft:"auto",background:"none",border:"1px solid "+BDR,borderRadius:8,padding:"6px 12px",color:MUT,cursor:"pointer",fontSize:13}}>Salir</button></div>
      <div style={{background:gcal.status==="ok"?"#d4f0c0":CARD,border:"1px solid "+BDR,borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>🗓️</span><div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:TXT}}>Google Calendar</div><div style={{fontSize:12,color:MUT}}>{gcal.status==="ok"?"Conectado — los días se sincronizan automáticamente":gcal.status==="loading"?"Conectando...":gcal.status==="error"?"Error al conectar. Intentá de nuevo.":"Conectá para sincronizar tus días automáticamente"}</div></div>{gcal.status!=="ok"&&<button onClick={gcal.conectar} disabled={gcal.status==="loading"} style={{background:"#4285f4",color:"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",opacity:gcal.status==="loading"?0.6:1}}>{gcal.status==="loading"?"...":"Conectar"}</button>}{gcal.status==="ok"&&<span style={{color:"#2d6a1f",fontWeight:700,fontSize:16}}>✓</span>}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}><Saldo label="Vacaciones" uso={uV} max={mV} emoji="🌴" color="#c5dff8" tc="#2a6496"/><Saldo label="Feriados" uso={uF} max={mF} emoji="🎉" color="#d4f0c0" tc="#2d6a1f"/></div>
      <Card title={editGid?"✏️ Editar comentario":"Cargar días"}>
        {editGid&&<div style={{fontSize:13,color:MUT,background:"#fde8b4",borderRadius:8,padding:"6px 10px",marginBottom:10}}>Solo podés editar el comentario. Para cambiar fechas contactá al administrador. <button onClick={reset} style={{background:"none",border:"none",color:"#b94a4a",cursor:"pointer",fontWeight:600}}>Cancelar</button></div>}
        {!editGid&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><label style={{fontSize:13,color:MUT,display:"block",marginBottom:4}}>Tipo</label><select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value,fin:""})} style={inp}><option value="vacaciones">🌴 Vacaciones</option><option value="feriados">🎉 Feriado</option></select></div><div/><div><label style={{fontSize:13,color:MUT,display:"block",marginBottom:4}}>Fecha inicio</label><input type="date" value={form.ini} onChange={e=>setForm({...form,ini:e.target.value})} style={inp}/></div><div><label style={{fontSize:13,color:MUT,display:"block",marginBottom:4}}>Fecha fin {form.tipo==="feriados"&&<span style={{fontWeight:400}}>(opcional)</span>}</label><input type="date" value={form.fin} min={form.ini} onChange={e=>setForm({...form,fin:e.target.value})} style={inp}/></div></div>}
        {!editGid&&form.tipo==="feriados"&&<div style={{display:"flex",alignItems:"center",gap:8,margin:"6px 0",padding:"8px 10px",background:"#fde8b4",borderRadius:8}}><input type="checkbox" id="medioDia" checked={form.medioDia} onChange={e=>setForm({...form,medioDia:e.target.checked})} style={{width:16,height:16,cursor:"pointer"}}/><label htmlFor="medioDia" style={{fontSize:13,color:TXT,cursor:"pointer",fontWeight:500}}>½ Día (0.5 días hábiles)</label></div>}
        <div><label style={{fontSize:13,color:MUT,display:"block",marginBottom:4}}>Comentario <span style={{fontWeight:400}}>(opcional)</span></label><input type="text" value={form.comentario} placeholder="Ej: viaje, reunión, etc." onChange={e=>setForm({...form,comentario:e.target.value})} style={{...inp,marginBottom:0}}/></div>
        {!editGid&&prev>0&&<div style={{fontSize:13,color:MUT,background:"#fde8b4",borderRadius:8,padding:"6px 10px",margin:"6px 0"}}>📅 Días hábiles: <b style={{color:TXT}}>{prev}</b>{form.ini&&form.fin&&form.fin.slice(0,4)!==form.ini.slice(0,4)&&<span style={{color:PRI,marginLeft:8,fontWeight:600}}>⚠️ Cruza año</span>}</div>}
        {msgErr&&<p style={{color:"#b94a4a",fontSize:13,background:"#fadadd",borderRadius:8,padding:"8px 10px",margin:"6px 0"}}>{msgErr}</p>}
        {msgOk&&<p style={{color:"#2d6a1f",fontSize:13,background:"#d4f0c0",borderRadius:8,padding:"8px 10px",margin:"6px 0"}}>{msgOk}</p>}
        <Btn onClick={cargar}>{editGid?"Guardar comentario":"Registrar días"}</Btn>
      </Card>
      {gs.length>0&&<Card title="Mi historial">
        {aniosDisp.length>1&&<div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>{aniosDisp.map(a=><button key={a} onClick={()=>setFiltroAnio(a)} style={{background:filtroAnio===a?"#f7c5a8":BG,border:"1px solid "+BDR,borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:13,fontWeight:filtroAnio===a?600:400,color:TXT}}>{a}</button>)}</div>}
        {gs.filter(g=>g.segs.some(s=>s.anio===filtroAnio)).length===0?<p style={{color:MUT,fontSize:13}}>Sin registros en {filtroAnio}.</p>:gs.filter(g=>g.segs.some(s=>s.anio===filtroAnio)).map(g=>{const s0=g.segs[0],sN=g.segs[g.segs.length-1];return <div key={g.gid} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",borderBottom:"1px solid "+BDR}}><span style={{background:g.tipo==="vacaciones"?"#c5dff8":"#d4f0c0",color:g.tipo==="vacaciones"?"#2a6496":"#2d6a1f",borderRadius:8,padding:"3px 8px",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{g.tipo==="vacaciones"?"🌴 Vac.":"🎉 Fer."}</span><span style={{fontSize:13,color:TXT,flex:1}}>{fmt(s0.ini)}{s0.ini!==sN.fin?" → "+fmt(sN.fin):""}{g.segs.length>1&&<span style={{fontSize:10,color:PRI,marginLeft:4}}>↩ cruza año</span>}</span><span style={{fontSize:13,color:MUT}}>{g.segs[0].dias===0.5?"½d":g.total+"d"}</span>{g.segs[0].comentario&&<span style={{fontSize:11,color:MUT,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:80}}>{g.segs[0].comentario}</span>}<button onClick={()=>{setEditGid(g.gid);setForm({tipo:g.tipo,ini:s0.ini,fin:sN.fin,medioDia:g.segs[0].dias===0.5,comentario:g.segs[0].comentario||""});setMsgOk("");setMsgErr("");}} title="Editar comentario" style={{background:"none",border:"none",color:"#6a9fd8",cursor:"pointer",fontSize:18}}>✏️</button></div>;})}
      </Card>}
    </div></div>;
  }

  const aRegs=datos[adminEmp]||[],aGs=grupos(datos,adminEmp),aAnios=[...new Set(aRegs.map(r=>r.anio))].sort((a,b)=>b-a);
  return <div style={page}><div style={{maxWidth:680,margin:"0 auto"}}>
    <div style={{display:"flex",alignItems:"center",marginBottom:14}}><span style={{fontSize:18,fontWeight:600,color:TXT}}>🗂️ Administración</span><button onClick={()=>setVista("login")} style={{marginLeft:"auto",background:"none",border:"1px solid "+BDR,borderRadius:8,padding:"6px 12px",color:MUT,cursor:"pointer",fontSize:13}}>Salir</button></div>
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>{[[" resumen","📊 Resumen"],["detalle","🔍 Detalle"],["gestion","⚙️ Gestión"]].map(([t,l])=><button key={t} onClick={()=>setAdminTab(t.trim())} style={{background:adminTab===t.trim()?"#f7c5a8":CARD,border:"1px solid "+BDR,borderRadius:10,padding:"8px 14px",cursor:"pointer",fontWeight:adminTab===t.trim()?600:400,color:TXT,fontSize:14}}>{l}</button>)}</div>
    {adminTab==="resumen"&&<div style={{display:"grid",gap:8}}>{[...emps].sort((a,b)=>a.localeCompare(b,"es")).map((e,i)=>{const r=datos[e]||[],uV=usados(r,"vacaciones",ANIO),uF=usados(r,"feriados",ANIO),mV=getMax(cfg,e,"vacaciones"),mF=getMax(cfg,e,"feriados"),oc=(cfg[e]||{}).oculto;return <div key={e} style={{background:CARD,borderRadius:12,border:"1px solid "+BDR,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,opacity:oc?0.5:1}}><div style={{width:36,height:36,borderRadius:"50%",background:AVA[i%AVA.length],display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:TXT,flexShrink:0}}>{ini2(e)}</div><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,color:TXT,fontSize:14}}>{e}{oc&&<span style={{fontSize:10,marginLeft:4,color:MUT}}>(oculto)</span>}</div><div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap"}}><span style={{background:"#c5dff8",color:"#2a6496",borderRadius:8,padding:"2px 8px",fontSize:12}}>🌴 {uV}/{mV}</span><span style={{background:"#d4f0c0",color:"#2d6a1f",borderRadius:8,padding:"2px 8px",fontSize:12}}>🎉 {uF}/{mF}</span></div></div><div style={{textAlign:"right",fontSize:12,color:MUT,flexShrink:0}}><div>Vac.: <b style={{color:TXT}}>{mV-uV}</b></div><div>Fer.: <b style={{color:TXT}}>{mF-uF}</b></div></div></div>;})}</div>}
    {adminTab==="detalle"&&<div>
      <select value={adminEmp} onChange={e=>{setAdminEmp(e.target.value);resetAdmin();}} style={{...inp,marginBottom:12}}>{[...emps].sort((a,b)=>a.localeCompare(b,"es")).map(e=><option key={e}>{e}</option>)}</select>
      {adminEmp&&<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <Saldo label="Vacaciones" uso={usados(aRegs,"vacaciones",ANIO)} max={getMax(cfg,adminEmp,"vacaciones")} emoji="🌴" color="#c5dff8" tc="#2a6496"/>
          <Saldo label="Feriados" uso={usados(aRegs,"feriados",ANIO)} max={getMax(cfg,adminEmp,"feriados")} emoji="🎉" color="#d4f0c0" tc="#2d6a1f"/>
        </div>
        <Card title={adminEditGid?"✏️ Editar registro":"➕ Cargar días"}>
          {adminEditGid&&<div style={{fontSize:13,color:MUT,background:"#fde8b4",borderRadius:8,padding:"6px 10px",marginBottom:10}}>Editando registro. <button onClick={resetAdmin} style={{background:"none",border:"none",color:"#b94a4a",cursor:"pointer",fontWeight:600}}>Cancelar</button></div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><label style={{fontSize:13,color:MUT,display:"block",marginBottom:4}}>Tipo</label><select value={adminForm.tipo} onChange={e=>setAdminForm({...adminForm,tipo:e.target.value,fin:""})} style={inp}><option value="vacaciones">🌴 Vacaciones</option><option value="feriados">🎉 Feriado</option></select></div>
            <div/>
            <div><label style={{fontSize:13,color:MUT,display:"block",marginBottom:4}}>Fecha inicio</label><input type="date" value={adminForm.ini} onChange={e=>setAdminForm({...adminForm,ini:e.target.value})} style={inp}/></div>
            <div><label style={{fontSize:13,color:MUT,display:"block",marginBottom:4}}>Fecha fin {adminForm.tipo==="feriados"&&<span style={{fontWeight:400}}>(opcional)</span>}</label><input type="date" value={adminForm.fin} min={adminForm.ini} onChange={e=>setAdminForm({...adminForm,fin:e.target.value})} style={inp}/></div>
          </div>
          {adminForm.tipo==="feriados"&&<div style={{display:"flex",alignItems:"center",gap:8,margin:"6px 0",padding:"8px 10px",background:"#fde8b4",borderRadius:8}}><input type="checkbox" id="adminMedioDia" checked={adminForm.medioDia} onChange={e=>setAdminForm({...adminForm,medioDia:e.target.checked})} style={{width:16,height:16,cursor:"pointer"}}/><label htmlFor="adminMedioDia" style={{fontSize:13,color:TXT,cursor:"pointer",fontWeight:500}}>½ Día (0.5 días hábiles)</label></div>}
          <div><label style={{fontSize:13,color:MUT,display:"block",marginBottom:4}}>Comentario <span style={{fontWeight:400}}>(opcional)</span></label><input type="text" value={adminForm.comentario} placeholder="Ej: viaje, reunión, etc." onChange={e=>setAdminForm({...adminForm,comentario:e.target.value})} style={{...inp,marginBottom:0}}/></div>
          {adminMsgErr&&<p style={{color:"#b94a4a",fontSize:13,background:"#fadadd",borderRadius:8,padding:"8px 10px",margin:"6px 0"}}>{adminMsgErr}</p>}
          {adminMsgOk&&<p style={{color:"#2d6a1f",fontSize:13,background:"#d4f0c0",borderRadius:8,padding:"8px 10px",margin:"6px 0"}}>{adminMsgOk}</p>}
          <Btn onClick={adminCargar}>{adminEditGid?"Guardar cambios":"Registrar días"}</Btn>
        </Card>
        {aGs.length>0&&<Card title="Registros">
          {aAnios.length>1&&<div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>{aAnios.map(a=><button key={a} onClick={()=>setFiltroAnio(a)} style={{background:filtroAnio===a?"#f7c5a8":BG,border:"1px solid "+BDR,borderRadius:8,padding:"4px 12px",cursor:"pointer",fontSize:13,fontWeight:filtroAnio===a?600:400,color:TXT}}>{a}</button>)}</div>}
          {aGs.filter(g=>g.segs.some(s=>s.anio===filtroAnio)).length===0?<p style={{color:MUT,fontSize:13}}>Sin registros en {filtroAnio}.</p>:aGs.filter(g=>g.segs.some(s=>s.anio===filtroAnio)).map(g=>{const s0=g.segs[0],sN=g.segs[g.segs.length-1];return <div key={g.gid} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 0",borderBottom:"1px solid "+BDR}}>
            <span style={{background:g.tipo==="vacaciones"?"#c5dff8":"#d4f0c0",color:g.tipo==="vacaciones"?"#2a6496":"#2d6a1f",borderRadius:8,padding:"3px 8px",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>{g.tipo==="vacaciones"?"🌴 Vac.":"🎉 Fer."}</span>
            <span style={{fontSize:13,color:TXT,flex:1}}>{fmt(s0.ini)}{s0.ini!==sN.fin?" → "+fmt(sN.fin):""}{g.segs.length>1&&<span style={{fontSize:10,color:PRI,marginLeft:4}}>↩ cruza año</span>}</span>
            <span style={{fontSize:13,color:MUT}}>{g.segs[0].dias===0.5?"½d":g.total+"d"}</span>
            {g.segs[0].comentario&&<span style={{fontSize:11,color:MUT,fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:80}}>{g.segs[0].comentario}</span>}
            <button onClick={()=>{setAdminEditGid(g.gid);setAdminForm({tipo:g.tipo,ini:s0.ini,fin:sN.fin,medioDia:g.segs[0].dias===0.5,comentario:g.segs[0].comentario||""});setAdminMsgOk("");setAdminMsgErr("");}} title="Editar" style={{background:"none",border:"none",color:"#6a9fd8",cursor:"pointer",fontSize:18}}>✏️</button>
            <button onClick={()=>{if(window.confirm("¿Eliminás este registro de "+adminEmp+"?")){eliminar(adminEmp,g.gid);resetAdmin();}}} title="Eliminar" style={{background:"none",border:"none",color:"#b94a4a",cursor:"pointer",fontSize:18}}>🗑️</button>
          </div>;})}
        </Card>}
      </>}
    </div>}
    {adminTab==="gestion"&&<div style={{display:"grid",gap:12}}>
      <Card title="➕ Agregar empleado"><input value={nuevoNom} onChange={e=>setNuevoNom(e.target.value)} placeholder="Nombre completo" style={inp} onKeyDown={e=>{if(e.key==="Enter"){const n=nuevoNom.trim();if(!n)return setNuevoErr("Ingresá un nombre.");if(emps.includes(n))return setNuevoErr("Ya existe.");save([...emps,n],null,null);setNuevoNom("");setNuevoErr("");}}}/>{nuevoErr&&<p style={{color:"#b94a4a",fontSize:13,margin:"4px 0"}}>{nuevoErr}</p>}<Btn onClick={()=>{const n=nuevoNom.trim();if(!n)return setNuevoErr("Ingresá un nombre.");if(emps.includes(n))return setNuevoErr("Ya existe.");save([...emps,n],null,null);setNuevoNom("");setNuevoErr("");}}>Agregar empleado</Btn></Card>
      <Card title="👤 Configurar empleados"><div style={{display:"grid",gap:8}}>{[...emps].sort((a,b)=>a.localeCompare(b,"es")).map((e,i)=>{const c=cfg[e]||{},mV=c.mv!=null?c.mv:MAX_DEF,mF=c.mf!=null?c.mf:MAX_DEF,oc=c.oculto||false;return <div key={e} style={{background:BG,borderRadius:10,padding:"12px",border:"1px solid "+BDR,opacity:oc?0.65:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:30,height:30,borderRadius:"50%",background:AVA[i%AVA.length],display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,color:TXT,flexShrink:0}}>{ini2(e)}</div><span style={{fontWeight:600,color:TXT,fontSize:14,flex:1}}>{e}</span><button onClick={()=>{const nc={...cfg,[e]:{...(cfg[e]||{}),oculto:!oc}};save(null,nc,null);}} style={{background:oc?"#d4f0c0":"#fadadd",border:"none",borderRadius:8,padding:"4px 10px",fontSize:12,cursor:"pointer",color:oc?"#2d6a1f":"#b94a4a",fontWeight:600}}>{oc?"👁 Mostrar":"🙈 Ocultar"}</button></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><label style={{fontSize:12,color:MUT,display:"block",marginBottom:3}}>🌴 Días vac./año</label><input type="number" min="0" max="365" value={mV} onChange={ev=>{const nc={...cfg,[e]:{...(cfg[e]||{}),mv:parseInt(ev.target.value)||0}};save(null,nc,null);}} style={{...inp,marginBottom:0}}/></div><div><label style={{fontSize:12,color:MUT,display:"block",marginBottom:3}}>🎉 Días fer./año</label><input type="number" min="0" max="365" value={mF} onChange={ev=>{const nc={...cfg,[e]:{...(cfg[e]||{}),mf:parseInt(ev.target.value)||0}};save(null,nc,null);}} style={{...inp,marginBottom:0}}/></div></div></div>;})}</div></Card>
    </div>}
  </div></div>;
}