# DeployApp Diagram Studio (MVP)

Extensión Chrome para cargar archivos de diagramas, editarlos y ver preview en vivo.

## Cómo activarla al hacer click en el ícono anclado

1. Ir a `chrome://extensions`.
2. Activar **Developer mode**.
3. Click en **Load unpacked** y seleccionar `extension/`.
4. Anclar **DeployApp Diagram Studio**.
5. Hacer click en el ícono anclado: se abrirá automáticamente la app en una pestaña nueva (`src/index.html`).
6. Ahí puedes arrastrar y soltar archivos (`.mermaid`, `.mmd`, `.md`, etc.), seleccionar uno y editarlo en vivo.

## Funciones actuales

- Arrastrar/soltar archivos mixtos.
- Lista de archivos con selección.
- Editor en vivo del archivo activo.
- Live preview real para `.md` (títulos, tablas, listas, código inline y bloques).
- Render Mermaid para `.mmd/.mermaid` (usa `mermaid.ink` para imagen renderizada).
- Preview paralelo para archivos seleccionados.
- Botón **Vista extendida** para maximizar la visualización en el navegador.
- Guardar/cargar workspace local (`chrome.storage.local`).
- Exportar selección a JSON e imagen PNG.

## Empaquetar para compartir

```bash
./scripts/package-extension.sh
```

Archivo generado localmente (no versionado en Git):

- `dist/deployapp-diagram-studio-mvp.zip`

> Nota: el ZIP se excluye del repositorio para evitar errores de PR con archivos binarios.
