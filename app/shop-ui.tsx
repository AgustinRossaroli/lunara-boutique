"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  formatPrice,
  Product,
  products as staticProducts,
  whatsappUrl,
} from "./catalog-data";
import { subscribeToProducts } from "./firebase-client";

export type CartItem = {
  product: Product;
  quantity: number;
  variant: string;
};

export function useCatalogProducts() {
  const [items, setItems] = useState<Product[]>(staticProducts);

  useEffect(() => subscribeToProducts(setItems), []);

  return items;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const value = window.localStorage.getItem("lunara-cart-v1");
      if (value) {
        const savedCart = JSON.parse(value);
        queueMicrotask(() => setCart(savedCart));
      }
    } catch {
      window.localStorage.removeItem("lunara-cart-v1");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lunara-cart-v1", JSON.stringify(cart));
  }, [cart]);

  const add = (product: Product, variant?: string, quantity = 1) => {
    const selected = variant ?? product.variants[0] ?? "Única";
    setCart((current) => {
      const index = current.findIndex(
        (item) => item.product.id === product.id && item.variant === selected,
      );
      if (index < 0) return [...current, { product, variant: selected, quantity }];
      return current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    });
  };

  const change = (index: number, amount: number) => {
    setCart((current) =>
      current
        .map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  return { cart, add, change };
}

export function BackButton({
  fallback = "/",
}: {
  fallback?: string;
}) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallback);
  };

  return (
    <button className="back-button" type="button" onClick={goBack}>
      <ArrowLeft size={18} /> Atrás
    </button>
  );
}

export function InteriorHeader({
  units,
  onCart,
}: {
  units: number;
  onCart: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="info-bar interior-info-bar">
        <span>Puerto Rico, Misiones</span>
        <span>Pedidos por WhatsApp</span>
      </div>
      <header className="navbar navbar-solid interior-navbar">
        <Link className="brand" href="/">
          <img src="/logo-lunara.png" alt="Logo de Lunara Boutique" />
          <span>Lunara Boutique</span>
        </Link>
        <nav className="desktop-nav">
          <Link href="/">Inicio</Link>
          <Link href="/productos">Productos</Link>
          <Link href="/#categorias">Categorías</Link>
          <Link href="/#preguntas">Preguntas frecuentes</Link>
          <Link href="/#contacto">Contacto</Link>
        </nav>
        <div className="nav-actions">
          <Link className="icon-button desktop-only" href="/productos" aria-label="Buscar productos">
            <Search size={19} />
          </Link>
          <button className="icon-button" onClick={onCart} aria-label={`Abrir carrito, ${units} unidades`}>
            <ShoppingBag size={19} />
            {units > 0 && <span className="cart-count">{units}</span>}
          </button>
          <a className="whatsapp-button desktop-only" href={whatsappUrl("Hola Lunara Boutique, quisiera hacer una consulta.")} target="_blank" rel="noreferrer">
            <MessageCircle size={18} /> Consultar
          </a>
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú"><Menu size={21} /></button>
        </div>
      </header>
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="mobile-menu" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
            <div className="mobile-menu-head">
              <Link className="brand" href="/" onClick={() => setMenuOpen(false)}><img src="/logo-lunara.png" alt="" /><span>Lunara Boutique</span></Link>
              <button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><X /></button>
            </div>
            <nav>
              <Link href="/" onClick={() => setMenuOpen(false)}>Inicio <ArrowLeft /></Link>
              <Link href="/productos" onClick={() => setMenuOpen(false)}>Productos <Search /></Link>
              <Link href="/#categorias" onClick={() => setMenuOpen(false)}>Categorías <ShoppingBag /></Link>
              <Link href="/#preguntas" onClick={() => setMenuOpen(false)}>Preguntas frecuentes <MessageCircle /></Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function CartPanel({
  open,
  onClose,
  cart,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  onChange: (index: number, amount: number) => void;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const units = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
    0,
  );
  const message = useMemo(() => {
    const lines = cart.map((item) =>
      `${item.quantity} x ${item.product.name} — ${item.variant} — ${formatPrice(item.product.price)} — ${formatPrice((item.product.price ?? 0) * item.quantity)}`,
    );
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button className="drawer-backdrop" onClick={onClose} aria-label="Cerrar carrito" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="cart-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}>
            <div className="cart-head"><div><span>Tu selección</span><h2>Carrito ({units})</h2></div><button className="icon-button" onClick={onClose}><X /></button></div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart"><ShoppingBag /><h3>Tu carrito está vacío</h3><p>Sumá productos para enviar tu pedido.</p></div>
              ) : cart.map((item, index) => (
                <article className="cart-item" key={`${item.product.id}-${item.variant}`}>
                  <img src={item.product.image} alt="" />
                  <div><h3>{item.product.name}</h3><p>{item.variant}</p><strong>{formatPrice(item.product.price)}</strong><div className="quantity-control"><button onClick={() => onChange(index, -1)}>−</button><span>{item.quantity}</span><button onClick={() => onChange(index, 1)}>+</button></div></div>
                </article>
              ))}
            </div>
            {cart.length > 0 && <div className="cart-footer">{cart.some((item) => item.product.demo) && <p className="demo-note">Este pedido contiene precios de demostración.</p>}<div className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></div><a className="primary-button" href={whatsappUrl(message)} target="_blank" rel="noreferrer"><MessageCircle /> Confirmar pedido por WhatsApp</a></div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
