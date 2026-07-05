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

- El curso se partió en **un TXT por módulo** en `modulos/` (`M00-entorno-kubectl.txt` … `M03-rbac-seguridad.txt`), con verificación byte a byte contra el original. La web detecta los ficheros automáticamente (listado del servidor de `start.sh`, orden alfabético por nombre `MXX-...`): añadir un módulo = soltar el fichero y refrescar. `CURSO-CKA-claude.txt` queda como respaldo/fallback.

### Operativa

- `start.sh` abre el navegador automáticamente tras levantar el servidor.
- README de `cka-study-web/` reescrito con la convención de módulos y las funciones.

## Verificación aplicada

- `node --check` en los JS y harness en Node que parsea el TXT real (módulos, quiz, timers, IDs únicos).
- Chrome headless: capturas en claro y oscuro, recuento de componentes en el DOM (módulos, quiz, spoiler, cronómetro) y prueba de persistencia real sembrando `localStorage` en un perfil.
- Migración a `modulos/`: `diff` byte a byte de la concatenación contra el original y comprobación de que los 132 IDs de sección son idénticos (progreso intacto).
