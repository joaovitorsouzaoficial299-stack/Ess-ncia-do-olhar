// Essência do Olhar — agendamento local no navegador
var WHATS="5511999999999"; // Trocar pelo WhatsApp real da profissional
var DEFAULT_SETTINGS={hours:["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"],days:[1,2,3,4,5,6],blockedDates:[]};
var KEY="brow_bookings_v1",SETTINGS_KEY="brow_settings_v1";
function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []}}
function save(a){localStorage.setItem(KEY,JSON.stringify(a))}
function settings(){try{return Object.assign({},DEFAULT_SETTINGS,JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}"))}catch(e){return DEFAULT_SETTINGS}}
var $=function(i){return document.getElementById(i)};
var sel=null;
window.addEventListener("scroll",function(){
  var nav=$("nav");if(nav)nav.classList.toggle("s",scrollY>40);
  var sparkleLayer=$("sp");if(sparkleLayer&&scrollY<window.innerHeight)sparkleLayer.style.translate="0 "+(scrollY*.045)+"px";
},{passive:true});
if($("yr"))$("yr").textContent=new Date().getFullYear();
if($("sp")){for(var i=0;i<26;i++){var s=document.createElement("i");s.className="spark";s.style.cssText="left:"+Math.random()*100+"%;top:"+Math.random()*100+"%;animation-delay:"+Math.random()*4+"s;animation-duration:"+(3+Math.random()*3)+"s";$("sp").appendChild(s)}$("sp").style.cssText="position:absolute;inset:0;pointer-events:none"}
if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.15});document.querySelectorAll(".rv").forEach(function(e){io.observe(e)})}else{document.querySelectorAll(".rv").forEach(function(e){e.classList.add("in")})}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function fmt(d){var p=d.split("-");return p[2]+"/"+p[1]+"/"+p[0]}
if($("dt")){$("dt").min=iso(new Date());$("dt").addEventListener("change",drawSlots)}
function drawSlots(){
  var d=$("dt").value;sel=null;if(!d){$("slots").innerHTML='<span class="hint">Selecione uma data.</span>';return}
  var cfg=settings(),dd=new Date(d+"T12:00:00");
  if(cfg.days.indexOf(dd.getDay())===-1){$("slots").innerHTML='<span class="hint">Não há atendimento nesse dia. Escolha outra data.</span>';return}
  if((cfg.blockedDates||[]).indexOf(d)>-1){$("slots").innerHTML='<span class="hint">Essa data está bloqueada. Escolha outra.</span>';return}
  var taken=load().filter(function(b){return b.date===d&&b.status!=="cancelled"}).map(function(b){return b.time});
  var now=new Date(),isToday=d===iso(now);$("slots").innerHTML="";
  cfg.hours.slice().sort().forEach(function(h){var b=document.createElement("button");b.type="button";b.className="slot";b.textContent=h;var parts=h.split(":");var past=isToday&&(parseInt(parts[0],10)<now.getHours()||(parseInt(parts[0],10)===now.getHours()&&parseInt(parts[1],10)<=now.getMinutes()));if(taken.indexOf(h)>-1||past)b.disabled=true;b.onclick=function(){sel=h;document.querySelectorAll(".slot").forEach(function(x){x.classList.remove("on")});b.classList.add("on")};$("slots").appendChild(b)});
  if(!cfg.hours.length)$("slots").innerHTML='<span class="hint">Ainda não há horários configurados.</span>';
}
function show(t,err){var m=$("msg");m.className="msg"+(err?" err":"");m.innerHTML=t;m.style.display="block";m.scrollIntoView({behavior:"smooth",block:"center"})}
function renderList(){var a=load().filter(function(b){return b.date>=iso(new Date())&&b.status!=="cancelled"}).sort(function(x,y){return (x.date+x.time)>(y.date+y.time)?1:-1});$("my").style.display=a.length?"block":"none";$("list").innerHTML="";a.forEach(function(b){var r=document.createElement("div");r.className="it";var t=document.createElement("span");t.textContent=fmt(b.date)+" às "+b.time+" — "+b.service.split(" — ")[0];r.appendChild(t);var c=document.createElement("button");c.textContent="Cancelar";c.onclick=function(){if(!confirm("Cancelar este agendamento neste navegador?"))return;save(load().filter(function(x){return x.id!==b.id}));renderList();drawSlots()};r.appendChild(c);$("list").appendChild(r)})}
if($("go"))$("go").onclick=function(){
  var d=$("dt").value,n=$("nm").value.trim(),p=$("ph").value.replace(/\D/g,""),ad=$("ad").value.trim();
  if(!d)return show("Escolha uma data.",1);if(!sel)return show("Escolha um horário.",1);if(n.length<2)return show("Informe seu nome.",1);if(p.length<10)return show("Informe um WhatsApp válido com DDD.",1);if(ad.length<5)return show("Informe o endereço do atendimento.",1);
  var cfg=settings(),weekday=new Date(d+"T12:00:00").getDay();if(cfg.days.indexOf(weekday)===-1||(cfg.blockedDates||[]).indexOf(d)>-1)return show("Essa data não está disponível. Escolha outra.",1);
  var all=load();if(all.some(function(b){return b.date===d&&b.time===sel&&b.status!=="cancelled"}))return show("Esse horário acabou de ser ocupado. Escolha outro.",1);
  var b={id:Date.now().toString(),date:d,time:sel,service:$("svc").value,name:n,phone:p,addr:ad,status:"pending",createdAt:new Date().toISOString()};all.push(b);save(all);
  var txt="Olá! Gostaria de confirmar meu agendamento:%0A"+"• Serviço: "+encodeURIComponent(b.service)+"%0A• Data: "+fmt(d)+" às "+sel+"%0A• Nome: "+encodeURIComponent(n)+"%0A• Endereço: "+encodeURIComponent(ad);
  show("✨ Agendamento registrado para <b>"+fmt(d)+" às "+sel+"</b>!<br><br>Envie a confirmação pelo WhatsApp para combinar o atendimento:<br><br><a class='btn fill' target='_blank' rel='noopener' href='https://wa.me/"+WHATS+"?text="+txt+"'>Confirmar no WhatsApp</a>");
  renderList();drawSlots();
};
if($("dt")){renderList()}
