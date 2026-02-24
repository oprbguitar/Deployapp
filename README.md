# DeployApp Diagram Studio (MVP)

Inicio de proyecto para una extensión Chrome offline que permite:

- Arrastrar/soltar archivos mixtos de diagramas.
- Detectar tipo por extensión.
- Visualización paralela ajustable en paneles.
- Guardar/cargar workspace localmente.
- Exportar selección a JSON e imagen PNG.

## Cargar en Chrome

1. Ir a `chrome://extensions`.
2. Activar **Developer mode**.
3. Click en **Load unpacked**.
4. Seleccionar la carpeta `extension/`.
5. Abrir opciones de la extensión para usar la app.

## Enlace de descarga

Genera el paquete ZIP con:

```bash
./scripts/package-extension.sh
```

Archivo generado localmente (no versionado en Git):

- `dist/deployapp-diagram-studio-mvp.zip`

> Nota: el ZIP se excluye del repositorio para evitar errores de PR con archivos binarios; súbelo como *release asset* o a tu almacenamiento para compartir enlace de descarga.
