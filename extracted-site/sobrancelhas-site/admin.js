(function(){
var BOOKINGS="brow_bookings_v1",SETTINGS="brow_settings_v1",PINKEY="brow_admin_pin_v1";
var serviceDefaults=[
{id:"design",name:"Design simples",description:"Mapeamento e retirada dos fios com acabamento delicado.",price:45,duration:40},
{id:"henna",name:"Design com henna",description:"Design personalizado com preenchimento em henna para mais definição.",price:70,duration:60},
{id:"lamination",name:"Brow lamination",description:"Fios alinhados e volumosos com efeito natural e duradouro.",price:120,duration:60}
];
var $=function(id){return document.getElementById(id)};
var names=["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
var shortNames=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
var activeDay=1;
function times(){var a=[];for(var m=8*60;m<=18*60;m+=30)a.push(String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"));return a}
function defaultSchedule(){var s={};for(var d=0;d<7;d++)s[d]={enabled:d>=1&&d<=6,hours:(d>=1&&d<=6?times().filter(function(t){return t<"18:00"}):[])};return s}
function defaults(){return {schedule:defaultSchedule(),services:JSON.parse(JSON.stringify(serviceDefaults))}}
function readSettings(){
 var base=defaults();
 try{
  var saved=JSON.parse(localStorage.getItem(SETTINGS)||"{}");
  if(saved.schedule){base.schedule=saved.schedule;for(var d=0;d<7;d++){if(!base.schedule[d])base.schedule[d]={enabled:false,hours:[]};base.schedule[d].hours=Array.isArray(base.schedule[d].hours)?base.schedule[d].hours:[];base.schedule[d].enabled=!!base.schedule[d].enabled}}
  else if(saved.days){saved.days.forEach(function(d){base.schedule[d]={enabled:true,hours:times().filter(function(t){return t<"18:00"})}})}
  base.services=saved.services||base.services;
 }catch(e){}
 return base;
}
var cfg=readSettings();
function persist(){localStorage.setItem(SETTINGS,JSON.stringify(cfg))}
function bookings(){try{return JSON.parse(localStorage.getItem(BOOKINGS)||"[]")}catch(e){return []}}
function saveBookings(a){localStorage.setItem(BOOKINGS,JSON.stringify(a))}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function fmt(s){if(!s)return "";var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0]}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function loginSetup(){var exists=!!localStorage.getItem(PINKEY);$("loginHelp").textContent=exists?"Digite seu PIN administrativo para abrir o painel.":"Crie um PIN numérico de pelo menos 4 dígitos. Ele ficará salvo apenas neste navegador.";$("loginBtn").textContent=exists?"Entrar":"Criar PIN e entrar"}
function enter(){var pin=$("pin").value,stored=localStorage.getItem(PINKEY);if(!stored){if(!/^\d{4,12}$/.test(pin)){$("loginMsg").textContent="Use um PIN numérico de 4 a 12 dígitos.";return}localStorage.setItem(PINKEY,pin);stored=pin}if(pin!==stored){$("loginMsg").textContent="PIN incorreto.";return}$("login").style.display="none";$("dashboard").style.display="block";renderSettings();renderServices();renderAppointments()}
$("loginBtn").onclick=enter;$("pin").addEventListener("keydown",function(e){if(e.key==="Enter")enter()});loginSetup();
$("logout").onclick=function(){$("dashboard").style.display="none";$("login").style.display="block";$("pin").value="";loginSetup()};
function dayCfg(d){if(!cfg.schedule[d])cfg.schedule[d]={enabled:false,hours:[]};return cfg.schedule[d]}
function renderSettings(){
 $("days").innerHTML="";
 shortNames.forEach(function(n,i){
  var b=document.createElement("button"),dc=dayCfg(i);
  b.type="button";b.className="day"+(i===activeDay?" active":"");
  b.textContent=n+(dc.enabled?" ✓":" ×");b.title=names[i]+(dc.enabled?" — atendimento ativado":" — atendimento desativado");
  b.setAttribute("aria-pressed",i===activeDay?"true":"false");
  b.onclick=function(){activeDay=i;renderSettings()};
  $("days").appendChild(b);
 });
 var dc=dayCfg(activeDay);
 $("scheduleDayTitle").textContent=names[activeDay];
 $("scheduleDayHelp").textContent=dc.enabled?"Atendimento ativado para este dia. Selecione os horários que deseja oferecer.":"Atendimento desativado neste dia; ative para liberar horários no site.";
 $("toggleDay").textContent=dc.enabled?"Desativar atendimento":"Ativar atendimento";
 $("toggleDay").className="admin-btn"+(dc.enabled?" primary":"");
 $("timePicker").innerHTML="";
 times().forEach(function(t){
  var b=document.createElement("button"),selected=dc.hours.indexOf(t)>-1;
  b.type="button";b.className="time-option"+(selected?" selected":"");b.textContent=t;b.setAttribute("aria-pressed",selected?"true":"false");b.disabled=!dc.enabled;
  b.style.opacity=dc.enabled?"1":".45";b.style.cursor=dc.enabled?"pointer":"not-allowed";
  b.onclick=function(){var idx=dc.hours.indexOf(t);if(idx>-1)dc.hours.splice(idx,1);else dc.hours.push(t);dc.hours.sort();renderSettings()};
  $("timePicker").appendChild(b);
 });
}
$("toggleDay").onclick=function(){var dc=dayCfg(activeDay);dc.enabled=!dc.enabled;if(dc.enabled&&!dc.hours.length)dc.hours=times().filter(function(t){return t<"18:00"});renderSettings()};
$("saveSettings").onclick=function(){for(var d=0;d<7;d++){var dc=dayCfg(d);dc.hours=Array.from(new Set(dc.hours)).filter(function(t){return times().indexOf(t)>-1}).sort();if(!dc.enabled)dc.hours=[]}persist();$("settingsMsg").textContent="Configurações salvas neste navegador.";setTimeout(function(){$("settingsMsg").textContent=""},3500)};
function renderServices(){
 var root=$("serviceEditor");root.innerHTML="";
 cfg.services.forEach(function(s){
  var row=document.createElement("div");row.className="service-row";
  row.innerHTML='<div class="service-name"><label>Nome do serviço</label><input data-field="name" value="'+esc(s.name)+'" placeholder="Nome"></div><div><label>Valor (R$)</label><input data-field="price" type="number" min="0" step="0.01" value="'+esc(s.price)+'"></div><div><label>Duração (min)</label><input data-field="duration" type="number" min="5" step="5" value="'+esc(s.duration)+'"></div><div><label>Descrição</label><input data-field="description" value="'+esc(s.description)+'" placeholder="Descrição"></div><button type="button" class="admin-btn danger">Excluir</button>';
  row.querySelectorAll("input").forEach(function(input){input.addEventListener("input",function(){var field=input.getAttribute("data-field");s[field]=(field==="price"||field==="duration")?Number(input.value):input.value})});
  row.querySelector("button").onclick=function(){if(!confirm('Excluir o serviço "'+s.name+'"?'))return;cfg.services=cfg.services.filter(function(x){return x!==s});renderServices()};
  root.appendChild(row);
 });
}
$("addService").onclick=function(){cfg.services.push({id:"service-"+Date.now(),name:"Novo serviço",description:"",price:0,duration:30});renderServices()};
$("saveServices").onclick=function(){cfg.services=cfg.services.filter(function(s){return s.name.trim()!==""}).map(function(s){return {id:s.id||"service-"+Math.random().toString(36).slice(2),name:s.name.trim(),description:s.description||"",price:Math.max(0,Number(s.price)||0),duration:Math.max(5,Number(s.duration)||30)}});persist();renderServices();$("serviceMsg").textContent="Serviços e valores salvos.";setTimeout(function(){$("serviceMsg").textContent=""},3500)};
["filterDate","filterStatus"].forEach(function(id){$(id).addEventListener("change",renderAppointments)});
$("clearFilters").onclick=function(){$("filterDate").value="";$("filterStatus").value="active";renderAppointments()};
function renderAppointments(){
 var all=bookings(),today=iso(new Date()),month=today.slice(0,7);
 $("totalToday").textContent=all.filter(function(b){return b.date===today&&b.status!=="cancelled"&&b.status!=="completed"}).length;
 $("totalMonth").textContent=all.filter(function(b){return b.date&&b.date.slice(0,7)===month&&b.status!=="cancelled"&&b.status!=="completed"}).length;
 $("totalAll").textContent=all.filter(function(b){return b.date>=today&&b.status!=="cancelled"&&b.status!=="completed"}).length;
 var fdate=$("filterDate").value,status=$("filterStatus").value;
 var list=all.filter(function(b){if(fdate&&b.date!==fdate)return false;if(status==="active"&&(b.status==="completed"||b.status==="cancelled"))return false;if(status==="completed"&&b.status!=="completed")return false;if(status==="cancelled"&&b.status!=="cancelled")return false;return true}).sort(function(a,b){return (a.date+a.time).localeCompare(b.date+b.time)});
 var root=$("appointmentList");root.innerHTML="";if(!list.length){root.innerHTML='<div class="empty">Nenhum agendamento encontrado para esse filtro.</div>';return}
 list.forEach(function(a){var item=document.createElement("div");item.className="appointment";var left=document.createElement("div");left.innerHTML="<strong>"+esc(fmt(a.date))+" às "+esc(a.time)+"</strong><p>"+esc(a.service)+"<br>Cliente: "+esc(a.name)+"<br>WhatsApp: "+esc(a.phone)+(a.hennaColor?"<br>Cor da henna: "+esc(a.hennaColor):"")+"<br><span class=\"status\">"+(a.status==="completed"?"Serviço concluído":a.status==="cancelled"?"Cancelado pelo cliente":"Agendamento recebido — confirmar pelo WhatsApp")+"</span></p>";var actions=document.createElement("div");actions.className="appointment-actions";if(a.status!=="completed"&&a.status!=="cancelled"){var done=document.createElement("button");done.className="admin-btn primary";done.textContent="Serviço concluído";done.onclick=function(){if(!confirm("Marcar o atendimento de "+a.name+" em "+fmt(a.date)+" às "+a.time+" como concluído?"))return;var updated=bookings().map(function(x){if(x.id===a.id)x.status="completed";return x});saveBookings(updated);renderAppointments()};actions.appendChild(done)}item.appendChild(left);item.appendChild(actions);root.appendChild(item)});
}
$("export").onclick=function(){var all=bookings();var rows=[["Data","Horário","Serviço","Cor da henna","Nome","WhatsApp","Status"]].concat(all.map(function(a){return [a.date,a.time,a.service,a.hennaColor||"",a.name,a.phone,a.status||"received"]}));var csv=rows.map(function(row){return row.map(function(v){return '"'+String(v==null?"":v).replace(/"/g,'""')+'"'}).join(";")}).join("\r\n");var blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="agendamentos-essencia-do-olhar.csv";link.click();URL.revokeObjectURL(url)};
var nav=document.getElementById("nav");window.addEventListener("scroll",function(){if(nav)nav.classList.toggle("s",window.scrollY>40)},{passive:true});
})();