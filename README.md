# Visor panorámico 360° (equirectangular)

Aplicación web en **HTML + CSS + JavaScript** usando **Three.js** para visualizar imágenes panorámicas equirectangulares (relación aproximada **2:1**) en escritorio y móvil.

## Requisitos

- Node.js 18+
- npm 9+

## Ejecutar en local

```bash
npm install
npm run dev
```

Luego abre la URL que Vite muestre en consola (por ejemplo `http://localhost:5173`).

## Funcionalidades incluidas

- Pantalla inicial con botón para cargar imagen local.
- Soporte para JPG, PNG y WebP.
- Render 360° dentro de esfera invertida.
- Controles:
  - Mouse drag para mirar.
  - Rueda para zoom.
  - Arrastre táctil y pinch zoom (dos dedos).
- Botón de pantalla completa.
- Botón de reset de vista.
- Indicador de carga.
- Validación de proporción 2:1 con advertencia y opción de continuar.
- Diseño oscuro tipo visor profesional.
- Ajuste automático al redimensionar ventana.

## TODO (mejoras futuras)

- Soporte VR/WebXR.
- Hotspots interactivos.
- Mini mapa.
- Galería de panoramas.
- Exportar capturas.
