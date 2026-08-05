"use client";

import { MessageCircle, ShoppingBag } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatPrice, whatsappUrl } from "../../catalog-data";
import { ProductCarousel } from "../../storefront";
import { BackButton, CartPanel, InteriorHeader, useCart, useCatalogProducts } from "../../shop-ui";

export default function ProductDetailPage() {
  const products = useCatalogProducts();
  const { cart, add, change } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(String(params.slug ?? ""));
  const [variantChoice, setVariantChoice] = useState("");
  const [quantity, setQuantity] = useState(1);

  const product = products.find((item) => item.slug === slug);
  const variant = variantChoice || product?.variants[0] || "Única";
  const related = useMemo(() => product ? products.filter((item) => item.category === product.category && item.id !== product.id) : [], [products, product]);
  const units = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!slug) return <main className="loading-state">Cargando producto…</main>;
  if (!product) return <main><InteriorHeader units={units} onCart={() => setCartOpen(true)} /><section className="missing-product"><h1>Producto no encontrado</h1><p>Es posible que ya no esté disponible.</p><BackButton fallback="/productos" /></section><CartPanel open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onChange={change} /></main>;

  const consult = whatsappUrl(`Hola Lunara Boutique, quisiera consultar por ${product.name}${variant ? `, variante ${variant}` : ""}.`);
  const addCurrent = () => {
    if (product.price === null) { window.open(consult, "_blank", "noopener,noreferrer"); return; }
    add(product, variant, quantity); setCartOpen(true);
  };

  return (
    <main>
      <InteriorHeader units={units} onCart={() => setCartOpen(true)} />
      <section className="product-detail-shell">
        <BackButton fallback="/productos" />
        <div className="product-detail-grid">
          <div className="detail-gallery"><img src={product.image} alt={product.name} /><div className="detail-thumbnails"><button className="active"><img src={product.image} alt="Vista principal" /></button></div></div>
          <div className="detail-info">
            <p className="product-meta">{product.brand} · {product.category}</p>
            <h1>{product.name}</h1>
            {product.demo && <p className="detail-demo-note">Producto y precio de demostración. Reemplazar desde el administrador.</p>}
            <div className="detail-price"><strong>{formatPrice(product.price)}</strong>{product.previousPrice && <del>{formatPrice(product.previousPrice)}</del>}</div>
            <p className="stock-line">{product.stock > 0 ? "Disponible para consultar" : "Sin stock"}</p>
            <p className="detail-description">{product.longDescription}</p>
            <div className="detail-field"><label htmlFor="variant">Variante o presentación</label><select id="variant" value={variant} onChange={(event) => setVariantChoice(event.target.value)}>{product.variants.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="detail-buy-row"><div className="detail-quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}>+</button></div><button className="primary-button" onClick={addCurrent}>{product.price === null ? <><MessageCircle /> Consultar</> : <><ShoppingBag /> Agregar al carrito</>}</button></div>
            <a className="outline-button detail-whatsapp" href={consult} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Consultar este producto por WhatsApp</a>
            <div className="detail-features"><h2>Características</h2><ul><li>Categoría: {product.category}</li><li>Marca: {product.brand}</li><li>Variantes: {product.variants.join(", ")}</li><li>Disponibilidad sujeta a confirmación</li></ul></div>
          </div>
        </div>
      </section>
      {related.length > 0 && <section className="section related-section"><div className="section-heading"><div><h2>También te puede gustar</h2><p>Más opciones de la misma categoría.</p></div></div><ProductCarousel products={related} onAdd={(item) => { if (item.price === null) window.open(whatsappUrl(`Hola Lunara Boutique, quisiera consultar por ${item.name}.`), "_blank"); else { add(item); setCartOpen(true); } }} /></section>}
      <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onChange={change} />
    </main>
  );
}
