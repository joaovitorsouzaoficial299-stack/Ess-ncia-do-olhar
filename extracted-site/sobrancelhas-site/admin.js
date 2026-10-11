(function(){
var SUPABASE_URL="https://vhqusyacchddrlgusysh.supabase.co";
var SUPABASE_KEY="sb_publishable_kk6H1ZAhmr7gO4r7CJiQJA_iuQiZ_x0";
var ADMIN_EMAIL="gisellesouzaoficial299@gmail.com";
var db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
var $=function(id){return document.getElementById(id)};
var names=["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
var shortNames=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
var activeDay=1,cfg={schedule:{},blockedDates:[],services:[]},allBookings=[],originalServiceIds=[];
function times(){var a=[];for(var m=8*60;m<18*60;m+=30)a.push(String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"));return a}
function defaultSchedule(){var s={};for(var d=0;d<7;d++)s[d]={enabled:d>=1&&d<=6,hours:d>=1&&d<=6?times().filter(function(t){return t<"18:00"}):[]};return s}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function fmt(s){if(!s)return "";var p=String(s).split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:s}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function money(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:2})}
function message(text,isError){$("loginMsg").textContent=text;$("loginMsg").style.color=isError?"#e9a595":""}
function showLogin(){ $("login").style.display="block";$("dashboard").style.display="none" }
function isAdmin(user){return !!(user&&user.email&&user.email.toLowerCase()===ADMIN_EMAIL)}
async function authenticate(){
 var email=$("email").value.trim().toLowerCase(),password=$("password").value;
 if(email!==ADMIN_EMAIL){message("Este painel só aceita o e-mail administrativo autorizado.",true);return}
 if(password.length<8){message("Digite uma senha com pelo menos 8 caracteres.",true);return}
 $("loginBtn").disabled=true;message("Verificando acesso…",false);
 try{
  var result=await db.auth.signInWithPassword({email:email,password:password});
  if(result.error)throw result.error;
  if(!isAdmin(result.data.user)){await db.auth.signOut();throw new Error("Este e-mail não está autorizado.");}
  await openDashboard(result.data.user);
 }catch(e){message(e.message||"Não foi possível entrar.",true)}
 finally{$("loginBtn").disabled=false}
}
async function createAdmin(){
 var email=$("email").value.trim().toLowerCase(),password=$("password").value;
 if(email!==ADMIN_EMAIL){message("Só é permitido criar acesso para o e-mail administrativo autorizado.",true);return}
 if(password.length<8){message("Crie uma senha com pelo menos 8 caracteres.",true);return}
 $("signupBtn").disabled=true;message("Criando acesso seguro…",false);
 try{
  var result=await db.auth.signUp({email:email,password:password,options:{emailRedirectTo:window.location.origin+window.location.pathname}});
  if(result.error)throw result.error;
  if(result.data.session&&isAdmin(result.data.user)){await openDashboard(result.data.user)}
  else{message("Cadastro iniciado. Abra a caixa de entrada de "+ADMIN_EMAIL+" e confirme o e-mail antes de entrar.",false)}
 }catch(e){message(e.message||"Não foi possível criar o acesso.",true)}
 finally{$("signupBtn").disabled=false}
}
async function openDashboard(user){
 if(!isAdmin(user)){await db.auth.signOut();showLogin();message("Acesso não autorizado.",true);return}
 $("login").style.display="none";$("dashboard").style.display="block";
 $("adminIdentity").textContent=user.email;
 await loadData();
}
$("loginBtn").onclick=authenticate;
$("signupBtn").onclick=createAdmin;
$("password").addEventListener("keydown",function(e){if(e.key==="Enter")authenticate()});
$("logout").onclick=async function(){await db.auth.signOut();showLogin();$("password").value="";message("Você saiu do painel.",false)};
db.auth.getSession().then(async function(r){if(r.data&&r.data.session){var u=r.data.session.user;if(isAdmin(u))await openDashboard(u);else{await db.auth.signOut();showLogin()}}}).catch(function(){showLogin()});
db.auth.onAuthStateChange(function(event,session){if(event==="SIGNED_OUT")showLogin();if(session&&!isAdmin(session.user)){Promise.resolve().then(function(){db.auth.signOut()})}});
async function loadData(){
 try{
  var results=await Promise.all([
   db.from("services").select("id,name,description,price,duration,active").order("name"),
   db.from("site_settings").select("schedule,blocked_dates").eq("id",1).maybeSingle(),
   db.from("bookings").select("*").order("booking_date").order("booking_time")
  ]);
  results.forEach(function(r){if(r.error)throw r.error});
  cfg.services=results[0].data||[];originalServiceIds=cfg.services.map(function(s){return s.id});
  cfg.schedule=results[1].data&&results[1].data.schedule?results[1].data.schedule:defaultSchedule();
  cfg.blockedDates=results[1].data&&results[1].data.blocked_dates?results[1].data.blocked_dates:[];
  allBookings=(results[2].data||[]).map(function(b){return {id:b.id,date:b.booking_date,time:b.booking_time,service:b.service_name,serviceId:b.service_id,price:b.service_price,duration:b.service_duration,name:b.customer_name,phone:b.whatsapp,hennaColor:b.henna_color,status:b.status,createdAt:b.created_at}});
  renderSettings();renderServices();renderAppointments();
 }catch(e){showLogin();message("Não foi possível carregar os dados. Confira o acesso do administrador e tente entrar novamente.",true);console.error(e)}
}
function dayCfg(d){if(!cfg.schedule[d])cfg.schedule[d]={enabled:false,hours:[]};return cfg.schedule[d]}
function renderSettings(){
 $("days").innerHTML="";
 shortNames.forEach(function(n,i){var b=document.createElement("button"),dc=dayCfg(i);b.type="button";b.className="day"+(i===activeDay?" active":"");b.textContent=n+(dc.enabled?" ✓":" ×");b.title=names[i]+(dc.enabled?" — atendimento ativado":" — atendimento desativado");b.setAttribute("aria-pressed",i===activeDay?"true":"false");b.onclick=function(){activeDay=i;renderSettings()};$("days").appendChild(b)});
 var dc=dayCfg(activeDay);$("scheduleDayTitle").textContent=names[activeDay];$("scheduleDayHelp").textContent=dc.enabled?"Atendimento ativado para este dia. Selecione os horários que deseja oferecer.":"Atendimento desativado neste dia; ative para liberar horários no site.";$("toggleDay").textContent=dc.enabled?"Desativar atendimento":"Ativar atendimento";$("toggleDay").className="admin-btn"+(dc.enabled?" primary":"");$("timePicker").innerHTML="";
 times().forEach(function(t){var b=document.createElement("button"),selected=dc.hours.indexOf(t)>-1;b.type="button";b.className="time-option"+(selected?" selected":"");b.textContent=t;b.setAttribute("aria-pressed",selected?"true":"false");b.disabled=!dc.enabled;b.style.opacity=dc.enabled?"1":".45";b.style.cursor=dc.enabled?"pointer":"not-allowed";b.onclick=function(){var idx=dc.hours.indexOf(t);if(idx>-1)dc.hours.splice(idx,1);else dc.hours.push(t);renderSettings()};$("timePicker").appendChild(b)});
}
$("toggleDay").onclick=function(){var dc=dayCfg(activeDay);dc.enabled=!dc.enabled;if(dc.enabled&&!dc.hours.length)dc.hours=times().filter(function(t){return t<"18:00"});if(!dc.enabled)dc.hours=[];renderSettings()};
$("saveSettings").onclick=async function(){
 for(var d=0;d<7;d++){var dc=dayCfg(d);dc.hours=Array.from(new Set(dc.hours)).filter(function(t){return times().indexOf(t)>-1}).sort();if(!dc.enabled)dc.hours=[]}
 var result=await db.from("site_settings").update({schedule:cfg.schedule,blocked_dates:cfg.blockedDates,updated_at:new Date().toISOString()}).eq("id",1);
 $("settingsMsg").textContent=result.error?"Erro ao salvar: "+result.error.message:"Horários salvos e sincronizados com o site.";setTimeout(function(){$("settingsMsg").textContent=""},4500);renderSettings();
};
function renderServices(){
 var root=$("serviceEditor");root.innerHTML="";
 cfg.services.forEach(function(s){
  var row=document.createElement("div");row.className="service-row";
  row.innerHTML='<div class="service-name"><label>Nome do serviço</label><input data-field="name" value="'+esc(s.name)+'" placeholder="Nome"></div><div><label>Valor (R$)</label><input data-field="price" type="number" min="0" step="0.01" value="'+esc(s.price)+'"></div><div><label>Duração (min)</label><input data-field="duration" type="number" min="5" max="480" step="5" value="'+esc(s.duration)+'"></div><div><label>Descrição</label><input data-field="description" value="'+esc(s.description)+'" placeholder="Descrição"></div><button type="button" class="admin-btn danger">Excluir</button>';
  row.querySelectorAll("input").forEach(function(input){input.addEventListener("input",function(){var field=input.getAttribute("data-field");s[field]=(field==="price"||field==="duration")?Number(input.value):input.value})});
  row.querySelector("button").onclick=function(){if(!confirm('Excluir o serviço "'+s.name+'"?'))return;cfg.services=cfg.services.filter(function(x){return x!==s});renderServices()};
  root.appendChild(row);
 });
}
$("addService").onclick=function(){cfg.services.push({id:"service-"+crypto.randomUUID(),name:"Novo serviço",description:"",price:0,duration:30,active:true});renderServices()};
$("saveServices").onclick=async function(){
 cfg.services=cfg.services.filter(function(s){return s.name.trim()!==""}).map(function(s){return {id:s.id,name:s.name.trim(),description:s.description||"",price:Math.max(0,Number(s.price)||0),duration:Math.min(480,Math.max(5,Number(s.duration)||30)),active:true}});
 var removed=originalServiceIds.filter(function(id){return !cfg.services.some(function(s){return s.id===id})});
 try{
  if(removed.length){var del=await db.from("services").delete().in("id",removed);if(del.error)throw del.error}
  if(cfg.services.length){var up=await db.from("services").upsert(cfg.services,{onConflict:"id"});if(up.error)throw up.error}
  originalServiceIds=cfg.services.map(function(s){return s.id});renderServices();$("serviceMsg").textContent="Serviços salvos e sincronizados com o site.";
 }catch(e){$("serviceMsg").textContent="Erro ao salvar: "+e.message}
 setTimeout(function(){$("serviceMsg").textContent=""},4500);
};
["filterDate","filterStatus"].forEach(function(id){$(id).addEventListener("change",renderAppointments)});
$("clearFilters").onclick=function(){$("filterDate").value="";$("filterStatus").value="active";renderAppointments()};
function renderAppointments(){
 var today=iso(new Date()),month=today.slice(0,7);
 $("totalToday").textContent=allBookings.filter(function(b){return b.date===today&&b.status==="scheduled"}).length;
 $("totalMonth").textContent=allBookings.filter(function(b){return b.date&&b.date.slice(0,7)===month&&b.status==="scheduled"}).length;
 $("totalAll").textContent=allBookings.filter(function(b){return b.date>=today&&b.status==="scheduled"}).length;
 var fdate=$("filterDate").value,status=$("filterStatus").value;
 var list=allBookings.filter(function(b){if(fdate&&b.date!==fdate)return false;if(status==="active"&&(b.status==="completed"||b.status==="cancelled"))return false;if(status==="completed"&&b.status!=="completed")return false;if(status==="cancelled"&&b.status!=="cancelled")return false;return true}).sort(function(a,b){return (a.date+a.time).localeCompare(b.date+b.time)});
 var root=$("appointmentList");root.innerHTML="";if(!list.length){root.innerHTML='<div class="empty">Nenhum agendamento encontrado para esse filtro.</div>';return}
 list.forEach(function(a){var item=document.createElement("div");item.className="appointment";var left=document.createElement("div");left.innerHTML="<strong>"+esc(fmt(a.date))+" às "+esc(a.time)+"</strong><p>"+esc(a.service)+" — "+esc(money(a.price))+"<br>Cliente: "+esc(a.name)+"<br>WhatsApp: "+esc(a.phone)+(a.hennaColor?"<br>Cor da henna: "+esc(a.hennaColor):"")+"<br><span class=\"status\">"+(a.status==="completed"?"Serviço concluído":a.status==="cancelled"?"Cancelado pelo cliente":"Agendamento registrado — confirmar pelo WhatsApp")+"</span></p>";
  var actions=document.createElement("div");actions.className="appointment-actions";
  if(a.status==="scheduled"){var done=document.createElement("button");done.className="admin-btn primary";done.textContent="Serviço concluído";done.onclick=async function(){if(!confirm("Marcar o atendimento de "+a.name+" em "+fmt(a.date)+" às "+a.time+" como concluído?"))return;done.disabled=true;var res=await db.from("bookings").update({status:"completed"}).eq("id",a.id);if(res.error){alert("Não foi possível atualizar: "+res.error.message);done.disabled=false;return}a.status="completed";renderAppointments()};actions.appendChild(done)}
  item.appendChild(left);item.appendChild(actions);root.appendChild(item);
 });
}
$("export").onclick=function(){var rows=[["Data","Horário","Serviço","Valor","Cor da henna","Nome","WhatsApp","Status"]].concat(allBookings.map(function(a){return [a.date,a.time,a.service,a.price,a.hennaColor||"",a.name,a.phone,a.status]}));var csv=rows.map(function(row){return row.map(function(v){return '"'+String(v==null?"":v).replace(/"/g,'""')+'"'}).join(";")}).join("\r\n");var blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="agendamentos-essencia-do-olhar.csv";link.click();URL.revokeObjectURL(url)};
var nav=document.getElementById("nav");window.addEventListener("scroll",function(){if(nav)nav.classList.toggle("s",window.scrollY>40)},{passive:true});
})();