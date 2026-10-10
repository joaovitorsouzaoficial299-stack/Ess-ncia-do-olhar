(function(){
var BOOKINGS="brow_bookings_v1",SETTINGS="brow_settings_v1",PINKEY="brow_admin_pin_v1";
var defaults={hours:["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"],days:[1,2,3,4,5,6],blockedDates:[],services:[
{id:"design",name:"Design simples",description:"Mapeamento e retirada dos fios com acabamento delicado.",price:45,duration:40},
{id:"henna",name:"Design com henna",description:"Design personalizado com preenchimento em henna para mais definição.",price:70,duration:60},
{id:"lamination",name:"Brow lamination",description:"Fios alinhados e volumosos com efeito natural e duradouro.",price:120,duration:60}
]};
var $=function(id){return document.getElementById(id)};
var cfg=readSettings();
function readSettings(){try{var saved=JSON.parse(localStorage.getItem(SETTINGS)||"{}");return Object.assign({},JSON.parse(JSON.stringify(defaults)),saved,{services:saved.services||JSON.parse(JSON.stringify(defaults.services)),hours:saved.hours||defaults.hours,days:saved.days||defaults.days,blockedDates:saved.blockedDates||[]})}catch(e){return JSON.parse(JSON.stringify(defaults))}}
function persist(){localStorage.setItem(SETTINGS,JSON.stringify(cfg))}
function bookings(){try{return JSON.parse(localStorage.getItem(BOOKINGS)||"[]")}catch(e){return []}}
function saveBookings(a){localStorage.setItem(BOOKINGS,JSON.stringify(a))}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function fmt(s){if(!s)return "";var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0]}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
var names=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
function loginSetup(){var exists=!!localStorage.getItem(PINKEY);$("loginHelp").textContent=exists?"Digite seu PIN administrativo para abrir o painel.":"Crie um PIN numérico de pelo menos 4 dígitos. Ele ficará salvo apenas neste navegador.";$("loginBtn").textContent=exists?"Entrar":"Criar PIN e entrar"}
function enter(){var pin=$("pin").value,stored=localStorage.getItem(PINKEY);if(!stored){if(!/^\d{4,12}$/.test(pin)){$("loginMsg").textContent="Use um PIN numérico de 4 a 12 dígitos.";return}localStorage.setItem(PINKEY,pin);stored=pin}if(pin!==stored){$("loginMsg").textContent="PIN incorreto.";return}$("login").style.display="none";$("dashboard").style.display="block";renderSettings();renderServices();renderAppointments()}
$("loginBtn").onclick=enter;$("pin").addEventListener("keydown",function(e){if(e.key==="Enter")enter()});loginSetup();
$("logout").onclick=function(){$("dashboard").style.display="none";$("login").style.display="block";$("pin").value="";loginSetup()};
function renderSettings(){
$("days").innerHTML="";names.forEach(function(n,i){var b=document.createElement("button");b.type="button";b.className="day"+(cfg.days.indexOf(i)>-1?" active":"");b.textContent=n;b.onclick=function(){var ix=cfg.days.indexOf(i);if(ix>-1)cfg.days.splice(ix,1);else cfg.days.push(i);cfg.days.sort();renderSettings()};$("days").appendChild(b)});
var available=[];for(var mins=6*60;mins<=22*60;mins+=30){available.push(String(Math.floor(mins/60)).padStart(2,"0")+":"+String(mins%60).padStart(2,"0"))}
$("timePicker").innerHTML="";available.forEach(function(t){var b=document.createElement("button");b.type="button";b.className="time-option"+(cfg.hours.indexOf(t)>-1?" selected":"");b.textContent=t;b.setAttribute("aria-pressed",cfg.hours.indexOf(t)>-1?"true":"false");b.onclick=function(){var i=cfg.hours.indexOf(t);if(i>-1)cfg.hours.splice(i,1);else cfg.hours.push(t);cfg.hours.sort();renderSettings()};$("timePicker").appendChild(b)});
$("timeList").innerHTML="";cfg.hours.slice().sort().forEach(function(t){var chip=document.createElement("span");chip.className="time-chip";chip.textContent=t;var b=document.createElement("button");b.type="button";b.setAttribute("aria-label","Remover "+t);b.textContent="×";b.onclick=function(){cfg.hours=cfg.hours.filter(function(x){return x!==t});renderSettings()};chip.appendChild(b);$("timeList").appendChild(chip)});
$("blockedList").innerHTML="";cfg.blockedDates.slice().sort().forEach(function(d){var chip=document.createElement("span");chip.className="time-chip";chip.textContent=fmt(d);var b=document.createElement("button");b.type="button";b.textContent="×";b.setAttribute("aria-label","Desbloquear "+fmt(d));b.onclick=function(){cfg.blockedDates=cfg.blockedDates.filter(function(x){return x!==d});renderSettings()};chip.appendChild(b);$("blockedList").appendChild(chip)});
}
$("blockBtn").onclick=function(){var d=$("blockDate").value;if(!d)return;if(cfg.blockedDates.indexOf(d)<0)cfg.blockedDates.push(d);cfg.blockedDates.sort();renderSettings();$("blockDate").value=""};
$("saveSettings").onclick=function(){cfg.hours=Array.from(new Set(cfg.hours)).sort();cfg.days=Array.from(new Set(cfg.days)).sort();cfg.blockedDates=Array.from(new Set(cfg.blockedDates)).sort();persist();$("settingsMsg").textContent="Configurações salvas neste navegador.";setTimeout(function(){$("settingsMsg").textContent=""},3500)};
function renderServices(){
var root=$("serviceEditor");root.innerHTML="";
cfg.services.forEach(function(s,i){var row=document.createElement("div");row.className="service-row";
row.innerHTML='<div class="service-name"><label>Nome do serviço</label><input data-field="name" value="'+esc(s.name)+'" placeholder="Nome"></div><div><label>Valor (R$)</label><input data-field="price" type="number" min="0" step="0.01" value="'+esc(s.price)+'"></div><div><label>Duração (min)</label><input data-field="duration" type="number" min="5" step="5" value="'+esc(s.duration)+'"></div><div><label>Descrição</label><input data-field="description" value="'+esc(s.description)+'" placeholder="Descrição"></div><button type="button" class="admin-btn danger">Excluir</button>';
row.querySelectorAll("input").forEach(function(input){input.addEventListener("input",function(){var field=input.getAttribute("data-field");s[field]=(field==="price"||field==="duration")?Number(input.value):input.value})});
row.querySelector("button").onclick=function(){if(!confirm('Excluir o serviço "'+s.name+'"?'))return;cfg.services=cfg.services.filter(function(x){return x!==s});renderServices()};root.appendChild(row)
});
}
$("addService").onclick=function(){cfg.services.push({id:"service-"+Date.now(),name:"Novo serviço",description:"",price:0,duration:30});renderServices()};
$("saveServices").onclick=function(){cfg.services=cfg.services.filter(function(s){return s.name.trim()!==""}).map(function(s){return {id:s.id||"service-"+Math.random().toString(36).slice(2),name:s.name.trim(),description:s.description||"",price:Math.max(0,Number(s.price)||0),duration:Math.max(5,Number(s.duration)||30)}});persist();renderServices();$("serviceMsg").textContent="Serviços e valores salvos.";setTimeout(function(){$("serviceMsg").textContent=""},3500)};
["filterDate","filterStatus"].forEach(function(id){$(id).addEventListener("change",renderAppointments)});
$("clearFilters").onclick=function(){$("filterDate").value="";$("filterStatus").value="active";renderAppointments()};
function renderAppointments(){
var all=bookings(),today=iso(new Date()),month=today.slice(0,7);
$("totalToday").textContent=all.filter(function(b){return b.date===today&&b.status!=="cancelled"}).length;
$("totalMonth").textContent=all.filter(function(b){return b.date&&b.date.slice(0,7)===month&&b.status!=="cancelled"}).length;
$("totalAll").textContent=all.filter(function(b){return b.date>=today&&b.status!=="cancelled"}).length;
var fdate=$("filterDate").value,status=$("filterStatus").value;
var list=all.filter(function(b){if(fdate&&b.date!==fdate)return false;if(status==="active"&&(b.status==="cancelled"||b.date<today))return false;if(status==="cancelled"&&b.status!=="cancelled")return false;return true}).sort(function(a,b){return (a.date+a.time).localeCompare(b.date+b.time)});
var root=$("appointmentList");root.innerHTML="";if(!list.length){root.innerHTML='<div class="empty">Nenhum agendamento encontrado para esse filtro.</div>';return}
list.forEach(function(a){var item=document.createElement("div");item.className="appointment";var left=document.createElement("div");left.innerHTML='<strong>'+esc(fmt(a.date))+' às '+esc(a.time)+'</strong><p>'+esc(a.service)+'<br>Cliente: '+esc(a.name)+'<br>WhatsApp: '+esc(a.phone)+'<br>Endereço: '+esc(a.addr||"Não informado")+'<br><span class="status">'+(a.status==="cancelled"?"Cancelado":"Pendente de confirmação")+'</span></p>';var actions=document.createElement("div");actions.className="appointment-actions";if(a.status!=="cancelled"){var cancel=document.createElement("button");cancel.className="admin-btn danger";cancel.textContent="Cancelar";cancel.onclick=function(){if(!confirm("Cancelar o agendamento de "+a.name+" em "+fmt(a.date)+" às "+a.time+"?"))return;var updated=bookings().map(function(x){if(x.id===a.id)x.status="cancelled";return x});saveBookings(updated);renderAppointments()};actions.appendChild(cancel)}item.appendChild(left);item.appendChild(actions);root.appendChild(item)})
}
$("export").onclick=function(){var all=bookings();var rows=[["Data","Horário","Serviço","Nome","WhatsApp","Endereço","Status"]].concat(all.map(function(a){return [a.date,a.time,a.service,a.name,a.phone,a.addr,a.status||"pending"]}));var csv=rows.map(function(row){return row.map(function(v){return '"'+String(v==null?"":v).replace(/"/g,'""')+'"'}).join(";")}).join("\r\n");var blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="agendamentos-essencia-do-olhar.csv";link.click();URL.revokeObjectURL(url)};
var nav=document.getElementById("nav");window.addEventListener("scroll",function(){if(nav)nav.classList.toggle("s",window.scrollY>40)},{passive:true});
})();