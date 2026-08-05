"use client";

import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categories, Product, whatsappUrl } from "../catalog-data";
import { ProductCard } from "../storefront";
import { BackButton, CartPanel, InteriorHeader, useCart, useCatalogProducts } from "../shop-ui";

export default function ProductsPage() {
  const allProducts = useCatalogProducts();
  const { cart, add, change } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [inStock, setInStock] = useState(false);
  const [withPrice, setWithPrice] = useState(false);
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("categoria") ?? "";
    const found = categories.find((item) => item.slug === slug);
    queueMicrotask(() => {
      setSearch(params.get("buscar") ?? "");
      setCategory(found?.name ?? "");
      setBrand(params.get("marca") ?? "");
      setInStock(params.get("stock") === "1");
      setWithPrice(params.get("precio") === "1");
      setSort(params.get("orden") ?? "recent");
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("buscar", search);
    if (category) params.set("categoria", categories.find((item) => item.name === category)?.slug ?? category);
    if (brand) params.set("marca", brand);
    if (inStock) params.set("stock", "1");
    if (withPrice) params.set("precio", "1");
    if (sort !== "recent") params.set("orden", sort);
    const query = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [search, category, brand, inStock, withPrice, sort]);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filtersOpen]);

  const brands = [...new Set(allProducts.map((item) => item.brand))].sort();
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = allProducts.filter((product) => {
      const haystack = [product.name, product.brand, product.category, product.description, ...product.tags].join(" ").toLowerCase();
      return (!term || haystack.includes(term)) && (!category || product.category === category) && (!brand || product.brand === brand) && (!inStock || product.stock > 0) && (!withPrice || product.price !== null);
    });
    return [...result].sort((a, b) => {
      if (sort === "price-asc") return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
      if (sort === "price-desc") return (b.price ?? -1) - (a.price ?? -1);
      if (sort === "featured") return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      return Number(Boolean(b.new)) - Number(Boolean(a.new));
    });
  }, [allProducts, search, category, brand, inStock, withPrice, sort]);

  const clear = () => { setSearch(""); setCategory(""); setBrand(""); setInStock(false); setWithPrice(false); setSort("recent"); };
  const addProduct = (product: Product) => {
    if (product.price === null) {
      window.open(whatsappUrl(`Hola Lunara Boutique, quisiera consultar por ${product.name}.`), "_blank", "noopener,noreferrer");
      return;
    }
    add(product);
    setCartOpen(true);
  };

  const filters = (
    <div className="filters-content">
      <div className="filter-group"><h3>Categoría</h3>{["", ...categories.map((item) => item.name)].map((item) => <label key={item || "all"}><input type="radio" name="category" checked={category === item} onChange={() => setCategory(item)} /><span>{item || "Todas"}</span></label>)}</div>
      <div className="filter-group"><h3>Marca</h3>{["", ...brands].map((item) => <label key={item || "all-brand"}><input type="radio" name="brand" checked={brand === item} onChange={() => setBrand(item)} /><span>{item || "Todas"}</span></label>)}</div>
      <div className="filter-group"><h3>Disponibilidad</h3><label><input type="checkbox" checked={inStock} onChange={(event) => setInStock(event.target.checked)} /><span>Con stock</span></label><label><input type="checkbox" checked={withPrice} onChange={(event) => setWithPrice(event.target.checked)} /><span>Con precio publicado</span></label></div>
      <button className="clear-filters" onClick={clear}>Limpiar todos los filtros</button>
    </div>
  );

  const units = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <main>
      <InteriorHeader units={units} onCart={() => setCartOpen(true)} />
      <section className="catalog-hero"><BackButton fallback="/" /><p>Catálogo Lunara</p><h1>Encontrá una pieza para tu estilo.</h1><span>Ropa importada y nacional, carteras y accesorios.</span></section>
      <section className="catalog-shell">
        <aside className="filters-sidebar"><div className="filters-title"><Filter size={18} /><h2>Filtros</h2></div>{filters}</aside>
        <div className="catalog-main">
          <div className="catalog-toolbar">
            <label className="catalog-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, marca o categoría" /></label>
            <button className="mobile-filter-button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={18} /> Filtros</button>
            <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar productos"><option value="recent">Más recientes</option><option value="featured">Destacados</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option></select>
          </div>
          <div className="results-line"><strong>{filtered.length}</strong> {filtered.length === 1 ? "resultado" : "resultados"}</div>
          {filtered.length ? <div className="catalog-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={addProduct} />)}</div> : <div className="no-results"><Search /><h2>No encontramos productos</h2><p>Probá con otros términos o limpiá los filtros.</p><button className="outline-button" onClick={clear}>Limpiar filtros</button></div>}
        </div>
      </section>
      {filtersOpen && <div className="mobile-filter-panel"><div className="mobile-filter-head"><h2>Filtros</h2><button className="icon-button" onClick={() => setFiltersOpen(false)}><X /></button></div>{filters}<button className="primary-button" onClick={() => setFiltersOpen(false)}>Ver {filtered.length} resultados</button></div>}
      <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onChange={change} />
    </main>
  );
}
