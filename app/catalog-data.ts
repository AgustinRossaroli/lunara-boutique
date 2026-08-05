export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  price: number | null;
  previousPrice?: number | null;
  stock: number;
  variants: string[];
  tags: string[];
  featured?: boolean;
  new?: boolean;
  offer?: boolean;
  demo?: boolean;
};

export const categories = [
  {
    name: "Ropa importada",
    slug: "ropa-importada",
    description: "Prendas seleccionadas de marcas internacionales.",
    image: "/general-clothing.webp",
  },
  {
    name: "Ropa nacional",
    slug: "ropa-nacional",
    description: "Moda nacional para sumar a tus looks cotidianos.",
    image: "/general-clothing.webp",
  },
  {
    name: "Carteras",
    slug: "carteras",
    description: "Modelos para completar distintos estilos.",
    image: "/general-accessories.webp",
  },
  {
    name: "Accesorios",
    slug: "accesorios",
    description: "Detalles que transforman un conjunto.",
    image: "/general-accessories.webp",
  },
];

export const products: Product[] = [
  {
    id: "trench-bershka",
    slug: "trench-coat-bershka",
    name: "Trench coat Bershka",
    brand: "Bershka",
    category: "Ropa importada",
    description: "Un clásico elegante y atemporal con cinturón ajustable.",
    longDescription:
      "Trench coat importado de Bershka. Su diseño clásico y su cinturón ajustable permiten llevarlo de día o de noche.",
    image: "/general-clothing.webp",
    price: null,
    stock: 1,
    variants: ["Consultar talles disponibles"],
    tags: ["trench", "abrigo", "bershka", "importado"],
    featured: true,
    new: true,
  },
  {
    id: "buzo-bershka",
    slug: "buzo-bershka-off-white",
    name: "Buzo Bershka off white",
    brand: "Bershka",
    category: "Ropa importada",
    description: "Básico, cómodo y atemporal en tono off white.",
    longDescription:
      "Buzo importado de Bershka pensado para un estilo minimalista y versátil. El color publicado por Lunara es off white.",
    image: "/general-clothing.webp",
    price: null,
    stock: 1,
    variants: ["Off white", "Consultar talle"],
    tags: ["buzo", "bershka", "off white", "importado"],
    featured: true,
    new: true,
  },
  {
    id: "demo-cartera",
    slug: "cartera-de-muestra",
    name: "Cartera de muestra",
    brand: "Demo Lunara",
    category: "Carteras",
    description: "Producto de demostración para probar el catálogo y el carrito.",
    longDescription:
      "Este artículo y su precio son demostrativos. Reemplazar por información real desde el panel administrador.",
    image: "/general-accessories.webp",
    price: 48900,
    previousPrice: 52900,
    stock: 4,
    variants: ["Rosa", "Negro"],
    tags: ["cartera", "demo"],
    featured: true,
    offer: true,
    demo: true,
  },
  {
    id: "demo-accesorio",
    slug: "accesorio-de-muestra",
    name: "Accesorio de muestra",
    brand: "Demo Lunara",
    category: "Accesorios",
    description: "Producto de demostración para probar filtros y pedidos.",
    longDescription:
      "Este artículo y su precio son demostrativos. Reemplazar por información real desde el panel administrador.",
    image: "/general-accessories.webp",
    price: 14900,
    stock: 8,
    variants: ["Dorado", "Plateado"],
    tags: ["accesorio", "demo"],
    new: true,
    demo: true,
  },
  {
    id: "demo-nacional",
    slug: "prenda-nacional-de-muestra",
    name: "Prenda nacional de muestra",
    brand: "Demo Lunara",
    category: "Ropa nacional",
    description: "Producto de demostración para validar categorías y stock.",
    longDescription:
      "Este artículo y su precio son demostrativos. Reemplazar por información real desde el panel administrador.",
    image: "/general-clothing.webp",
    price: 34900,
    stock: 6,
    variants: ["S", "M", "L"],
    tags: ["nacional", "demo"],
    demo: true,
  },
  {
    id: "demo-importado",
    slug: "prenda-importada-de-muestra",
    name: "Prenda importada de muestra",
    brand: "Demo Lunara",
    category: "Ropa importada",
    description: "Producto de demostración para validar búsqueda y variantes.",
    longDescription:
      "Este artículo y su precio son demostrativos. Reemplazar por información real desde el panel administrador.",
    image: "/general-clothing.webp",
    price: 39900,
    stock: 3,
    variants: ["S", "M", "L"],
    tags: ["importado", "demo"],
    offer: true,
    demo: true,
  },
];

export const formatPrice = (price: number | null) =>
  price === null
    ? "Consultar"
    : new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      }).format(price);

export const WHATSAPP_NUMBER = "5493873658680";

export const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
