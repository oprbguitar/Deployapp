# Stargate SG-1 Technical Dossier (Static)

Sitio estático con Vite + React + TypeScript, diseñado para GitHub Pages.

## Comandos
- `npm ci` instalar
- `npm run dev` desarrollo
- `npm run build` compilación estática en `dist/`
- `npm run preview` vista previa local del build

## GitHub Pages
1. Ajusta `base` en `vite.config.ts` a `/<NOMBRE_REPO>/`.
2. Activa GitHub Pages (Source: GitHub Actions).
3. El workflow `.github/workflows/deploy.yml` ejecuta:
   - `npm ci`
   - `npm run build`
   - publica `dist`

## Imágenes
- Placeholders en `public/images/placeholders/`.
- Reemplaza manualmente cada archivo y actualiza metadatos (`credit`, `license`, `sourceUrl`) en `src/data/races.ts`.
- No usar hotlinking no autorizado.

## Agregar nuevas razas
1. Añade un objeto al arreglo `races` en `src/data/races.ts`.
2. Completa campos de canon y episodios.
3. Agrega placeholder en `public/images/placeholders/`.
