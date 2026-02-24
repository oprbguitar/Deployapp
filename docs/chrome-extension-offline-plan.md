# Plan para crear una extensión de Chrome offline de diagramas/múltiples formatos

## 1) Lo que sí se puede hacer (y límites reales)

- **Offline completo**: sí, empaquetando librerías dentro de la extensión (sin CDN).
- **Guardar en carpeta elegida por el usuario**: sí, con **File System Access API** (`showDirectoryPicker`) desde la página de la extensión.
- **Arrastrar y soltar / copiar-pegar**: sí, con `drag&drop` + portapapeles.
- **Vista paralela ajustable (split panes)**: sí, con paneles redimensionables.
- **Exportar a PDF e imagen**: sí, desde render SVG/Canvas usando `html2canvas`/`jsPDF` o `chrome.tabs.captureVisibleTab` según vista.
- **Live preview**: sí, para formatos parseables localmente.

### Límites importantes

- Archivos propietarios como `.vsdx`, `.mpp`, `.fig`, `.sketch`, `.xd`, `.psd` **no siempre tienen parser OSS robusto en browser**. Recomendado: estrategia por niveles:
  1. Render nativo cuando haya parser fiable.
  2. Conversión previa (ej. a SVG/PNG/JSON) con herramienta local opcional.
  3. Fallback a vista de texto/metadata + aviso.

---

## 2) Arquitectura recomendada (offline-first)

- **Manifest V3** + `options_page` como app principal.
- **UI**: React/Vue/Svelte (o vanilla) con layout de paneles (izquierda archivos, centro preview, derecha inspector).
- **Motor de render por plugins**:
  - Mermaid (`.mmd`, `.mermaid`, bloques en `.md`)
  - PlantUML (`.puml`) con renderer local (WASM si eliges uno compatible)
  - BPMN (`.bpmn`, `.xml`) con `bpmn-js`
  - Draw.io (`.drawio`) usando su XML parser/viewer embebido
  - Markdown (`.md`) con extracción de bloques de diagrama
  - CSV/JSON para gráficas (pie/radar/xy/treemap/sankey básico)
- **Persistencia**:
  - `IndexedDB` para cache de documentos y preferencias
  - `File System Access API` para leer/escribir en carpeta autorizada
- **Cola de indexación**:
  - escaneo incremental de archivos
  - hash por contenido para evitar re-render innecesario
- **Exportador**:
  - salida a `PDF`, `PNG`, `SVG` (cuando aplique)

---

## 3) Mapa de soporte por formato (propuesta)

| Tipo | Extensiones | Soporte inicial recomendado |
|---|---|---|
| Flowchart / Class / Sequence / State / Requirement / Timeline / User Journey / Quadrant / Git / Sankey / Pie / XY | `.mmd`, `.mermaid`, `.md` | Mermaid nativo |
| ER / C4 / Use Case / Activity / Deployment / Block / Package | `.puml`, `.md` | PlantUML plugin + fallback texto |
| BPMN | `.bpmn`, `.xml`, `.md` | bpmn-js |
| Mindmap | `.mm`, `.xmind`, `.mmd`, `.md` | Mermaid mindmap + parser XMind opcional |
| Architecture / Network / Ishikawa / Value Stream | `.drawio`, `.vsdx`, `.md` | Draw.io nativo; VSDX fase 2 |
| Gantt | `.mmd`, `.mermaid`, `.puml`, `.md`, `.mpp` | Mermaid/PUML en fase 1; MPP fase 3 |
| Radar / Pie / DAFO / XY / Treemap | `.csv`, `.json`, `.md` | motor charts local |
| Wireframes / Mockups | `.fig`, `.sketch`, `.xd`, `.psd`, `.bmml` | visor por conversión previa (fase avanzada) |

---

## 4) Estructura de proyecto sugerida

```txt
extension/
  manifest.json
  src/
    app/
      main.ts
      layout/
      components/
    core/
      parser-registry.ts
      renderer-registry.ts
      file-indexer.ts
      exporter.ts
    plugins/
      mermaid/
      plantuml/
      bpmn/
      drawio/
      markdown/
      charts/
    storage/
      idb.ts
      fs-access.ts
```

---

## 5) Flujo UX

1. Usuario abre la extensión.
2. Pulsa **“Elegir carpeta”**.
3. Se indexan archivos compatibles.
4. Selecciona 1..N archivos mezclados.
5. La app detecta tipo, parsea por plugin y renderiza en paralelo.
6. Split panes ajustables + sincronización de zoom.
7. Exportar selección actual a PDF/PNG/SVG.

---

## 6) MVP en 4 sprints

### Sprint 1 (base)
- Shell de extensión MV3 offline.
- Selector de carpeta + indexador.
- Preview de Mermaid + Markdown.
- Export PNG/PDF básico.

### Sprint 2 (diagramas empresariales)
- Plugin BPMN.
- Plugin PlantUML (subset).
- Vista paralela multiarchivo.

### Sprint 3 (avanzado)
- Draw.io robusto.
- Charts CSV/JSON (pie/radar/xy/treemap/sankey).
- Cache inteligente y performance.

### Sprint 4 (formatos complejos)
- Estrategia para `.vsdx`, `.mpp`, `.fig`, `.xd`, `.psd`.
- Pipeline de conversión opcional local.

---

## 7) Riesgos y mitigación

- **Rendimiento** con archivos grandes: virtualización + web workers.
- **Compatibilidad formatos propietarios**: roadmap por fases + fallback claro.
- **Seguridad**: sanitizar Markdown/SVG y bloquear scripts incrustados.

---

## 8) Recomendación práctica

Empieza con un **núcleo fuerte para Mermaid/Markdown/BPMN/Draw.io** (alto valor y buena viabilidad offline) y trata formatos propietarios como **integraciones progresivas** con conversión previa.
