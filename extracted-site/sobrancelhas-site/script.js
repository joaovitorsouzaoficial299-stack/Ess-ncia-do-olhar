// Essência do Olhar — agendamento local no navegador
var WHATS="5562993150343"; // WhatsApp de agendamento da profissional
var KEY="brow_bookings_v1",SETTINGS_KEY="brow_settings_v1";
var serviceDefaults=[
{id:"design",name:"Design simples",description:"Mapeamento e retirada dos fios com acabamento delicado.",price:45,duration:40},
{id:"henna",name:"Design com henna",description:"Design personalizado com preenchimento em henna para mais definição.",price:70,duration:60},
{id:"lamination",name:"Brow lamination",description:"Fios alinhados e volumosos com efeito natural e duradouro.",price:120,duration:60}
];
var $=function(i){return document.getElementById(i)};
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function fmt(d){var p=d.split("-");return p[2]+"/"+p[1]+"/"+p[0]}
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []}}
function save(a){localStorage.setItem(KEY,JSON.stringify(a))}
function defaultTimes(){var a=[];for(var m=8*60;m<18*60;m+=30)a.push(String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"));return a}
function defaultSchedule(){var s={};for(var d=0;d<7;d++)s[d]={enabled:d>=1&&d<=6,hours:d>=1&&d<=6?defaultTimes():[]};return s}
function settings(){
 var base={schedule:defaultSchedule(),blockedDates:[],services:serviceDefaults};
 try{
  var saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}");
  if(saved.schedule)base.schedule=saved.schedule;
  else if(saved.days){base.schedule=defaultSchedule();for(var d=0;d<7;d++){base.schedule[d].enabled=saved.days.indexOf(d)>-1;if(!base.schedule[d].enabled)base.schedule[d].hours=[];}}
  base.blockedDates=saved.blockedDates||[];
  base.services=saved.services||serviceDefaults;
 }catch(e){}
 return base;
}
function money(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:2})}
function renderServices(){
 var cfg=settings(),services=cfg.services||serviceDefaults,select=$("svc"),cards=$("serviceCards");
 if(select){var previous=select.value;select.innerHTML="";services.forEach(function(s){var o=document.createElement("option");o.value=s.name+" — "+money(s.price);o.textContent=o.value;select.appendChild(o)});if(Array.from(select.options).some(function(o){return o.value===previous}))select.value=previous}
 if(cards){cards.innerHTML="";services.forEach(function(s,i){var card=document.createElement("div");card.className="card in"+(i===1?" d1":i===2?" d2":"");var h=document.createElement("h3");h.textContent=s.name;var p=document.createElement("p");p.textContent=s.description||"";var price=document.createElement("span");price.className="pr";price.textContent=money(s.price);var duration=document.createElement("small");duration.textContent=(Number(s.duration)||30)+" min";card.appendChild(h);card.appendChild(p);card.appendChild(price);card.appendChild(duration);cards.appendChild(card)})}
}
var sel=null,selectedHenna=null;
var hennaOptions=[{name:"Castanho claro",color:"#9a6b45"},{name:"Castanho médio",color:"#70452f"},{name:"Castanho escuro",color:"#4b2c20"},{name:"Preto",color:"#211b18"}];
function renderHenna(){var picker=$("hennaPicker"),root=$("hennaColors"),service=$("svc");if(!picker||!root||!service)return;var option=service.options[service.selectedIndex],needsHenna=/henna/i.test(option?option.textContent:"");picker.style.display=needsHenna?"block":"none";root.innerHTML="";if(!needsHenna){selectedHenna=null;$("hennaSelected").textContent="";return}hennaOptions.forEach(function(item){var button=document.createElement("button");button.type="button";button.className="henna-choice"+(selectedHenna===item.name?" chosen":"");button.setAttribute("aria-pressed",selectedHenna===item.name?"true":"false");var circle=document.createElement("span");circle.className="henna-circle";circle.style.backgroundColor=item.color;circle.textContent=item.name;var name=document.createElement("span");name.className="henna-name";name.textContent=item.name;button.appendChild(circle);button.appendChild(name);button.onclick=function(){selectedHenna=item.name;renderHenna()};root.appendChild(button)});$("hennaSelected").textContent=selectedHenna?"Cor escolhida: "+selectedHenna:"Escolha uma cor acima.";}
if($("svc"))$("svc").addEventListener("change",renderHenna);
window.addEventListener("scroll",function(){var nav=$("nav");if(nav)nav.classList.toggle("s",scrollY>40);var sparkleLayer=$("sp");if(sparkleLayer&&scrollY<window.innerHeight)sparkleLayer.style.translate="0 "+(scrollY*.045)+"px"},{passive:true});
if($("yr"))$("yr").textContent=new Date().getFullYear();
if($("sp")){for(var i=0;i<26;i++){var s=document.createElement("i");s.className="spark";s.style.cssText="left:"+Math.random()*100+"%;top:"+Math.random()*100+"%;animation-delay:"+Math.random()*4+"s;animation-duration:"+(3+Math.random()*3)+"s";$("sp").appendChild(s)}$("sp").style.cssText="position:absolute;inset:0;pointer-events:none"}
if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.15});document.querySelectorAll(".rv").forEach(function(e){io.observe(e)})}else{document.querySelectorAll(".rv").forEach(function(e){e.classList.add("in")})}
renderServices();renderHenna();
// Navegação do agendamento por etapas
var wizardStep=1;
function updateWizardSummary(){var root=$("bookingSummary");if(!root)return;var service=$("svc"),date=$("dt"),option=service&&service.options[service.selectedIndex],parts=[];parts.push('<span class="summary-label">Resumo do seu cuidado</span>');parts.push('<span><strong>Serviço:</strong> '+escapeWizardText(option?option.textContent:"A escolher")+'</span>');if(/henna/i.test(option?option.textContent:""))parts.push('<span><strong>Henna:</strong> '+escapeWizardText(selectedHenna||"Selecione uma cor")+'</span>');parts.push('<span><strong>Data:</strong> '+(date&&date.value?fmt(date.value):"A escolher")+'</span>');parts.push('<span><strong>Horário:</strong> '+escapeWizardText(sel||"A escolher")+'</span>');root.innerHTML=parts.join("")}
function escapeWizardText(value){return String(value||"").replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function goWizardStep(next){if(next===2){var service=$("svc"),option=service&&service.options[service.selectedIndex];if(!option)return show("Escolha um serviço para continuar.",1);if(/henna/i.test(option.textContent)&&!selectedHenna)return show("Escolha a cor da henna para continuar.",1)}if(next===3){if(!$("dt").value)return show("Escolha uma data para continuar.",1);if(!sel)return show("Escolha um horário disponível para continuar.",1)}wizardStep=next;document.querySelectorAll("[data-wizard-step]").forEach(function(panel){var active=Number(panel.getAttribute("data-wizard-step"))===next;panel.hidden=!active;panel.classList.toggle("active",active);if(active){panel.style.animation="none";void panel.offsetWidth;panel.style.animation=""}});document.querySelectorAll("[data-step-dot]").forEach(function(dot){var n=Number(dot.getAttribute("data-step-dot"));dot.classList.toggle("active",n===next);dot.classList.toggle("done",n<next)});if($("stepLabel"))$("stepLabel").textContent="ETAPA 0"+next+" DE 03";if($("stepPercent"))$("stepPercent").textContent=Math.round(next/3*100)+"%";if($("stepBar"))$("stepBar").style.width=(next/3*100)+"%";if($("msg")){$("msg").style.display="none"}updateWizardSummary();var book=$("bookingWizard");if(book)book.scrollIntoView({behavior:"smooth",block:"start"})}
document.querySelectorAll("[data-next]").forEach(function(button){button.addEventListener("click",function(){goWizardStep(Number(button.getAttribute("data-next")))})});document.querySelectorAll("[data-back]").forEach(function(button){button.addEventListener("click",function(){goWizardStep(Number(button.getAttribute("data-back")))})});if($("svc"))$("svc").addEventListener("change",updateWizardSummary);if($("dt"))$("dt").addEventListener("change",updateWizardSummary);document.querySelectorAll(".slot").forEach(function(button){button.addEventListener("click",updateWizardSummary)});

if($("dt")){$("dt").min=iso(new Date());$("dt").addEventListener("change",drawSlots);$("dt").addEventListener("input",drawSlots)}
function drawSlots(){
 var date=$("dt").value;sel=null;
 if(!date){$("slots").innerHTML='<span class="hint">Selecione uma data para ver os horários disponíveis.</span>';return}
 var cfg=settings(),day=new Date(date+"T12:00:00").getDay(),dayCfg=(cfg.schedule||{})[day];
 if(!dayCfg||!dayCfg.enabled){$("slots").innerHTML='<span class="hint">Não há atendimento nesse dia. Escolha outra data.</span>';return}
 var taken=load().filter(function(b){return b.date===date&&b.status!=="cancelled"}).map(function(b){return b.time});
 var now=new Date(),isToday=date===iso(now),hours=(dayCfg.hours||[]).slice().sort();
 $("slots").innerHTML="";
 hours.forEach(function(h){
  var b=document.createElement("button");b.type="button";b.className="slot";b.textContent=h;
  var parts=h.split(":"),past=isToday&&(parseInt(parts[0],10)<now.getHours()||(parseInt(parts[0],10)===now.getHours()&&parseInt(parts[1],10)<=now.getMinutes()));
  if(taken.indexOf(h)>-1||past){b.disabled=true;b.title=taken.indexOf(h)>-1?"Horário já reservado":"Horário que já passou"}
  b.onclick=function(){sel=h;document.querySelectorAll(".slot").forEach(function(x){x.classList.remove("on")});b.classList.add("on");updateWizardSummary()};
  $("slots").appendChild(b);
 });
 if(!hours.length)$("slots").innerHTML='<span class="hint">Ainda não há horários liberados para esse dia. Entre em contato para consultar disponibilidade.</span>';
}
function show(t,err){var m=$("msg");m.className="msg"+(err?" err":"");m.innerHTML=t;m.style.display="block";m.scrollIntoView({behavior:"smooth",block:"center"})}
function renderList(){var a=load().filter(function(b){return b.date>=iso(new Date())&&b.status!=="cancelled"}).sort(function(x,y){return (x.date+x.time)>(y.date+y.time)?1:-1});$("my").style.display=a.length?"block":"none";$("list").innerHTML="";a.forEach(function(b){var r=document.createElement("div");r.className="it";var t=document.createElement("span");t.textContent=fmt(b.date)+" às "+b.time+" — "+b.service.split(" — ")[0];r.appendChild(t);var c=document.createElement("button");c.textContent="Cancelar";c.onclick=function(){if(!confirm("Deseja cancelar este agendamento? Ele ficará registrado como cancelado."))return;var updated=load().map(function(x){if(x.id===b.id){x.status="cancelled";x.cancelledAt=new Date().toISOString()}return x});save(updated);renderList();drawSlots()};r.appendChild(c);$("list").appendChild(r)})}
if($("go"))$("go").onclick=function(){
 var d=$("dt").value,n=$("nm").value.trim(),p=$("ph").value.replace(/\D/g,"");
 if(!d)return show("Escolha uma data.",1);if(!sel)return show("Escolha um horário disponível.",1);if(/henna/i.test($("svc").value)&&!selectedHenna)return show("Escolha a cor da henna.",1);if(n.length<2)return show("Informe seu nome.",1);if(p.length<10)return show("Informe um WhatsApp válido com DDD.",1);
 var cfg=settings(),weekday=new Date(d+"T12:00:00").getDay(),dc=(cfg.schedule||{})[weekday];
 if(!dc||!dc.enabled||(dc.hours||[]).indexOf(sel)<0)return show("Esse dia ou horário não está disponível. Escolha outra opção.",1);
 var all=load();if(all.some(function(b){return b.date===d&&b.time===sel&&b.status!=="cancelled"}))return show("Esse horário acabou de ser ocupado. Escolha outro.",1);
 var b={id:Date.now().toString(),date:d,time:sel,service:$("svc").value,name:n,phone:p,hennaColor:/henna/i.test($("svc").value)?selectedHenna:"",status:"received",createdAt:new Date().toISOString()};all.push(b);save(all);
 var txt="Olá! Gostaria de confirmar meu agendamento:%0A"+"• Serviço: "+encodeURIComponent(b.service)+(b.hennaColor?"%0A• Cor da henna: "+encodeURIComponent(b.hennaColor):"")+"%0A• Data: "+fmt(d)+" às "+sel+"%0A• Nome: "+encodeURIComponent(n);
 show("✨ Solicitação de agendamento registrada para <b>"+fmt(d)+" às "+sel+"</b>!<br><br>Envie a confirmação pelo WhatsApp para combinar o atendimento:<br><br><a class='btn fill' target='_blank' rel='noopener' href='https://wa.me/"+WHATS+"?text="+txt+"'>Confirmar no WhatsApp</a>");
 renderList();drawSlots();
};
if($("dt"))renderList();
