"use client";

import { AnimatePresence, motion } from "motion/react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Camera,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  categories,
  formatPrice,
  Product,
  whatsappUrl,
} from "./catalog-data";
import { useCatalogProducts } from "./shop-ui";

type CartItem = { product: Product; quantity: number; variant: string };

const generalWhatsApp = whatsappUrl(
  "Hola Lunara Boutique, quisiera consultar por sus productos.",
);

export function Storefront() {
  const liveProducts = useCatalogProducts();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeFaq, setActiveFaq] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem("lunara-cart-v1");
    if (stored) {
      try {
        const savedCart = JSON.parse(stored);
        queueMicrotask(() => setCart(savedCart));
      } catch {
        window.localStorage.removeItem("lunara-cart-v1");
      }
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lunara-cart-v1", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, cartOpen]);

  const units = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
    0,
  );

  const addToCart = (product: Product, variant?: string) => {
    if (product.price === null) {
      window.open(
        whatsappUrl(
          `Hola Lunara Boutique, quisiera consultar precio y disponibilidad de ${product.name}.`,
        ),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    const selectedVariant = variant ?? product.variants[0] ?? "Única";
    setCart((current) => {
      const index = current.findIndex(
        (item) =>
          item.product.id === product.id && item.variant === selectedVariant,
      );
      if (index === -1) {
        return [...current, { product, quantity: 1, variant: selectedVariant }];
      }
      return current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity: item.quantity + 1 } : item,
      );
    });
    setCartOpen(true);
  };

  const changeQuantity = (index: number, change: number) => {
    setCart((current) =>
      current
        .map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const checkoutMessage = useMemo(() => {
    const lines = cart.map((item) => {
      const unit = formatPrice(item.product.price);
      const subtotal = formatPrice((item.product.price ?? 0) * item.quantity);
      return `${item.quantity} x ${item.product.name} — ${item.variant} — ${unit} — ${subtotal}`;
    });
    return [
      "NUEVO PEDIDO — LUNARA BOUTIQUE",
      "",
      ...lines,
      "",
      `TOTAL: ${formatPrice(total)}`,
      "",
      "Quisiera confirmar el pedido y coordinar pago, entrega o envío.",
    ].join("\n");
  }, [cart, total]);

  const navItems = [
    ["Inicio", "#inicio"],
    ["Productos", "/productos"],
    ["Categorías", "#categorias"],
    ["Preguntas frecuentes", "#preguntas"],
    ["Contacto", "#contacto"],
  ];

  const faqs = [
    {
      q: "¿Qué productos ofrece Lunara Boutique?",
      a: "Lunara es una boutique de moda con ropa importada y nacional, además de carteras y accesorios.",
    },
    {
      q: "¿Trabajan con prendas importadas?",
      a: "Sí. El perfil publica ropa importada y nacional; entre los ingresos confirmados hay prendas de Bershka.",
    },
    {
      q: "¿Dónde se encuentra el negocio?",
      a: "Lunara Boutique informa que se encuentra en Puerto Rico, Misiones. No se publicó una dirección exacta en las fuentes disponibles.",
    },
    {
      q: "¿Cómo consulto talles y disponibilidad?",
      a: "Podés consultar cada producto por WhatsApp. El mensaje se completa automáticamente con el nombre de la prenda.",
    },
    {
      q: "¿Cómo finalizo un pedido?",
      a: "Agregá productos con precio al carrito y enviá el detalle por WhatsApp para confirmar disponibilidad y coordinar los pasos siguientes.",
    },
  ];

  return (
    <main>
      <div className="info-bar">
        <span>Puerto Rico, Misiones</span>
        <span>Ropa importada y nacional</span>
        <span>Carteras y accesorios</span>
      </div>

      <header className={`navbar ${scrolled ? "navbar-solid" : ""}`}>
        <Link className="brand" href="#inicio" aria-label="Ir al inicio">
          <img src="/logo-lunara.png" alt="Logo de Lunara Boutique" />
          <span>Lunara Boutique</span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegación principal">
          {navItems.map(([label, href]) => (
            <Link href={href} key={label}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link className="icon-button desktop-only" href="/productos" aria-label="Buscar productos">
            <Search size={19} />
          </Link>
          <button className="icon-button" onClick={() => setCartOpen(true)} aria-label={`Abrir carrito, ${units} unidades`}>
            <ShoppingBag size={19} />
            {units > 0 && <span className="cart-count">{units}</span>}
          </button>
          <a className="whatsapp-button desktop-only" href={generalWhatsApp} target="_blank" rel="noreferrer">
            <MessageCircle size={18} /> Consultar
          </a>
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <Menu size={21} />
          </button>
        </div>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-art" aria-hidden="true">
          <img src="/lunara-hero-bg.webp" alt="" />
        </div>
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="hero-moon">☾</span>
          <h1>Moda femenina para encontrar tu próximo favorito.</h1>
          <p>
            Ropa importada y nacional, carteras y accesorios seleccionados por
            Lunara Boutique en Puerto Rico, Misiones.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/productos">
              Ver catálogo <ArrowRight size={18} />
            </Link>
            <a className="text-button" href={generalWhatsApp} target="_blank" rel="noreferrer">
              Consultar por WhatsApp <ChevronRight size={18} />
            </a>
          </div>
        </motion.div>
      </section>

      <CategorySection />

      <section className="section products-section" id="productos">
        <div className="section-heading">
          <div>
            <h2>Selección destacada</h2>
            <p>Ingresos publicados y productos de muestra para recorrer la tienda.</p>
          </div>
          <Link className="text-button" href="/productos">
            Ver todo <ArrowRight size={18} />
          </Link>
        </div>
        <ProductCarousel products={liveProducts.filter((product) => product.featured || product.new)} onAdd={addToCart} />
      </section>

      <section className="section trust-section">
        <div className="section-heading narrow-heading">
          <div>
            <h2>Elegí con información clara</h2>
            <p>Una forma simple de descubrir prendas y consultar cada detalle.</p>
          </div>
        </div>
        <div className="trust-grid">
          <article>
            <Sparkles />
            <h3>Moda importada y nacional</h3>
            <p>Un catálogo que reúne ambos tipos de prendas, más carteras y accesorios.</p>
          </article>
          <article>
            <MessageCircle />
            <h3>Consulta contextual</h3>
            <p>Cada botón de WhatsApp incluye el producto por el que estás preguntando.</p>
          </article>
          <article>
            <ShoppingBag />
            <h3>Pedido sin vueltas</h3>
            <p>Armá el carrito y enviá el detalle completo para confirmar el pedido.</p>
          </article>
        </div>
      </section>

      <section className="section new-section">
        <div className="section-heading">
          <div>
            <h2>Nuevos ingresos</h2>
            <p>Prendas recientes para renovar tus combinaciones.</p>
          </div>
        </div>
        <ProductCarousel products={liveProducts.filter((product) => product.new)} onAdd={addToCart} />
      </section>

      <section className="section faq-section" id="preguntas">
        <div className="faq-intro">
          <span>☾</span>
          <h2>Preguntas frecuentes</h2>
          <p>Lo esencial antes de hacer tu consulta.</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => {
            const open = activeFaq === index;
            return (
              <article className={`faq-item ${open ? "open" : ""}`} key={faq.q}>
                <button onClick={() => setActiveFaq(open ? -1 : index)} aria-expanded={open}>
                  <span>{faq.q}</span>
                  <ChevronDown size={20} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </section>

      <section className="final-cta" id="contacto">
        <img src="/logo-lunara.png" alt="Lunara Boutique" />
        <div>
          <h2>¿Encontraste algo para vos?</h2>
          <p>Explorá el catálogo o escribinos para consultar talles y disponibilidad.</p>
        </div>
        <a className="primary-button" href={generalWhatsApp} target="_blank" rel="noreferrer">
          <MessageCircle size={19} /> Hablar por WhatsApp
        </a>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <img src="/logo-lunara.png" alt="Logo de Lunara Boutique" />
          <div>
            <h2>Lunara Boutique</h2>
            <p>Moda femenina, ropa importada y nacional, carteras y accesorios.</p>
          </div>
        </div>
        <div>
          <h3>Navegación</h3>
          <Link href="#inicio">Inicio</Link>
          <Link href="/productos">Productos</Link>
          <Link href="#categorias">Categorías</Link>
          <Link href="#preguntas">Preguntas frecuentes</Link>
        </div>
        <div>
          <h3>Contacto</h3>
          <a href={generalWhatsApp} target="_blank" rel="noreferrer">+54 9 3873 65-8680</a>
          <a href="https://www.instagram.com/lunara.tienda.boutique/" target="_blank" rel="noreferrer">
            <Camera size={17} /> @lunara.tienda.boutique
          </a>
          <span>Puerto Rico, Misiones</span>
        </div>
        <div>
          <h3>Categorías</h3>
          {categories.map((category) => (
            <Link href={`/productos?categoria=${category.slug}`} key={category.slug}>{category.name}</Link>
          ))}
          <Link className="admin-link" href="/admin">Administración</Link>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Lunara Boutique</p>
      </footer>

      <AnimatePresence>
        {scrolled && (
          <motion.a
            className="floating-whatsapp"
            href={generalWhatsApp}
            target="_blank"
            rel="noreferrer"
            aria-label="Consultar por WhatsApp"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <MessageCircle />
          </motion.a>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-menu" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
            <div className="mobile-menu-head">
              <Link className="brand" href="#inicio" onClick={() => setMenuOpen(false)}>
                <img src="/logo-lunara.png" alt="" />
                <span>Lunara Boutique</span>
              </Link>
              <button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><X /></button>
            </div>
            <nav>
              {navItems.map(([label, href]) => (
                <Link href={href} key={label} onClick={() => setMenuOpen(false)}>
                  {label} <ArrowRight />
                </Link>
              ))}
            </nav>
            <a className="primary-button" href={generalWhatsApp} target="_blank" rel="noreferrer">
              <MessageCircle /> Consultar por WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.button className="drawer-backdrop" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="cart-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} aria-label="Carrito">
              <div className="cart-head">
                <div>
                  <span>Tu selección</span>
                  <h2>Carrito ({units})</h2>
                </div>
                <button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito"><X /></button>
              </div>
              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <ShoppingBag />
                    <h3>Tu carrito está vacío</h3>
                    <p>Sumá productos para enviar el pedido por WhatsApp.</p>
                    <button className="text-button" onClick={() => setCartOpen(false)}>Seguir explorando</button>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <article className="cart-item" key={`${item.product.id}-${item.variant}`}>
                      <img src={item.product.image} alt="" />
                      <div>
                        <h3>{item.product.name}</h3>
                        <p>{item.variant}</p>
                        <strong>{formatPrice(item.product.price)}</strong>
                        <div className="quantity-control">
                          <button onClick={() => changeQuantity(index, -1)} aria-label="Restar una unidad">−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => changeQuantity(index, 1)} aria-label="Sumar una unidad">+</button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="cart-footer">
                  {cart.some((item) => item.product.demo) && <p className="demo-note">El carrito contiene productos y precios de demostración.</p>}
                  <div className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
                  <a className="primary-button" href={whatsappUrl(checkoutMessage)} target="_blank" rel="noreferrer">
                    <MessageCircle /> Confirmar pedido por WhatsApp
                  </a>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

function CategorySection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, slidesToScroll: 1, containScroll: "trimSnaps", dragFree: false });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setSelected(emblaApi.selectedScrollSnap());
      setSnaps(emblaApi.scrollSnapList());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on("select", update).on("reInit", update);
    return () => { emblaApi.off("select", update).off("reInit", update); };
  }, [emblaApi]);

  return (
    <section className="section categories-section" id="categorias">
      <div className="section-heading">
        <div><h2>Explorá por categoría</h2><p>Encontrá más rápido lo que estás buscando.</p></div>
        <div className="carousel-arrows">
          <button disabled={!canPrev} onClick={() => emblaApi?.scrollPrev()} aria-label="Categoría anterior"><ArrowLeft /></button>
          <button disabled={!canNext} onClick={() => emblaApi?.scrollNext()} aria-label="Categoría siguiente"><ArrowRight /></button>
        </div>
      </div>
      <p className="swipe-hint">← Deslizá para ver más →</p>
      <div className="embla" ref={emblaRef}>
        <div className="embla-container category-track">
          {categories.map((category) => (
            <div className="embla-slide category-slide" key={category.slug}>
              <Link className="category-card" href={`/productos?categoria=${category.slug}`}>
                <div className="category-image"><img src={category.image} alt="" loading="lazy" /></div>
                <div><h3>{category.name}</h3><p>{category.description}</p><span>Ver categoría <ArrowRight size={16} /></span></div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      {snaps.length > 1 && <div className="carousel-dots">{snaps.map((_, index) => <button className={selected === index ? "active" : ""} onClick={() => emblaApi?.scrollTo(index)} key={index} aria-label={`Ir a la posición ${index + 1}`} />)}</div>}
    </section>
  );
}

export function ProductCard({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  return (
    <article className="product-card">
      <Link className="product-image" href={`/producto/${product.slug}`}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <div className="product-status">
          {product.new && <span>Nuevo</span>}
          {product.offer && <span>Oferta</span>}
          {product.demo && <span>Demostración</span>}
        </div>
      </Link>
      <div className="product-info">
        <p className="product-meta">{product.brand} · {product.category}</p>
        <Link href={`/producto/${product.slug}`}><h3>{product.name}</h3></Link>
        <div className="product-price">
          <strong>{formatPrice(product.price)}</strong>
          {product.previousPrice && <del>{formatPrice(product.previousPrice)}</del>}
        </div>
        <div className="product-buttons">
          <Link className="outline-button" href={`/producto/${product.slug}`}>Ver detalle</Link>
          <button className="primary-button" onClick={() => onAdd(product)}>{product.price === null ? "Consultar" : "Agregar"}</button>
        </div>
      </div>
    </article>
  );
}

export function ProductCarousel({ products: items, onAdd }: { products: Product[]; onAdd: (product: Product) => void }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, slidesToScroll: 1, containScroll: "trimSnaps", dragFree: false });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setSelected(emblaApi.selectedScrollSnap());
      setSnaps(emblaApi.scrollSnapList());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on("select", update).on("reInit", update);
    return () => { emblaApi.off("select", update).off("reInit", update); };
  }, [emblaApi]);

  return (
    <div className="carousel-wrap">
      <p className="swipe-hint">← Deslizá para ver más →</p>
      {snaps.length > 1 && <div className="carousel-arrows floating-arrows">
        <button disabled={!canPrev} onClick={() => emblaApi?.scrollPrev()} aria-label="Producto anterior"><ArrowLeft /></button>
        <button disabled={!canNext} onClick={() => emblaApi?.scrollNext()} aria-label="Producto siguiente"><ArrowRight /></button>
      </div>}
      <div className="embla" ref={emblaRef}><div className="embla-container product-track">{items.map((product) => <div className="embla-slide product-slide" key={product.id}><ProductCard product={product} onAdd={onAdd} /></div>)}</div></div>
      {snaps.length > 1 && <div className="carousel-dots">{snaps.map((_, index) => <button className={selected === index ? "active" : ""} onClick={() => emblaApi?.scrollTo(index)} key={index} aria-label={`Ir a la posición ${index + 1}`} />)}</div>}
    </div>
  );
}
