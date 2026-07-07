# Web de estudio CKA — estado inicial y mejoras

Documento de traspaso técnico de `cka-study-web/`: cómo estaba el proyecto al recibirlo y qué se mejoró (julio 2026).

## Estado técnico en el que se recibió el proyecto

- **Material de estudio en un único TXT plano** (`CURSO-CKA-claude.txt`, ~2.900 líneas entonces, >3.600 después), leído directamente en VS Code. Contenía módulos M00–M02 con una estructura interna rica pero sin explotar: checkpoints con pares pregunta/respuesta, laboratorios cronometrados con objetivo de tiempo y soluciones marcadas como "no mirar hasta terminar".
- **Primera versión de la web** (`cka-study-web/`): app estática sin dependencias (`index.html` + `app.js` + `styles.css` + `start.sh`) que leía el TXT con `fetch` y lo mostraba con índice lateral por módulos, búsqueda que filtraba módulos enteros, secciones plegables y botón de copiar en bloques de código.
- **Limitaciones de esa versión:**
  - Solo tema claro, sin resaltado de sintaxis; el texto se mostraba con los saltos de línea duros del TXT (líneas cortadas a ~55 caracteres).
  - Los 3 módulos se renderizaban apilados en una sola página.
  - Las respuestas de los checkpoints y las soluciones de los laboratorios quedaban a la vista: imposible autoevaluarse.
  - Sin cronómetro, sin seguimiento de progreso, sin memoria de posición.
  - Parser con huecos: descartaba secciones "padre" sin cuerpo (índice con huérfanos), clasificaba como código la prosa que empezaba por `kubectl ...` y las etiquetas `OBJETIVO:`, partía los YAML a columna 0 y dejaba pasar separadores `-----` como texto; el diagrama ASCII de M01 se rompía en fuente proporcional.
  - `start.sh` levantaba el servidor pero no abría el navegador.

## Mejoras realizadas

### Funciones de estudio activo (a partir de la estructura del propio TXT)

- **Quiz en los checkpoints**: cada `Pregunta N` es una tarjeta con la respuesta oculta tras "Mostrar respuesta".
- **Soluciones de laboratorios tapadas**: la `SOLUCION DE REFERENCIA` aparece borrosa con candado hasta pulsarla.
- **Cronómetro integrado** en cada laboratorio cronometrado, con el objetivo del enunciado (≤ 10/12/20 min) y aviso en rojo al superarlo.
- **Progreso de estudio**: marcar secciones como estudiadas (✓), barras de progreso por módulo y globales, y chip "Continuar donde lo dejaste". Todo en `localStorage` (`cka.progress`, `cka.theme`, `cka.lastPosition`), sin tocar los TXT; los IDs de sección son estables (módulo + título), así que el progreso sobrevive a ediciones del contenido.

### Interfaz y lectura

- **Un módulo a la vez** con botones Anterior/Siguiente e índice lateral jerárquico (1. → 1.1) con scroll-spy.
- **Búsqueda global con fragmentos** que salta a la sección exacta (antes solo filtraba módulos completos).
- **Tema claro pulido por defecto + tema oscuro** con toggle persistente (y `?theme=` para forzarlo).
- **Resaltado de sintaxis propio** (sin CDN) para comandos, flags, strings, comentarios, claves YAML y placeholders; etiqueta Terminal/YAML por bloque.
- Párrafos re-fluidos (se eliminan los cortes de línea artificiales del TXT conservando listas y bloques indentados), callouts con icono para NOTA/TAREA/CRITERIOS DE ÉXITO, diagramas ASCII en monoespaciada, y enlaces directos a secciones (`#id-seccion`).

### Parser (`parser.js`, extraído de `app.js`)

- Reconoce checkpoints (quiz), laboratorios (cronómetro + spoiler) y jerarquía de títulos numerados.
- Correcciones: secciones padre sin cuerpo como cabeceras de grupo, prosa que menciona comandos ya no se pinta como código, etiquetas en mayúsculas abren su propio bloque, continuación de YAML a columna 0, y filtrado de separadores decorativos.

### Contenido modular

- El curso se partió en **un TXT por módulo** en `modulos/` (`M00-entorno-kubectl.txt` … `M03-rbac-seguridad.txt`), con verificación byte a byte contra el original. La web los detecta con **tres fuentes en orden**: `modulos/index.json` (manifiesto generado por `cka-study-web/build-manifest.sh` — imprescindible en hosting estático, que no genera listados de directorio), listado del servidor local de `start.sh`, y `CURSO-CKA-claude.txt` como último recurso. Orden alfabético por nombre `MXX-...` (solo se aceptan ficheros `M##*.txt`): añadir un módulo = soltar el fichero y refrescar (`start.sh` regenera el índice al arrancar).

### Operativa

- `start.sh` abre el navegador automáticamente tras levantar el servidor.
- README de `cka-study-web/` reescrito con la convención de módulos y las funciones.

## Verificación aplicada

- `node --check` en los JS y harness en Node que parsea el TXT real (módulos, quiz, timers, IDs únicos).
- Chrome headless: capturas en claro y oscuro, recuento de componentes en el DOM (módulos, quiz, spoiler, cronómetro) y prueba de persistencia real sembrando `localStorage` en un perfil.
- Migración a `modulos/`: `diff` byte a byte de la concatenación contra el original y comprobación de que los 132 IDs de sección son idénticos (progreso intacto).

## Fase de publicación — Kestrion (5–7 julio 2026)

- **Marca Kestrion**: rebrand de la app (título "Kestrion — Preparación CKA en español", cabecera con la marca K, meta description). Repo público `kestrion-dev/kestrion-cka` como espejo de lo publicable (`cka-study-web/`, `modulos/`, `landing/`, `build.sh`, `LICENSE`, README), commits como "Kestrion Dev Team"; el desarrollo sigue en este repo privado y se sincroniza con rsync.
- **Landing** (`landing/index.html`, autocontenida, tema claro/oscuro): hero con mock visual de la app (quiz + cronómetro + progreso), cifras reales, 6 tarjetas de funciones, "cómo funciona", lista de módulos, FAQ y footer con disclaimer de marcas (Kubernetes®/CKA® de The Linux Foundation, proyecto independiente). Botón "Continuar donde lo dejaste" que aparece solo si el navegador ya tiene progreso. Hueco reservado en el footer para futuros banners/consultoría.
- **Carga multi-fuente de módulos**: `modulos/index.json` (manifiesto generado por `cka-study-web/build-manifest.sh`) → listado de directorio local → TXT único. Tolerante a manifiestos desfasados (omite ficheros que falten), solo acepta el patrón `M##*.txt` (excluye `LICENSE.txt`) y descarta cualquier preámbulo anterior al primer `====` de cada fichero (los avisos de copyright no se cuelan en el contenido).
- **`build.sh`** ensambla `dist/` para Cloudflare Pages: landing en la raíz, app en `/app/`, módulos con manifiesto regenerado. Build command: `bash build.sh`, output: `dist`. En local, `start.sh` regenera el manifiesto al arrancar.
- **Licencia dual**: código MIT (`LICENSE`) y contenido del curso © Kestrion (`modulos/LICENSE.txt` + aviso al inicio de cada TXT de módulo). README raíz nuevo para el repo público con presentación y licencias.
- **Verificación**: `dist/` servido en local — landing correcta en ambos temas (capturas headless), app en `/app/` cargando los 4 módulos vía índice, mismas 132 secciones (progreso intacto) y cero menciones del aviso de copyright en la interfaz.
- **Estado**: ambos repos commiteados y pusheados (privado `63549c0`; público `f3a0739` + `2f54897`). Pendiente: conectar Cloudflare Pages y apuntar `kestrion.dev`.
