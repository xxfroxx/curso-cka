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

## Nueva fase de correcciones de UI (septiembre 2026)

Estado: implementado y verificado en local; pendiente de sincronizar y publicar.

### 1. Checklist al final de cada sección

Mover «Marcar como estudiada» desde la cabecera hasta el final del contenido de la sección. Debe conservar el estado actual en `localStorage`, permitir marcar y desmarcar, y actualizar el progreso y el índice lateral como hasta ahora.

### 2. Copia segura de comandos

Revisar todos los `modulos/M*.txt` para separar tres tipos de contenido que ahora pueden aparecer mezclados: comandos ejecutables, salida esperada y ejemplos de configuración o plantillas. El botón «Copiar» no debe incluir salidas explicativas como `# controller Running`.

Los ejemplos que aportan contexto deben seguir visibles. Los casos como las líneas comentadas de una plantilla Helm no se corregirán de forma automática: se clasificarán para decidir si son código copiable, salida o explicación. También se comprobará si hace falta una convención en los TXT y un ajuste del parser, en vez de limitarse a borrar comentarios.

#### Agente propuesto para la auditoría

Usar `gpt-5.6-luna` con razonamiento bajo. Es apropiado para una revisión mecánica, repetible y de gran volumen. Los casos ambiguos quedan para revisión manual.

Instrucciones para el agente:

```text
Antes de empezar, lee cka-study-web/parser.js y cka-study-web/app.js únicamente como contexto. Comprueba cómo el parser convierte el texto indentado de los módulos en bloques de código y cómo el botón Copiar toma el contenido completo del bloque. No modifiques esos archivos.

Después revisa todos los archivos modulos/M*.txt y localiza cada bloque que ese parser muestra como código copiable.

Clasifica sus líneas como:
1. comando ejecutable;
2. salida esperada del comando;
3. código o configuración de ejemplo;
4. comentario necesario dentro de un script;
5. caso ambiguo.

Objetivo: impedir que el botón Copiar mezcle comandos con salidas o explicaciones, sin perder contenido útil.

Reglas:
- No cambies app.js, parser.js, styles.css ni otros archivos de la UI.
- No inventes, corrijas ni modernices comandos técnicos.
- No elimines comentarios que formen parte real de un script o manifiesto.
- Aplica únicamente cambios mecánicos cuya clasificación sea inequívoca.
- No modifiques los casos ambiguos; inclúyelos en el informe con archivo, número de línea y propuesta.
- Conserva el orden, los títulos y el significado didáctico de cada módulo.
- Al terminar, entrega un resumen de archivos revisados, cambios realizados y casos pendientes.
```

Antes de ejecutar esta auditoría se definirá cómo representa el formato TXT cada tipo de bloque, para que el parser pueda distinguir qué contenido lleva botón «Copiar».

### 3. Contador de módulos

La tarjeta debe mostrar únicamente «Módulos» y el total. Eliminar el texto «detectados en el TXT».

### Aprobación

- [x] Aprobar la edición del código de la UI.
- [x] Aprobar la convención para comandos, salidas y ejemplos en los TXT.
- [x] Ejecutar la auditoría de módulos con el agente propuesto.
- [x] Verificar los tres cambios en local antes de sincronizar el repo público.

## Bitácora de correcciones — septiembre 2026

### 2026-09-04 — UI y formato de módulos

- Modelo: `gpt-5.6-luna`, esfuerzo bajo. Auditoría mecánica.
- Checklist movido al final de cada sección.
- Contador simplificado a «Módulos» y total.
- Parser ampliado con roles `exec`, `config`, `output`, `template` y `reference`.
- Botón «Copiar» limitado a `exec` y `config`.
- M00–M03b migrados a bloques tipados.
- M04 añadido como `.txt`.
- M04 revisado: conceptos de Deployment, ReplicaSet, DaemonSet y StatefulSet.
- M04 corregido: cero bloques `legacy`.
- M04 corregido: placeholders genéricos movidos de `exec` a `reference`.
- Commit: pendiente de aprobación.
- Repo público: pendiente de sincronización.

### 2026-09-05 — Auditoría transversal

- Modelo: `gpt-5.6-luna`, esfuerzo bajo. Formato y placeholders.
- Modelo: `gpt-6-astra`, esfuerzo alto. Exactitud técnica.
- Resultado de formato: cero bloques `legacy` en M00–M03b.
- Resultado de formato: fences válidos y equilibrados.
- M04 falta en `modulos/index.json`.

#### Placeholders detectados en bloques `exec`

Líneas anteriores a la corrección:

- M00: líneas 276–279, 448, 537–540, 557–587, 644, 772, 781, 790, 799–800, 809, 997–999, 1039 y 1051–1052.
- M01: líneas 614, 720, 729, 738, 752, 768, 795, 812 y 817.
- M02: líneas 402–403, 1062, 1123, 1238 y 1333.
- M03: ninguno.
- M03b: líneas 1041 y 1306.

#### Discrepancias técnicas confirmadas

Líneas anteriores a la corrección:

- M00: líneas 17–42. Texto conversacional incrustado.
- M00: línea 213. `kubectl version --short` obsoleto.
- M00: líneas 422, 469 y 734. Formato del examen descrito como garantía fija.
- M00: líneas 678–684. Recursos permitidos incompletos.
- M01: líneas 347 y 387–394. Falta ReplicaSet en el flujo de Deployment.
- M01: líneas 174 y 550. SQLite presentado como único datastore de K3s.
- M01: líneas 566–571. Kubelet y kube-proxy descritos incorrectamente en K3s.
- M01: líneas 863–867. Estado Pending atribuido siempre al scheduler.
- M01: líneas 140 y 752. Endpoint `/healthz` obsoleto.
- M02: línea 467. `--cluster-cidr` atribuido al apiserver.
- M02: líneas 574–584. Comando `snapshot status` incompleto.
- M02: líneas 686–727. Restore de etcd sin detener los API servers.
- M02: líneas 673 y 1286–1296. Explicación contradictoria sobre etcd activo.
- M02: línea 686. Flujo formativo antiguo con `etcdctl restore`.
- M02: líneas 796, 829, 863 y 891. Versión de upgrade inconsistente.
- M03: líneas 334 y 341. `$do` impide crear los recursos anunciados.
- M03b: líneas 265–267. NetworkPolicy presentado como parte obligatoria de CNI.
- M03b: líneas 882–886. `podCIDR` presentado como prueba de Calico-IPAM.
- M03b: líneas 1236–1243. `helm upgrade --install` no resuelve ownership incompatible.
- M03b: línea 1371. Limpieza de cert-manager en orden incorrecto.

#### Estado

- Auditoría terminada.
- Correcciones de contenido pendientes de aprobación.
- Sin commit.
- Sin cambios en el repo público.

### 2026-09-05 — Corrección transversal

- Modelo: `gpt-5.6-sol`, esfuerzo medio.
- Subagentes: ninguno.
- M00: eliminado texto conversacional incrustado.
- M00: corregidos Vim, aliases, versión de kubectl y datos del examen.
- M01: corregidos controllers, K3s, Pending, TLS y health checks.
- M02: corregidos certificados, flags, snapshot, restore y upgrade.
- M03: `$do` eliminado de comandos que deben crear recursos.
- M03b: corregidos CNI, Calico-IPAM, ownership Helm y limpieza.
- Placeholders eliminados de todos los bloques `exec`.
- M04 añadido a `modulos/index.json`.
- Parser: cero bloques `legacy` en M00–M04.
- Commit técnico privado: `d6df9e7`.
- Push privado: bloqueado por credenciales de `xxfroxx`.
- Commit público: `d37afd3`.
- Repo público: sincronizado y publicado.
