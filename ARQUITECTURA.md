# Arquitectura de kestrion.dev — mapa técnico

Referencia para entender qué hace cada pieza. Solo en el repo privado.

## La idea en una frase

No hay backend: el "servidor" (Cloudflare) solo entrega ficheros estáticos, y todo el trabajo (parsear los TXT, el quiz, los cronómetros, el progreso) lo hace el navegador del visitante con JavaScript.

## Mapa: repo → web publicada

Hay **dos index.html distintos** (landing y app) y un paso de ensamblaje en medio (`build.sh`):

```text
REPO (github.com/kestrion-dev/kestrion-cka)          →  LO QUE SE SIRVE (kestrion.dev)
─────────────────────────────────────────                ──────────────────────────────
landing/                                                  /            (raíz del dominio)
  index.html      ← la página de inicio                    /index.html
  aviso-legal.html, politica-privacidad.html               /aviso-legal.html, ...
  robots.txt      ← instrucciones para crawlers            /robots.txt
  sitemap.xml     ← lista de URLs para Google/Bing         /sitemap.xml
  og.png          ← imagen al compartir en redes           /og.png

cka-study-web/                                            /app/
  index.html      ← esqueleto de la app (casi vacío)       /app/index.html
  app.js          ← toda la lógica (UI, quiz, timers)      /app/app.js
  parser.js       ← convierte los TXT en estructura        /app/parser.js
  styles.css      ← estilos                                /app/styles.css
  start.sh, build-manifest.sh, README.md                  (excluidos: solo desarrollo)

modulos/                                                  /modulos/
  M00...M03.txt   ← el contenido del curso                 /modulos/M0X-*.txt
  index.json      ← manifiesto: lista de los TXT           /modulos/index.json
  LICENSE.txt     ← copyright del contenido                /modulos/LICENSE.txt

build.sh          ← ensambla todo lo anterior en dist/    (no se sirve)
wrangler.jsonc    ← config de despliegue Cloudflare       (no se sirve)
README.md         ← escaparate del repo en GitHub         (no se sirve)
```

## Qué pasa en cada `git push` (el "script de bash que copia")

Cloudflare está conectado al repo de GitHub. Cada push a `main` dispara esta cadena, **en las máquinas de Cloudflare** (no en la tuya):

1. Cloudflare clona el repo.
2. Ejecuta el **build command**: `bash build.sh`, que:
   - regenera `modulos/index.json` (llama a `cka-study-web/build-manifest.sh`, que lista los `M##*.txt`),
   - borra y recrea `dist/`,
   - copia `landing/` a la raíz de `dist/`, `cka-study-web/` a `dist/app/` y `modulos/` a `dist/modulos/`,
   - elimina de `dist/app/` los ficheros de solo-desarrollo (`start.sh`, `build-manifest.sh`, `README.md`).
3. Ejecuta el **deploy command**: `npx wrangler deploy`. Wrangler es la CLI de Cloudflare; lee `wrangler.jsonc`, que dice "publica la carpeta `./dist` como assets estáticos", y sube su contenido a la red de Cloudflare.
4. En ~1 minuto la nueva versión está en `kestrion.dev` (y en la URL interna `kestrion-cka.kestrion.workers.dev`).

Consecuencias prácticas:

- **`dist/` es lo único publicado.** Los README, scripts y este mismo fichero jamás llegan a la web.
- **Todo push a `main` publica.** No hay paso intermedio (decisión pendiente en la ronda 4: rama de trabajo + merge para separar "guardar" de "publicar").
- El `dist/` que a veces generamos en local es solo para probar; Cloudflare genera el suyo propio y el local está ignorado por git.

## Qué pasa en el navegador del visitante

```text
1. Entra a kestrion.dev            → recibe landing/index.html (HTML+CSS puro, autocontenido)
2. Clic en "Empezar gratis"        → carga /app/index.html
3. /app/index.html                 → carga parser.js y app.js
4. app.js pide /modulos/index.json → obtiene la lista de TXT del curso
5. Descarga los 4 TXT en paralelo  → parser.js los convierte en módulos, secciones, quiz y labs
6. app.js pinta la interfaz        → progreso/tema/última posición se guardan en localStorage
```

La carga de módulos tiene **tres fuentes en orden** (por robustez): `index.json` (producción) → listado de directorio (desarrollo local con `start.sh`) → `CURSO-CKA-claude.txt` (respaldo histórico).

## Piezas auxiliares

| Fichero | Qué es |
|---|---|
| `wrangler.jsonc` | La instrucción de despliegue para Cloudflare: "sirve `./dist` como sitio estático". Sin él, `npx wrangler deploy` no sabe qué desplegar. Equivale al "output directory" de otros hostings. |
| `robots.txt` | Dice a los crawlers qué pueden rastrear (aquí: todo) y dónde está el sitemap. No es una barrera técnica: es un convenio que los buscadores respetan. |
| `sitemap.xml` | Las URLs que queremos indexadas (`/` y `/app/`) con prioridad y frecuencia de cambio. Acelera la indexación; sin él también te encuentran, pero tardan más. Las páginas legales no están (llevan `noindex` a propósito). |
| `og.png` | Imagen 1200×630 que muestran WhatsApp/LinkedIn/X al compartir el enlace (referenciada por las metas `og:image`/`twitter:image`). |
| `modulos/index.json` | Manifiesto con la lista de TXT. Necesario porque un hosting estático no genera listados de directorio: sin él, la app no sabría qué ficheros descargar. |
| `.gitignore` (repo público) | Añadido por Cloudflare: excluye caché de wrangler (`.wrangler/`) y ficheros de secretos (`.env*`, `.dev.vars*`). |

## Los dos repos (recordatorio)

```text
Curso_CKA (privado, identidad personal)
  └── desarrollo, planes de negocio, este documento
       │  rsync selectivo (solo código y contenido, nunca los .md de estrategia)
       ▼
kestrion-web (= github.com/kestrion-dev/kestrion-cka, público, identidad Kestrion)
  └── git push → Cloudflare build → kestrion.dev
```

El riesgo a vigilar en cada sync: que `PLAN-PUBLICACION-Y-NEGOCIO.md`, `PASOS-PUBLICACION.md`, `MEJORAS-*.md` o `ARQUITECTURA.md` nunca crucen al repo público.
