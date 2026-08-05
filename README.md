# Lunara Boutique

Tienda online de moda femenina desarrollada con Next.js y preparada para desplegarse en Vercel.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000` en el navegador.

## Verificación

```bash
npm run lint
npm run build
```

## Firebase (opcional)

La tienda funciona con su catálogo de demostración sin configuración adicional. Para activar el catálogo administrable, copiá `.env.example` como `.env.local` y completá las variables públicas de Firebase.

El repositorio incluye `firestore.rules` y `storage.rules` como base para configurar la seguridad del proyecto.
