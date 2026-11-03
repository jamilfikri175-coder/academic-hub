const $ = id => document.getElementById(id);
const KEYS = { events:"ah_events_v1", tasks:"ah_tasks_v1", refs:"ah_refs_v1" };
let events = load(KEYS.events), tasks = load(KEYS.tasks), refs = load(KEYS.refs), taskFilter = "all";
function load(k){try{return JSON.parse(localStorage.getItem(k)||"[]")}catch{return []}}
function save(){localStorage.setItem(KEYS.events,JSON.stringify(events));localStorage.setItem(KEYS.tasks,JSON.stringify(tasks));localStorage.setItem(KEYS.refs,JSON.stringify(refs));render()}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function dateObj(d,t="00:00"){return new Date(`${d}T${t||"00:00"}:00`)}
function fmt(d,opts={day:"numeric",month:"short",year:"numeric"}){if(!d)return "—";return new Date(d+"T00:00:00").toLocaleDateString("id-ID",opts)}
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function empty(msg){return `<div class="empty">${msg}</div>`}
function showView(name){document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));$(name+"View").classList.remove("hidden");document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===name));$("pageTitle").textContent=({dashboard:"Dashboard",agenda:"Agenda akademik",tasks:"Manajemen tugas",references:"Perpustakaan referensi",settings:"Pengaturan"})[name];if(name==="agenda")renderAgenda();if(name==="tasks")renderTasks();if(name==="references")renderRefs()}
function render(){
 const now=new Date();$("dateChip").textContent=now.toLocaleDateString("id-ID",{weekday:"short",day:"numeric",month:"short",year:"numeric"});$("todayLabel").textContent=now.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase();
 const future=events.filter(e=>dateObj(e.date,e.time)>=now).sort((a,b)=>dateObj(a.date,a.time)-dateObj(b.date,b.time));
 const active=tasks.filter(t=>!t.done);const nextTask=active.filter(t=>t.date).sort((a,b)=>a.date.localeCompare(b.date))[0];
 $("statPresentations").textContent=future.filter(e=>e.type==="Presentasi").length;$("statTasks").textContent=active.length;$("statRefs").textContent=refs.length;
 $("statDeadline").textContent=nextTask?fmt(nextTask.date,{day:"numeric",month:"short"}):"—";$("deadlineSub").textContent=nextTask?nextTask.title:"Tidak ada deadline";
 if(future[0]){$("nextDay").textContent=new Date(future[0].date+"T00:00:00").getDate();$("nextMonth").textContent=new Date(future[0].date+"T00:00:00").toLocaleDateString("id-ID",{month:"short",year:"numeric"}).toUpperCase()}else{$("nextDay").textContent="—";$("nextMonth").textContent="BELUM ADA AGENDA"}
 $("upcomingList").innerHTML=future.length?future.slice(0,4).map(e=>`<div class="list-item"><div class="date-box"><b>${new Date(e.date+"T00:00:00").getDate()}</b><small>${new Date(e.date+"T00:00:00").toLocaleDateString("id-ID",{month:"short"})}</small></div><div class="list-copy"><b>${esc(e.title)}</b><small>${esc(e.course||e.type)} · ${esc(e.time)}</small></div><span class="tag">${esc(e.type)}</span></div>`).join(""):empty("Belum ada agenda. Tambahkan jadwal pertamamu.");
 $("dashboardTasks").innerHTML=active.length?active.slice().sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4).map(t=>`<div class="list-item"><div class="date-box"><b>${new Date(t.date+"T00:00:00").getDate()}</b><small>${new Date(t.date+"T00:00:00").toLocaleDateString("id-ID",{month:"short"})}</small></div><div class="list-copy"><b>${esc(t.title)}</b><small>${esc(t.course||"Tanpa mata kuliah")} · ${esc(t.priority)}</small></div><span class="tag">${esc(t.priority)}</span></div>`).join(""):empty("Semua tugas selesai atau belum ada tugas.");
 renderAgenda();renderTasks();renderRefs();
}
function renderAgenda(){const sorted=[...events].sort((a,b)=>dateObj(a.date,a.time)-dateObj(b.date,b.time));$("agendaList").innerHTML=sorted.length?sorted.map(e=>`<article class="record-card"><div class="date-box"><b>${new Date(e.date+"T00:00:00").getDate()}</b><small>${new Date(e.date+"T00:00:00").toLocaleDateString("id-ID",{month:"short"})}</small></div><div class="record-main"><h3>${esc(e.title)}</h3><p>${esc(e.type)} · ${esc(e.course||"Tanpa mata kuliah")} · ${esc(fmt(e.date))} pukul ${esc(e.time)}<br>${esc(e.location||"Lokasi belum diisi")} ${e.notes?"· "+esc(e.notes):""}</p></div><div class="record-actions"><button class="small-btn" onclick="editEvent('${e.id}')">Edit</button><button class="small-btn delete" onclick="deleteEvent('${e.id}')">Hapus</button></div></article>`).join(""):empty("Belum ada agenda akademik.")}
function renderTasks(){const list=tasks.filter(t=>taskFilter==="all"||(taskFilter==="active"&&!t.done)||(taskFilter==="done"&&t.done)).sort((a,b)=>a.date.localeCompare(b.date));$("taskList").innerHTML=list.length?list.map(t=>`<article class="record-card"><input type="checkbox" ${t.done?"checked":""} aria-label="Tandai selesai" onchange="toggleTask('${t.id}')" style="accent-color:#8b7cff;width:16px;height:16px"><div class="record-main"><h3 style="${t.done?"text-decoration:line-through;color:#8796aa":""}">${esc(t.title)}</h3><p>${esc(t.course||"Tanpa mata kuliah")} · Deadline ${esc(fmt(t.date))} · Prioritas ${esc(t.priority)}${t.notes?"<br>"+esc(t.notes):""}</p></div><div class="record-actions"><button class="small-btn" onclick="editTask('${t.id}')">Edit</button><button class="small-btn delete" onclick="deleteTask('${t.id}')">Hapus</button></div></article>`).join(""):empty("Tidak ada tugas pada kategori ini.")}
function renderRefs(){const q=($("referenceSearch").value||"").toLowerCase();const list=refs.filter(r=>(r.title+" "+r.author+" "+r.course+" "+r.notes).toLowerCase().includes(q));$("referenceList").innerHTML=list.length?list.map(r=>`<article class="reference-card"><span class="type-label">${esc(r.type)}</span><h3>${esc(r.title)}</h3><p>${esc(r.author||"Penulis belum dicatat")} · ${esc(r.course||"Tanpa kategori")}<br>${esc(r.notes||"Belum ada catatan.")}</p>${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener">Buka sumber ↗</a>`:""}<div class="record-actions"><button class="small-btn" onclick="editRef('${r.id}')">Edit</button><button class="small-btn delete" onclick="deleteRef('${r.id}')">Hapus</button></div></article>`).join(""):empty("Belum ada referensi yang cocok.")}
function openDialog(id){$(id).showModal()}
function closeDialog(id){$(id).close()}
function resetForm(form){$(form).reset()}
function openEvent(e){resetForm("eventForm");$("eventId").value=e?.id||"";$("eventTitle").value=e?.title||"";$("eventType").value=e?.type||"Presentasi";$("eventCourse").value=e?.course||"";$("eventDate").value=e?.date||new Date().toISOString().slice(0,10);$("eventTime").value=e?.time||"09:00";$("eventLocation").value=e?.location||"";$("eventNotes").value=e?.notes||"";$("eventModalTitle").textContent=e?"Edit agenda":"Tambah agenda";openDialog("eventDialog")}
function openTask(t){resetForm("taskForm");$("taskId").value=t?.id||"";$("taskTitle").value=t?.title||"";$("taskCourse").value=t?.course||"";$("taskPriority").value=t?.priority||"Normal";$("taskDate").value=t?.date||new Date().toISOString().slice(0,10);$("taskNotes").value=t?.notes||"";$("taskModalTitle").textContent=t?"Edit tugas":"Tambah tugas";openDialog("taskDialog")}
function openRef(r){resetForm("referenceForm");$("refId").value=r?.id||"";$("refTitle").value=r?.title||"";$("refAuthor").value=r?.author||"";$("refType").value=r?.type||"Jurnal";$("refCourse").value=r?.course||"";$("refUrl").value=r?.url||"";$("refNotes").value=r?.notes||"";$("refModalTitle").textContent=r?"Edit referensi":"Simpan referensi";openDialog("referenceDialog")}
window.editEvent=id=>openEvent(events.find(x=>x.id===id));window.deleteEvent=id=>{if(confirm("Hapus agenda ini?")){events=events.filter(x=>x.id!==id);save();toast("Agenda dihapus")}};
window.editTask=id=>openTask(tasks.find(x=>x.id===id));window.deleteTask=id=>{if(confirm("Hapus tugas ini?")){tasks=tasks.filter(x=>x.id!==id);save();toast("Tugas dihapus")}};window.toggleTask=id=>{const t=tasks.find(x=>x.id===id);t.done=!t.done;save()};
window.editRef=id=>openRef(refs.find(x=>x.id===id));window.deleteRef=id=>{if(confirm("Hapus referensi ini?")){refs=refs.filter(x=>x.id!==id);save();toast("Referensi dihapus")}};
$("eventForm").addEventListener("submit",e=>{e.preventDefault();const id=$("eventId").value;const item={id:id||uid(),title:$("eventTitle").value.trim(),type:$("eventType").value,course:$("eventCourse").value.trim(),date:$("eventDate").value,time:$("eventTime").value,location:$("eventLocation").value.trim(),notes:$("eventNotes").value.trim()};events=events.filter(x=>x.id!==item.id);events.push(item);save();closeDialog("eventDialog");toast("Agenda berhasil disimpan")});
$("taskForm").addEventListener("submit",e=>{e.preventDefault();const id=$("taskId").value;const old=tasks.find(x=>x.id===id);const item={id:id||uid(),title:$("taskTitle").value.trim(),course:$("taskCourse").value.trim(),priority:$("taskPriority").value,date:$("taskDate").value,notes:$("taskNotes").value.trim(),done:old?.done||false};tasks=tasks.filter(x=>x.id!==item.id);tasks.push(item);save();closeDialog("taskDialog");toast("Tugas berhasil disimpan")});
$("referenceForm").addEventListener("submit",e=>{e.preventDefault();const id=$("refId").value;const item={id:id||uid(),title:$("refTitle").value.trim(),author:$("refAuthor").value.trim(),type:$("refType").value,course:$("refCourse").value.trim(),url:$("refUrl").value.trim(),notes:$("refNotes").value.trim()};refs=refs.filter(x=>x.id!==item.id);refs.push(item);save();closeDialog("referenceDialog");toast("Referensi berhasil disimpan")});
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeDialog(b.dataset.close)));
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.goto)));
document.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",()=>{const v=b.dataset.open;showView(v);if(v==="agenda")openEvent();if(v==="tasks")openTask();if(v==="references")openRef()}));
$("addEvent").onclick=()=>openEvent();$("quickAdd").onclick=()=>openEvent();$("addTask").onclick=()=>openTask();$("addReference").onclick=()=>openRef();
document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{taskFilter=b.dataset.filter;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===b));renderTasks()});
$("referenceSearch").addEventListener("input",renderRefs);
async function enableNotifications(){
 if(!("Notification" in window)){toast("Browser ini tidak mendukung notifikasi.");return}
 const permission=await Notification.requestPermission();
 if(permission!=="granted"){toast("Izin notifikasi belum diberikan.");return}
 if("serviceWorker" in navigator){try{await navigator.serviceWorker.register("/sw.js")}catch(err){console.warn(err)}}
 toast("Izin notifikasi perangkat aktif.");
 try{new Notification("Academic Hub",{body:"Pengingat akademik siap digunakan."})}catch{}
 await subscribePush();
}
function urlBase64ToUint8Array(base64String){const padding="=".repeat((4-base64String.length%4)%4);const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");const raw=atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}
async function subscribePush(){
 try{
  const res=await fetch("/api/push/public-key");if(!res.ok)return;
  const {publicKey}=await res.json();const reg=await navigator.serviceWorker.ready;
  const sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(publicKey)});
  await fetch("/api/push/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sub)});
  toast("Perangkat terdaftar untuk push notification.");
 }catch(err){console.info("Push server belum dikonfigurasi",err)}
}
$("enablePush").onclick=enableNotifications;$("notifyTop").onclick=enableNotifications;
$("testPush").onclick=async()=>{try{const r=await fetch("/api/push/test",{method:"POST"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Gagal");toast("Push terkirim ke "+d.sent+" perangkat.")}catch(e){toast(e.message||"Push belum dikonfigurasi.")}};
$("clearData").onclick=()=>{if(confirm("Hapus semua agenda, tugas, dan referensi dari browser ini?")){events=[];tasks=[];refs=[];save();toast("Semua data lokal dihapus.")}};
function checkLocalReminders(){
 if(!("Notification" in window)||Notification.permission!=="granted")return;
 const now=Date.now();
 events.forEach(e=>{const when=dateObj(e.date,e.time).getTime();const reminders=[{ms:3*86400000,label:"3 hari lagi"},{ms:86400000,label:"Besok"},{ms:3600000,label:"1 jam lagi"}];reminders.forEach(r=>{const key=`${e.id}_${r.ms}_${e.date}`;const target=when-r.ms;if(now>=target&&now<target+60000&&!localStorage.getItem("ah_sent_"+key)){new Notification("Pengingat "+e.type,{body:`${e.title} — ${r.label}`,tag:key});localStorage.setItem("ah_sent_"+key,"1")}})});
 tasks.forEach(t=>{const when=dateObj(t.date,"09:00").getTime();const key=`task_${t.id}_${t.date}`;if(!t.done&&now>=when-86400000&&now<when-86340000&&!localStorage.getItem("ah_sent_"+key)){new Notification("Deadline tugas besok",{body:t.title,tag:key});localStorage.setItem("ah_sent_"+key,"1")}});
}
if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});
setInterval(checkLocalReminders,30000);render();
