import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Search, UserRound, ShoppingBag, Menu, X, Plus, Minus, Heart, Flower2, Sparkles, BookOpen, GraduationCap, NotebookPen, ListChecks, CreditCard, Truck, MessageCircle, Instagram, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/papeleria-hero.jpg";
import agenda from "@/assets/agenda.jpg";
import planner from "@/assets/planner.jpg";
import notas from "@/assets/notas.jpg";
import docente from "@/assets/docente.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Luma · Papelería para tus días" },
    { name: "description", content: "Agendas, planners y papelería creativa. Una propuesta de diseño delicada para organizar tus días e inspirar tus ideas." },
    { property: "og:title", content: "Luma · Papelería para tus días" },
    { property: "og:description", content: "Un universo de agendas, planners y pequeños detalles para tus días." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const categories = [
  { name: "Agendas y planners", color: "bg-sage", icon: BookOpen },
  { name: "Para estudiar", color: "bg-lilac", icon: GraduationCap },
  { name: "Para enseñar", color: "bg-sky", icon: NotebookPen },
  { name: "Blocks de notas", color: "bg-rose", icon: NotebookPen },
  { name: "Listas y organización", color: "bg-butter", icon: ListChecks },
];
const products = [
  { id: 1, name: "Agenda Un día a la vez", subtitle: "Tus planes, a tu ritmo.", image: agenda, category: "Agendas y planners", price: 24500, colors: ["Salvia", "Lila", "Rosa"], badge: "La favorita", badgeColor: "bg-butter" },
  { id: 2, name: "Planner Mi semana", subtitle: "Un lugar para cada pendiente.", image: planner, category: "Agendas y planners", price: 12500, colors: ["Lila", "Salvia"], badge: "Sin fechas", badgeColor: "bg-lilac" },
  { id: 3, name: "Block Ideas bonitas", subtitle: "Que ninguna idea se te escape.", image: notas, category: "Blocks de notas", price: 6800, colors: ["Rosa", "Azul", "Salvia"], badge: "", badgeColor: "bg-rose" },
  { id: 4, name: "Planificador Enseñar", subtitle: "Inspirar empieza con un plan.", image: docente, category: "Para enseñar", price: 21900, colors: ["Azul", "Lila"], badge: "Para docentes", badgeColor: "bg-sky" },
  { id: 5, name: "Checklist de estudio", subtitle: "Pequeños pasos, grandes logros.", image: planner, category: "Para estudiar", price: 7500, colors: ["Lila", "Salvia"], badge: "", badgeColor: "bg-lilac" },
  { id: 6, name: "Lista Mis pendientes", subtitle: "Todo en su lugar.", image: notas, category: "Listas y organización", price: 6200, colors: ["Rosa", "Salvia"], badge: "", badgeColor: "bg-rose" },
];
const swatches: Record<string, string> = { Salvia: "bg-sage", Lila: "bg-lilac", Rosa: "bg-rose", Azul: "bg-sky" };
const money = (n: number) => "$ " + n.toLocaleString("es-AR");
type CartItem = { id: number; color: string; quantity: number };

function Index() {
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [favorites, setFavorites] = useState<number[]>([]);
  const [detail, setDetail] = useState<number | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const count = cart.reduce((sum, p) => sum + p.quantity, 0);
  const visible = products.filter(p => (filter === "Todos" || p.category === filter) && (p.name + p.subtitle).toLowerCase().includes(query.toLowerCase())).slice(0, showAll || query || filter !== "Todos" ? 6 : 4);
  const activeProduct = products.find(p => p.id === detail);
  function browse(category = "Todos") { setFilter(category); setQuery(""); setShowAll(true); setMobileMenu(false); document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" }); }
  function add(id: number) {
    const p = products.find(p => p.id === id); if (!p) return;
    const color = selected[id] || p.colors[0];
    if (!color) return;
    setCart(old => { const exists = old.some(i => i.id === id && i.color === color); return exists ? old.map(i => i.id === id && i.color === color ? { ...i, quantity: i.quantity + 1 } : i) : [...old, { id, color, quantity: 1 }]; });
    setDetail(null); setCartOpen(true);
  }
  const total = cart.reduce((sum, item) => sum + (products.find(p => p.id === item.id)?.price || 0) * item.quantity, 0);
  return <div className="store">
    <div className="announcement"><Flower2 size={14} /><span>Pequeños planes. Grandes posibilidades.</span><Flower2 size={14} /></div>
    <header className="site-header">
      <Button variant="ghost" size="icon" className="mobile-toggle" aria-label="Abrir menú" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></Button>
      <a className="wordmark" href="#" aria-label="Luma, inicio">luma<Flower2 className="logo-flower" /><span>papelería creativa</span></a>
      <nav className={mobileMenu ? "main-nav nav-open" : "main-nav"} aria-label="Menú principal">
        <Button variant="link" onClick={() => browse()}>Todos los productos</Button>
        <Button variant="link" onClick={() => browse("Agendas y planners")}>Agendas & planners</Button>
        <Button variant="link" onClick={() => browse("Para estudiar")}>Estudio</Button>
        <Button variant="link" onClick={() => browse("Para enseñar")}>Docentes</Button>
        <a href="#colecciones" onClick={() => setMobileMenu(false)}>Colecciones</a>
      </nav>
      <div className="header-tools">
        <Button variant="ghost" size="icon" aria-label="Buscar productos" title="Buscar" onClick={() => setSearchOpen(!searchOpen)}><Search /></Button>
        <Button variant="ghost" size="icon" aria-label="Mi cuenta" title="Mi cuenta" onClick={() => setInfo("Mi cuenta")}><UserRound /></Button>
        <Button variant="ghost" size="icon" className="bag-button" aria-label={`Abrir carrito, ${count} productos`} title="Carrito" onClick={() => setCartOpen(true)}><ShoppingBag /><span className="cart-count">{count}</span></Button>
      </div>
    </header>
    {searchOpen && <form className="search-bar" onSubmit={e => { e.preventDefault(); setShowAll(true); document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" }); }}><Search size={18} /><input autoFocus aria-label="Buscar en la tienda" placeholder="¿Qué estás buscando?" value={query} onChange={e => { setQuery(e.target.value); setFilter("Todos"); setShowAll(true); }} /><Button type="submit" variant="ghost">Buscar <ArrowRight /></Button><Button variant="ghost" size="icon" type="button" aria-label="Cerrar búsqueda" onClick={() => { setSearchOpen(false); setQuery(""); }}><X /></Button></form>}
    <main>
      <section className="hero">
        <img className="hero-image" src={hero} alt="Agendas salvia y azul, planner lila y block rosa sobre un escritorio marfil" width={1920} height={1024} fetchPriority="high" />
        <div className="hero-content"><div className="eyebrow"><span className="tiny-line" /> PAPELERÍA PARA TUS DÍAS</div><h1>Organizá tu día,<br />seguí tus <em>sueños.</em></h1><p>Un espacio para tus ideas, tus planes y todo<br className="desktop-break" /> lo lindo que está por venir.</p><Button size="lg" className="hero-cta" onClick={() => browse()}>Ver productos <ArrowRight size={18} /></Button><div className="hero-note"><Heart size={15} /> Diseñada con amor, para acompañarte.</div></div>
        <div className="hero-stamp"><Sparkles size={20} /><span>un día<br />a la vez</span></div>
      </section>
      <section className="category-section section-width" aria-labelledby="category-title"><div className="section-intro"><span className="eyebrow">ENCONTRÁ TU PRÓXIMO FAVORITO</span><h2 id="category-title">Un poquito de orden, mucha inspiración.</h2></div><div className="category-grid">{categories.map(c => <Button key={c.name} variant="ghost" className="category-item" onClick={() => browse(c.name)}><span className={`category-art ${c.color}`}><c.icon strokeWidth={1} /><span className="art-star">✧</span></span><span>{c.name}</span><ArrowRight size={15} /></Button>)}</div></section>
      <section className="products-section section-width" id="productos"><div className="section-heading"><div><span className="eyebrow">ESOS QUE SIEMPRE ELEGÍS</span><h2>{query ? "Resultados de búsqueda" : filter === "Todos" ? "Los más queridos" : filter}</h2></div><Button variant="link" onClick={() => browse()}>Ver todos <ArrowRight /></Button></div><p className="sample-prices">Catálogo de muestra · precios ilustrativos en ARS.</p>
        {(filter !== "Todos" || query) && <Button variant="outline" className="mb-5" onClick={() => { setFilter("Todos"); setQuery(""); }}>Todos los productos <X /></Button>}
        <div className="product-grid">{visible.map(p => <article className="product-card" key={p.id}><div className="product-image-wrap"><Button variant="ghost" className="product-photo-button" onClick={() => setDetail(p.id)} aria-label={`Ver ${p.name}`}><img src={p.image} alt={p.name} width={1024} height={1024} loading="lazy" /></Button>{p.badge && <span className={`product-badge ${p.badgeColor}`}>{p.badge}</span>}<Button variant="ghost" size="icon" className="favorite-button" aria-label={`${favorites.includes(p.id) ? "Quitar" : "Guardar"} ${p.name} en favoritos`} onClick={() => setFavorites(old => old.includes(p.id) ? old.filter(i => i !== p.id) : [...old, p.id])}><Heart className={favorites.includes(p.id) ? "favorite-active" : ""} /></Button></div><h3><Button variant="link" onClick={() => setDetail(p.id)}>{p.name}</Button></h3><p>{p.subtitle}</p><div className="product-bottom"><span className="price">{money(p.price)}</span><div className="swatches">{p.colors.map(c => <Button key={c} variant="ghost" size="icon" aria-label={`${p.name}: ${c}`} aria-pressed={(selected[p.id] || p.colors[0]) === c} title={c} className={`swatch ${swatches[c]} ${(selected[p.id] || p.colors[0]) === c ? "swatch-selected" : ""}`} onClick={() => setSelected(s => ({ ...s, [p.id]: c }))} />)}</div></div><Button variant="outline" className="add-button" onClick={() => add(p.id)}><Plus size={15} /> Agregar al carrito</Button></article>)}</div>{visible.length === 0 && <div className="empty-results">No encontramos productos para “{query}”.<Button variant="link" onClick={() => { setQuery(""); setFilter("Todos"); }}>Ver toda la papelería <ArrowRight /></Button></div>}
      </section>
      <section className="editorial-banner section-width"><div className="editorial-photo"><img src={hero} alt="Papelería pastel para combinar en tu escritorio" width={1920} height={1024} loading="lazy" /></div><div className="editorial-copy"><Sparkles strokeWidth={1} /><span className="eyebrow">MEJOR, JUNTOS</span><h2>Un combo para<br />cada nuevo comienzo.</h2><p>Agendas, planners y pequeños aliados.<br />Elegí los que van con vos.</p><Button variant="outline" onClick={() => browse("Para estudiar")}>Descubrir la selección <ArrowRight /></Button></div></section>
      <section className="collections-section section-width" id="colecciones"><div className="section-intro"><span className="eyebrow">PAPELERÍA QUE TE ACOMPAÑA</span><h2>Para cada versión de vos.</h2></div><div className="collection-grid"><Button variant="ghost" className="collection bg-lilac" onClick={() => browse("Para estudiar")}><GraduationCap strokeWidth={1} /><div><span>IDEAS QUE CRECEN</span><h3>Tu mundo de estudio</h3></div><ArrowRight /></Button><Button variant="ghost" className="collection bg-sky" onClick={() => browse("Para enseñar")}><Flower2 strokeWidth={1} /><div><span>INSPIRAR, CADA DÍA</span><h3>El arte de enseñar</h3></div><ArrowRight /></Button><Button variant="ghost" className="collection bg-sage" onClick={() => browse("Listas y organización")}><ListChecks strokeWidth={1} /><div><span>ESPACIO PARA LO IMPORTANTE</span><h3>Una vida más organizada</h3></div><ArrowRight /></Button></div></section>
      <section className="benefits section-width">{[{ icon: CreditCard, title: "Medios de pago", text: "Consultá las opciones disponibles." }, { icon: Truck, title: "Envíos", text: "Conocé destinos y modalidades." }, { icon: MessageCircle, title: "Atención personalizada", text: "Tus dudas también tienen su espacio." }].map(b => <Button variant="ghost" className="benefit" key={b.title} onClick={() => setInfo(b.title)}><b.icon strokeWidth={1.3} /><div><h3>{b.title}</h3><p>{b.text}</p></div></Button>)}</section>
      <section className="newsletter"><Flower2 strokeWidth={1} /><div><span className="eyebrow">UN POQUITO DE LUMA EN TU CORREO</span><h2>Las cosas lindas se comparten.</h2><p>Nuevas colecciones, ideas y pequeños momentos de inspiración.</p></div><form onSubmit={e => { e.preventDefault(); setNewsletter(true); }}><div className="newsletter-input"><input type="email" required aria-label="Tu correo electrónico" placeholder="Tu correo electrónico" value={email} onChange={e => { setEmail(e.target.value); setNewsletter(false); }} /><Button type="submit" variant="ghost" size="icon" aria-label="Suscribirme"><ArrowRight /></Button></div>{newsletter && <p role="status" className="newsletter-message"><Check size={15} /> Gracias por tu interés. La suscripción real aún no está habilitada.</p>}</form></section>
    </main>
    <footer className="footer section-width"><div className="footer-brand"><a href="#" className="wordmark">luma<Flower2 className="logo-flower" /><span>papelería creativa</span></a><p>Para tus ideas.<br />Para tus días. Para vos.</p></div><div><h4>Explorá</h4><Button variant="link" onClick={() => browse()}>Todos los productos</Button><a href="#colecciones">Colecciones</a><Button variant="link" onClick={() => setInfo("Sobre Luma")}>Sobre Luma</Button></div><div><h4>Te acompañamos</h4>{["Contacto", "Preguntas frecuentes", "Políticas de compra"].map(t => <Button key={t} variant="link" onClick={() => setInfo(t)}>{t}</Button>)}</div><div><h4>Sigamos cerca</h4><Button variant="link" onClick={() => setInfo("Instagram")}><Instagram size={17} /> Instagram</Button><p>Un lugar para inspirarnos.</p></div><div className="footer-bottom"><span>© 2026 Luma · Propuesta de marca y tienda.</span><span>Hecho con intención <Heart size={13} /></span></div></footer>
    {(cartOpen || info || activeProduct) && <div className="modal-backdrop" onClick={() => { setCartOpen(false); setInfo(null); setDetail(null); }}><section role="dialog" aria-modal="true" aria-label={cartOpen ? "Tu carrito" : info || activeProduct?.name} className={cartOpen ? "cart-panel" : "info-modal"} onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon" className="modal-close" aria-label="Cerrar" onClick={() => { setCartOpen(false); setInfo(null); setDetail(null); }}><X /></Button>
      {cartOpen ? <><span className="eyebrow">TUS PRÓXIMOS FAVORITOS</span><h2>Tu carrito <span className="cart-title-count">({count})</span></h2>{!cart.length ? <div className="empty-cart"><ShoppingBag size={42} strokeWidth={1} /><p>Todavía hay espacio para ideas bonitas.</p><Button onClick={() => { setCartOpen(false); browse(); }}>Ver productos <ArrowRight /></Button></div> : <><div className="cart-items">{cart.map(item => { const p = products.find(p => p.id === item.id); if (!p) return null; return <div className="cart-row" key={item.id + item.color}><img src={p.image} alt={p.name} /><div><h3>{p.name}</h3><p>{item.color} · {money(p.price)}</p><div className="quantity"><Button variant="ghost" size="icon" aria-label={`Reducir ${p.name}`} onClick={() => setCart(old => old.map(i => i === item ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0))}><Minus /></Button><span>{item.quantity}</span><Button variant="ghost" size="icon" aria-label={`Aumentar ${p.name}`} onClick={() => setCart(old => old.map(i => i === item ? { ...i, quantity: i.quantity + 1 } : i))}><Plus /></Button></div></div><Button variant="ghost" size="icon" aria-label={`Eliminar ${p.name}`} onClick={() => setCart(old => old.filter(i => i !== item))}><X /></Button></div>; })}</div><div className="cart-total"><span>Subtotal</span><strong>{money(total)}</strong></div><p className="demo-note">Precios ilustrativos. Esta propuesta no procesa pagos ni pedidos.</p><Button className="w-full" onClick={() => { setCartOpen(false); setInfo("Tu selección"); }}>Revisar mi selección <ArrowRight /></Button></>}</> : activeProduct ? <><img className="detail-image" src={activeProduct.image} alt={activeProduct.name} /><span className="eyebrow">{activeProduct.category}</span><h2>{activeProduct.name}</h2><p>{activeProduct.subtitle}</p><p className="detail-price">{money(activeProduct.price)}</p><p>Color: {selected[activeProduct.id] || activeProduct.colors[0]}</p><div className="swatches detail-swatches">{activeProduct.colors.map(c => <Button key={c} variant="ghost" size="icon" className={`swatch ${swatches[c]} ${(selected[activeProduct.id] || activeProduct.colors[0]) === c ? "swatch-selected" : ""}`} aria-label={`Seleccionar ${c}`} onClick={() => setSelected(old => ({ ...old, [activeProduct.id]: c }))} />)}</div><Button className="w-full" onClick={() => add(activeProduct.id)}>Agregar al carrito <Plus /></Button><p className="demo-note">Fotografía y precio de muestra. Las variantes son una propuesta visual.</p></> : <><Flower2 strokeWidth={1} className="info-flower" /><h2>{info}</h2>{info === "Sobre Luma" ? <p>Luma es una propuesta de papelería creativa: un universo de colores suaves y pequeños detalles para darle un lugar a tus ideas.</p> : info === "Tu selección" ? <><p>Tu selección reúne {count} {count === 1 ? "producto" : "productos"}, con un subtotal ilustrativo de {money(total)}.</p><p>Esta tienda es una propuesta visual. Los pedidos y pagos todavía no están habilitados.</p></> : info === "Preguntas frecuentes" ? <><h3>¿Puedo comprar en esta tienda?</h3><p>Por ahora es una propuesta de marca y catálogo; no se realizan ventas.</p><h3>¿Cómo consulto por envíos o pagos?</h3><p>La marca todavía debe confirmar sus canales de contacto y condiciones comerciales.</p></> : <p>{info === "Mi cuenta" ? "Las cuentas de clientes estarán disponibles cuando se habilite la tienda comercial." : info === "Instagram" ? "El perfil oficial de la marca todavía no fue definido." : info === "Contacto" ? "El canal de contacto de la marca todavía no fue definido." : info === "Políticas de compra" ? "Las políticas de compra, cambios y devoluciones deben ser confirmadas por la marca antes de iniciar las ventas." : `La información sobre ${info?.toLowerCase()} será confirmada por la marca antes de habilitar las compras.`}</p>}</>}
    </section></div>}
  </div>;
}
