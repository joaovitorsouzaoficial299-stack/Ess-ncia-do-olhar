// Essência do Olhar — agendamentos centralizados no Supabase
var WHATS="5562993150343";
var SUPABASE_URL="https://vhqusyacchddrlgusysh.supabase.co";
var SUPABASE_KEY="sb_publishable_kk6H1ZAhmr7gO4r7CJiQJA_iuQiZ_x0";
var db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
var LOCAL_BOOKINGS="essencia_my_bookings_v2";
var serviceDefaults=[
{id:"design",name:"Design simples",description:"Mapeamento e retirada dos fios com acabamento delicado.",price:45,duration:40},
{id:"henna",name:"Design com henna",description:"Design personalizado com preenchimento em henna para mais definição.",price:70,duration:60},
{id:"lamination",name:"Brow lamination",description:"Fios alinhados e volumosos com efeito natural e duradouro.",price:120,duration:60}
];
var $=function(i){return document.getElementById(i)};
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function fmt(d){var p=String(d||"").split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:d}
function escapeText(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function money(v){return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:2})}
function localBookings(){try{return JSON.parse(localStorage.getItem(LOCAL_BOOKINGS)||"[]")}catch(e){return []}}
function saveLocalBookings(a){localStorage.setItem(LOCAL_BOOKINGS,JSON.stringify(a))}
var cfg={schedule:{},blockedDates:[],services:serviceDefaults},sel=null,selectedHenna=null,bookedSlots=[],wizardStep=1;
var hennaOptions=[{name:"Castanho claro",color:"#9a6b45"},{name:"Castanho médio",color:"#70452f"},{name:"Castanho escuro",color:"#4b2c20"},{name:"Preto",color:"#211b18"}];
async function loadSiteData(){
 try{
  var results=await Promise.all([db.from("services").select("id,name,description,price,duration,active").eq("active",true).order("name"),db.from("site_settings").select("schedule,blocked_dates").eq("id",1).maybeSingle()]);
  if(results[0].error)throw results[0].error;
  if(results[1].error)throw results[1].error;
  if(results[0].data&&results[0].data.length)cfg.services=results[0].data;
  if(results[1].data){cfg.schedule=results[1].data.schedule||{};cfg.blockedDates=results[1].data.blocked_dates||[]}
  renderServices();renderHenna();if($("dt")&&$("dt").value)drawSlots();updateWizardSummary();
 }catch(e){show("Não foi possível carregar os horários agora. Atualize a página ou tente novamente em instantes.",true)}
}
function renderServices(){
 var services=cfg.services||serviceDefaults,select=$("svc"),cards=$("serviceCards"),previous=select&&select.value;
 if(select){select.innerHTML="";services.forEach(function(s){var o=document.createElement("option");o.value=s.id;o.textContent=s.name+" — "+money(s.price);select.appendChild(o)});if(Array.from(select.options).some(function(o){return o.value===previous}))select.value=previous}
 if(cards){cards.innerHTML="";services.forEach(function(s,i){var card=document.createElement("div");card.className="card in"+(i===1?" d1":i===2?" d2":"");var h=document.createElement("h3"),p=document.createElement("p"),price=document.createElement("span"),duration=document.createElement("small");h.textContent=s.name;p.textContent=s.description||"";price.className="pr";price.textContent=money(s.price);duration.textContent=(Number(s.duration)||30)+" min";[h,p,price,duration].forEach(function(el){card.appendChild(el)});cards.appendChild(card)})}
}
function selectedService(){return (cfg.services||[]).find(function(s){return s.id===$("svc").value})||null}
function renderHenna(){
 var picker=$("hennaPicker"),root=$("hennaColors"),service=selectedService();if(!picker||!root)return;
 var needs=service&&/henna/i.test(service.name);picker.style.display=needs?"block":"none";root.innerHTML="";
 if(!needs){selectedHenna=null;if($("hennaSelected"))$("hennaSelected").textContent="";return}
 hennaOptions.forEach(function(item){var button=document.createElement("button");button.type="button";button.className="henna-choice"+(selectedHenna===item.name?" chosen":"");button.setAttribute("aria-pressed",selectedHenna===item.name?"true":"false");var circle=document.createElement("span"),name=document.createElement("span");circle.className="henna-circle";circle.style.backgroundColor=item.color;circle.textContent=item.name;name.className="henna-name";name.textContent=item.name;button.appendChild(circle);button.appendChild(name);button.onclick=function(){selectedHenna=item.name;renderHenna();updateWizardSummary()};root.appendChild(button)});
 $("hennaSelected").textContent=selectedHenna?"Cor escolhida: "+selectedHenna:"Escolha uma cor acima.";
}
function escapeWizardText(value){return escapeText(value)}
function updateWizardSummary(){
 var root=$("bookingSummary");if(!root)return;var service=selectedService(),date=$("dt"),parts=['<span class="summary-label">Resumo do seu cuidado</span>'];
 parts.push('<span><strong>Serviço:</strong> '+escapeWizardText(service?service.name+" — "+money(service.price):"A escolher")+'</span>');
 if(service&&/henna/i.test(service.name))parts.push('<span><strong>Henna:</strong> '+escapeWizardText(selectedHenna||"Selecione uma cor")+'</span>');
 parts.push('<span><strong>Data:</strong> '+(date&&date.value?fmt(date.value):"A escolher")+'</span>');
 parts.push('<span><strong>Horário:</strong> '+escapeWizardText(sel||"A escolher")+'</span>');root.innerHTML=parts.join("");
}
function show(t,err){var m=$("msg");if(!m)return;m.className="msg"+(err?" err":"");m.innerHTML=t;m.style.display="block";m.scrollIntoView({behavior:"smooth",block:"center"})}
function goWizardStep(next){
 var service=selectedService();
 if(next===2){if(!service)return show("Escolha um serviço para continuar.",true);if(/henna/i.test(service.name)&&!selectedHenna)return show("Escolha a cor da henna para continuar.",true)}
 if(next===3){if(!$("dt").value)return show("Escolha uma data para continuar.",true);if(!sel)return show("Escolha um horário disponível para continuar.",true)}
 wizardStep=next;document.querySelectorAll("[data-wizard-step]").forEach(function(panel){var active=Number(panel.getAttribute("data-wizard-step"))===next;panel.hidden=!active;panel.classList.toggle("active",active);if(active){panel.style.animation="none";void panel.offsetWidth;panel.style.animation=""}});
 document.querySelectorAll("[data-step-dot]").forEach(function(dot){var n=Number(dot.getAttribute("data-step-dot"));dot.classList.toggle("active",n===next);dot.classList.toggle("done",n<next)});
 if($("stepLabel"))$("stepLabel").textContent="ETAPA 0"+next+" DE 03";if($("stepPercent"))$("stepPercent").textContent=Math.round(next/3*100)+"%";if($("stepBar"))$("stepBar").style.width=(next/3*100)+"%";if($("msg"))$("msg").style.display="none";updateWizardSummary();var book=$("bookingWizard");if(book)book.scrollIntoView({behavior:"smooth",block:"start"});
}
async function drawSlots(){
 var date=$("dt").value;sel=null;bookedSlots=[];
 if(!date){$("slots").innerHTML='<span class="hint">Selecione uma data para ver os horários disponíveis.</span>';updateWizardSummary();return}
 var day=new Date(date+"T12:00:00").getDay(),dayCfg=(cfg.schedule||{})[day];
 if(!dayCfg||!dayCfg.enabled||((cfg.blockedDates||[]).indexOf(date)>-1)){$("slots").innerHTML='<span class="hint">Não há atendimento nessa data. Escolha outra data.</span>';updateWizardSummary();return}
 try{var res=await db.rpc("get_booked_slots",{p_booking_date:date});if(res.error)throw res.error;bookedSlots=Array.isArray(res.data)?res.data:[]}catch(e){$("slots").innerHTML='<span class="hint">Não foi possível consultar os horários. Tente novamente.</span>';return}
 var now=new Date(),isToday=date===iso(now),hours=(dayCfg.hours||[]).slice().sort(),service=selectedService();
 $("slots").innerHTML="";
 hours.forEach(function(h){
  var b=document.createElement("button");b.type="button";b.className="slot";b.textContent=h;
  var parts=h.split(":"),start=parseInt(parts[0],10)*60+parseInt(parts[1],10),duration=service?Number(service.duration)||30:30;
  var past=isToday&&(start<=now.getHours()*60+now.getMinutes());
  var conflict=bookedSlots.some(function(x){var p=String(x.time).split(":");var other=parseInt(p[0],10)*60+parseInt(p[1],10);return start<other+Number(x.duration||30)&&other<start+duration});
  var endOfDay=start+duration>18*60;
  if(conflict||past||endOfDay){b.disabled=true;b.title=conflict?"Horário indisponível":past?"Horário que já passou":"O serviço ultrapassa o horário de atendimento"}
  b.onclick=function(){sel=h;document.querySelectorAll(".slot").forEach(function(x){x.classList.remove("on")});b.classList.add("on");updateWizardSummary()};
  $("slots").appendChild(b);
 });
 if(!hours.length)$("slots").innerHTML='<span class="hint">Ainda não há horários liberados para esse dia. Entre em contato para consultar disponibilidade.</span>';
 updateWizardSummary();
}
function renderList(){
 var a=localBookings().filter(function(b){return b.date>=iso(new Date())&&b.status!=="cancelled"}).sort(function(x,y){return (x.date+x.time).localeCompare(y.date+y.time)});
 $("my").style.display=a.length?"block":"none";$("list").innerHTML="";
 a.forEach(function(b){var r=document.createElement("div");r.className="it";var t=document.createElement("span");t.textContent=fmt(b.date)+" às "+b.time+" — "+b.service;r.appendChild(t);
 var c=document.createElement("button");c.textContent="Cancelar";c.onclick=async function(){if(!confirm("Deseja cancelar este agendamento? Ele ficará registrado como cancelado."))return;c.disabled=true;try{var res=await db.rpc("cancel_booking",{p_booking_id:b.id,p_cancellation_token:b.token});if(res.error)throw res.error;var updated=localBookings().map(function(x){if(x.id===b.id){x.status="cancelled";x.cancelledAt=new Date().toISOString()}return x});saveLocalBookings(updated);renderList();await drawSlots();show("Seu agendamento foi cancelado. A profissional verá o status de cancelado no painel.");}catch(e){c.disabled=false;show("Não foi possível cancelar. Verifique se esse agendamento já foi cancelado e tente novamente.",true)}};r.appendChild(c);$("list").appendChild(r)});
}
document.querySelectorAll("[data-next]").forEach(function(button){button.addEventListener("click",function(){goWizardStep(Number(button.getAttribute("data-next")))});});
document.querySelectorAll("[data-back]").forEach(function(button){button.addEventListener("click",function(){goWizardStep(Number(button.getAttribute("data-back")))});});
if($("svc"))$("svc").addEventListener("change",function(){renderHenna();updateWizardSummary();if($("dt").value)drawSlots()});
if($("dt")){$("dt").min=iso(new Date());$("dt").addEventListener("change",function(){drawSlots();updateWizardSummary()});$("dt").addEventListener("input",drawSlots)}
if($("go"))$("go").onclick=async function(){
 var d=$("dt").value,n=$("nm").value.trim(),service=selectedService();
 if(!d)return show("Escolha uma data.",true);if(!sel)return show("Escolha um horário disponível.",true);if(!service)return show("Escolha um serviço.",true);if(/henna/i.test(service.name)&&!selectedHenna)return show("Escolha a cor da henna.",true);if(n.length<2)return show("Informe seu nome.",true);
 var dayCfg=(cfg.schedule||{})[new Date(d+"T12:00:00").getDay()];
 if(!dayCfg||!dayCfg.enabled||(dayCfg.hours||[]).indexOf(sel)<0||(cfg.blockedDates||[]).indexOf(d)>-1)return show("Esse dia ou horário não está disponível. Escolha outra opção.",true);
 var button=$("go");button.disabled=true;
 try{
  var res=await db.rpc("create_booking",{p_customer_name:n,p_whatsapp:"",p_service_id:service.id,p_booking_date:d,p_booking_time:sel,p_henna_color:/henna/i.test(service.name)?selectedHenna:null});
  if(res.error)throw res.error;var data=res.data;if(Array.isArray(data))data=data[0];if(!data||!data.id||!data.cancellation_token)throw new Error("Não foi possível confirmar o agendamento.");
  var b={id:data.id,token:data.cancellation_token,date:d,time:sel,service:service.name,name:n,hennaColor:/henna/i.test(service.name)?selectedHenna:"",status:"scheduled",createdAt:new Date().toISOString()};
  var all=localBookings();all.push(b);saveLocalBookings(all);
  var txt="Olá! Gostaria de confirmar meu agendamento:%0A• Serviço: "+encodeURIComponent(service.name)+"%0A• Valor: "+encodeURIComponent(money(service.price))+(b.hennaColor?"%0A• Cor da henna: "+encodeURIComponent(b.hennaColor):"")+"%0A• Data: "+fmt(d)+" às "+sel+"%0A• Nome: "+encodeURIComponent(n);
  show("✨ Seu agendamento foi registrado!<br><br><strong>"+fmt(d)+" às "+sel+"</strong><br><br>Envie a mensagem pelo WhatsApp para combinar o atendimento:<br><br><a class='btn fill' target='_blank' rel='noopener' href='https://wa.me/"+WHATS+"?text="+txt+"'>Confirmar no WhatsApp</a>");
  renderList();await drawSlots();
 }catch(e){show(escapeText(e.message||"Não foi possível registrar esse horário. Escolha outro e tente novamente."),true);await drawSlots()}
 finally{button.disabled=false}
};
window.addEventListener("scroll",function(){var nav=$("nav");if(nav)nav.classList.toggle("s",scrollY>40);var sparkleLayer=$("sp");if(sparkleLayer&&scrollY<window.innerHeight)sparkleLayer.style.translate="0 "+(scrollY*.045)+"px"},{passive:true});
if($("yr"))$("yr").textContent=new Date().getFullYear();
if($("sp")){for(var i=0;i<26;i++){var s=document.createElement("i");s.className="spark";s.style.cssText="left:"+Math.random()*100+"%;top:"+Math.random()*100+"%;animation-delay:"+Math.random()*4+"s;animation-duration:"+(3+Math.random()*3)+"s";$("sp").appendChild(s)}$("sp").style.cssText="position:absolute;inset:0;pointer-events:none"}
if("IntersectionObserver"in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.15});document.querySelectorAll(".rv").forEach(function(e){io.observe(e)})}else{document.querySelectorAll(".rv").forEach(function(e){e.classList.add("in")})}
loadSiteData();renderList();
