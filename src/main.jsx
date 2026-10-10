import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowRight, Check, Clock3, Instagram, Menu, MessageCircle, Sparkles, X } from 'lucide-react'
import './styles.css'

const WHATSAPP_NUMBER = '5562999999999' // Troque pelo número real com código do país e DDD.
const services = [
  { n: '01', name: 'Design de sobrancelhas', desc: 'Formato personalizado que respeita seus traços naturais.', time: '30 min', price: 'R$ 35' },
  { n: '02', name: 'Design com henna', desc: 'Definição e preenchimento suave para um olhar marcante.', time: '45 min', price: 'R$ 50' },
  { n: '03', name: 'Brow lamination', desc: 'Fios alinhados, volume e acabamento contemporâneo.', time: '60 min', price: 'R$ 90' },
]
const photos = [
  { src: 'https://images.unsplash.com/photo-1583001809873-a128495da465?auto=format&fit=crop&w=900&q=85', label: 'Beleza natural' },
  { src: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=85', label: 'Cuidado em cada detalhe' },
  { src: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=900&q=85', label: 'Seu momento' },
]
function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({ name: '', service: services[0].name, date: '', time: '' })
  const [sent, setSent] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target) }
    }), { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  const book = (e) => {
    e.preventDefault()
    const text = `Olá! Gostaria de agendar um horário na Essência do Olhar.\nNome: ${form.name}\nServiço: ${form.service}\nData desejada: ${form.date || 'A combinar'}\nHorário: ${form.time || 'A combinar'}`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    setSent(true)
  }
  const closeMenu = () => setMenuOpen(false)
  return <div className="site-shell">
    <div className="announcement"><Sparkles size={13}/> Realce sua beleza sem perder sua essência <span>·</span> Agendamentos abertos</div>
    <header className="header">
      <a className="brand" href="#inicio" onClick={closeMenu}><span className="brand-mark">E<span>·</span>O</span><span className="brand-name">ESSÊNCIA <small>DO OLHAR</small></span></a>
      <button className="menu-toggle" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
      <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
        <a href="#sobre" onClick={closeMenu}>A essência</a><a href="#servicos" onClick={closeMenu}>Serviços</a><a href="#resultados" onClick={closeMenu}>Galeria</a><a href="#contato" onClick={closeMenu}>Contato</a>
        <a className="nav-cta" href="#agendar" onClick={closeMenu}>Agendar horário <ArrowRight size={15}/></a>
      </nav>
    </header>
    <main>
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <div className="eyebrow"><span/> BELEZA QUE COMEÇA EM VOCÊ</div>
          <h1>Seu olhar.<br/>Sua <em>essência.</em></h1>
          <p className="hero-lede">Sobrancelhas que valorizam quem você é — com delicadeza, técnica e atenção a cada detalhe.</p>
          <div className="hero-actions"><a className="button button-dark" href="#agendar">Agende seu momento <ArrowRight size={16}/></a><a className="text-link" href="#servicos">Conheça os serviços <ArrowDown size={15}/></a></div>
          <div className="hero-note"><div className="note-stars">✳ ✳ ✳</div><p><strong>Beleza com intenção.</strong><br/>Cuidado pensado para você.</p></div>
        </div>
        <div className="hero-art">
          <div className="hero-photo"><img src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1200&q=90" alt="Retrato feminino delicado em tons naturais"/></div>
          <div className="photo-stamp"><span>REALCE</span><span>SUA BELEZA</span><b>✳</b></div>
          <div className="hero-caption"><span className="caption-line"></span><span>O detalhe faz toda a diferença.</span></div>
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
        </div>
        <div className="hero-side-label">BELEZA NATURAL · CUIDADO INDIVIDUAL</div>
      </section>
      <section className="intro section-pad" id="sobre">
        <div className="section-kicker reveal">01 — NOSSA ESSÊNCIA</div>
        <div className="intro-grid">
          <h2 className="reveal">A beleza não precisa<br/>ser transformada.<br/><em>Ela precisa ser revelada.</em></h2>
          <div className="intro-text reveal"><p>Acreditamos que cada olhar conta uma história. Nosso trabalho é encontrar o equilíbrio entre técnica e naturalidade para destacar aquilo que já torna você única.</p><a href="#agendar" className="under-link">Vamos cuidar de você <ArrowRight size={15}/></a></div>
        </div>
        <div className="values-row reveal"><div><span>01</span><p>Design personalizado</p></div><div><span>02</span><p>Delicadeza em cada traço</p></div><div><span>03</span><p>Seu estilo, sua identidade</p></div></div>
      </section>
      <section className="services section-pad" id="servicos">
        <div className="section-top reveal"><div><div className="section-kicker">02 — RITUAIS DE BELEZA</div><h2>Um cuidado feito<br/><em>para você.</em></h2></div><p>Escolha seu momento. Cada atendimento é pensado para respeitar seus traços e valorizar sua beleza natural.</p></div>
        <div className="service-list">{services.map(s => <article className="service-card reveal" key={s.n}><span className="service-number">{s.n}</span><div className="service-info"><h3>{s.name}</h3><p>{s.desc}</p><span className="service-time"><Clock3 size={13}/>{s.time}</span></div><div className="service-end"><strong>{s.price}</strong><a href="#agendar" aria-label={'Agendar '+s.name}><ArrowRight size={19}/></a></div></article>)}</div>
        <p className="service-footnote">* Valores ilustrativos — personalize conforme seus serviços.</p>
      </section>
      <section className="gallery section-pad" id="resultados">
        <div className="gallery-heading reveal"><div><div className="section-kicker">03 — NOSSO OLHAR</div><h2>Beleza nos <em>detalhes.</em></h2></div><p>Uma pausa na rotina para se sentir bem na própria pele.</p></div>
        <div className="gallery-grid">{photos.map((p,i)=><figure className={'gallery-item gallery-item-'+(i+1)+' reveal'} key={p.label}><img src={p.src} alt={p.label} loading="lazy"/><figcaption><span>0{i+1}</span>{p.label}</figcaption></figure>)}</div>
      </section>
      <section className="quote-band"><span className="quote-symbol">“</span><p>Quando você se sente bem consigo,<br/>isso aparece em cada detalhe.</p><span className="quote-bottom">ESSÊNCIA DO OLHAR · SEU MOMENTO</span></section>
      <section className="booking section-pad" id="agendar">
        <div className="booking-copy reveal"><div className="section-kicker">04 — SEU MOMENTO COMEÇA AQUI</div><h2>Vamos realçar<br/>o seu <em>olhar?</em></h2><p>Escolha o serviço e conte para nós qual horário funciona melhor para você. Vamos confirmar seu agendamento pelo WhatsApp.</p><div className="booking-perk"><span><Check size={15}/></span> Atendimento com hora marcada</div><div className="booking-perk"><span><Check size={15}/></span> Cuidado individualizado</div></div>
        <form className="booking-form reveal" onSubmit={book}><div className="form-title"><span>AGENDE ONLINE</span><span className="form-flower">✳</span></div><label>Seu nome<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Como podemos te chamar?"/></label><label>Escolha seu serviço<select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}>{services.map(s=><option key={s.n}>{s.name}</option>)}</select></label><div className="form-row"><label>Data desejada<input type="date" min={new Date().toISOString().slice(0,10)} value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label><label>Horário preferido<select value={form.time} onChange={e=>setForm({...form,time:e.target.value})}><option value="">A combinar</option>{['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'].map(t=><option key={t}>{t}</option>)}</select></label></div><button className="button button-dark submit-button" type="submit">Solicitar agendamento <ArrowRight size={16}/></button><p className="form-privacy"><MessageCircle size={13}/> Você será direcionada ao WhatsApp para confirmar.</p>{sent&&<p className="sent-note">Se o WhatsApp não abriu, confira o número configurado no projeto.</p>}</form>
      </section>
    </main>
    <footer className="footer" id="contato"><div className="footer-top"><a className="brand brand-footer" href="#inicio"><span className="brand-mark">E<span>·</span>O</span><span className="brand-name">ESSÊNCIA <small>DO OLHAR</small></span></a><p>Beleza em cada detalhe.<br/>Leveza em cada escolha.</p><a className="social-link" href="https://instagram.com/" target="_blank" rel="noreferrer"><Instagram size={17}/> Acompanhe no Instagram <ArrowRight size={14}/></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Essência do Olhar</span><span>Feito com delicadeza <b>✳</b></span><a href="#inicio">Voltar ao topo ↑</a></div></footer>
    <a className="whatsapp-float" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" aria-label="Abrir WhatsApp"><MessageCircle size={22}/></a>
  </div>
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
