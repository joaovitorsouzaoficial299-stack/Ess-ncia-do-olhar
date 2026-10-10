// ===== Config (edite aqui) =====
var WHATS="5511999999999";            // número da profissional com DDI+DDD
var HOURS=["09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00"];
var KEY="brow_bookings_v1";

function load(){try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []}}
function save(a){try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}}
var $=function(i){return document.getElementById(i)};
var sel=null;

// nav + faíscas
window.addEventListener("scroll",function(){$("nav").classList.toggle("s",scrollY>40)});
$("yr").textContent=new Date().getFullYear();
for(var i=0;i<26;i++){var s=document.createElement("i");s.className="spark";s.style.cssText="left:"+Math.random()*100+"%;top:"+Math.random()*100+"%;animation-delay:"+Math.random()*4+"s;animation-duration:"+(3+Math.random()*3)+"s";$("sp").appendChild(s)}
$("sp").style.cssText="position:absolute;inset:0;pointer-events:none";

// revelar ao rolar
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.15});
document.querySelectorAll(".rv").forEach(function(e){io.observe(e)});

// data mínima = hoje
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
var today=new Date();$("dt").min=iso(today);

function fmt(d){var p=d.split("-");return p[2]+"/"+p[1]+"/"+p[0]}
function drawSlots(){
  var d=$("dt").value;sel=null;
  if(!d){$("slots").innerHTML='<span class="hint">Selecione uma data.</span>';return}
  var dd=new Date(d+"T12:00:00");
  if(dd.getDay()===0){$("slots").innerHTML='<span class="hint">Domingo não atendemos. Escolha outro dia.</span>';return}
  var taken=load().filter(function(b){return b.date===d}).map(function(b){return b.time});
  var now=new Date(),isToday=d===iso(now);
  $("slots").innerHTML="";
  HOURS.forEach(function(h){
    var b=document.createElement("button");b.type="button";b.className="slot";b.textContent=h;
    var past=isToday&&parseInt(h)<=now.getHours();
    if(taken.indexOf(h)>-1||past)b.disabled=true;
    b.onclick=function(){sel=h;document.querySelectorAll(".slot").forEach(function(x){x.classList.remove("on")});b.classList.add("on")};
    $("slots").appendChild(b);
  });
}
$("dt").addEventListener("change",drawSlots);

function show(t,err){var m=$("msg");m.className="msg"+(err?" err":"");m.innerHTML=t;m.style.display="block";m.scrollIntoView({behavior:"smooth",block:"center"})}

function renderList(){
  var a=load().filter(function(b){return b.date>=iso(new Date())}).sort(function(x,y){return (x.date+x.time)>(y.date+y.time)?1:-1});
  $("my").style.display=a.length?"block":"none";
  $("list").innerHTML="";
  a.forEach(function(b){
    var r=document.createElement("div");r.className="it";
    r.innerHTML="<span>"+fmt(b.date)+" às "+b.time+" — "+b.service.split(" — ")[0]+"</span>";
    var c=document.createElement("button");c.textContent="Cancelar";
    c.onclick=function(){save(load().filter(function(x){return x.id!==b.id}));renderList();drawSlots()};
    r.appendChild(c);$("list").appendChild(r);
  });
}

$("go").onclick=function(){
  var d=$("dt").value,n=$("nm").value.trim(),p=$("ph").value.replace(/\D/g,""),ad=$("ad").value.trim();
  if(!d)return show("Escolha uma data.",1);
  if(!sel)return show("Escolha um horário.",1);
  if(n.length<2)return show("Informe seu nome.",1);
  if(p.length<10)return show("Informe um WhatsApp válido com DDD.",1);
  if(ad.length<5)return show("Informe o endereço do atendimento.",1);
  var all=load();
  if(all.some(function(b){return b.date===d&&b.time===sel}))return show("Esse horário acabou de ser ocupado. Escolha outro.",1);
  var b={id:Date.now(),date:d,time:sel,service:$("svc").value,name:n,phone:p,addr:ad};
  all.push(b);save(all);
  var txt="Olá! Gostaria de confirmar meu agendamento:%0A"+
    "• Serviço: "+encodeURIComponent(b.service)+"%0A• Data: "+fmt(d)+" às "+sel+"%0A• Nome: "+encodeURIComponent(n)+"%0A• Endereço: "+encodeURIComponent(ad);
  show("✨ Agendamento registrado para <b>"+fmt(d)+" às "+sel+"</b>!<br><br>Envie a confirmação pelo WhatsApp para garantir seu horário:<br><br><a class='btn fill' target='_blank' rel='noopener' href='https://wa.me/"+WHATS+"?text="+txt+"'>Confirmar no WhatsApp</a>");
  renderList();drawSlots();
};
renderList();
