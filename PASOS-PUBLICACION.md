# Pasos de publicación de kestrion.dev — checklist vivo

Documento de trabajo entre tú y Fable. Flujo: haces los pasos de la ronda activa, marcas `[x]`, informas en el chat, y Fable valida y añade la ronda siguiente. Repetir hasta publicar.

⚠️ **Regla de identidad en TODOS los pasos**: siempre con las cuentas de Kestrion (Cloudflare del dominio, GitHub `kestrion-dev`, email `kestrion@proton.me`). Nunca la cuenta personal.

---

## Ronda 1 — Conectar GitHub → Cloudflare Pages y dominio (ACTIVA)

### 0. Push del repo público
- [ x] `cd ~/Documents/kestrion-web && git push` (sube el commit `c5da19f` de SEO)

### 1. Conectar GitHub a Cloudflare Pages
- [ ] Entrar en [dash.cloudflare.com](https://dash.cloudflare.com) con la cuenta de Kestrion (la del dominio)
- [ ] Menú lateral: **Workers & Pages** → **Create** → pestaña **Pages** → **Connect to Git**
- [ ] En la redirección a GitHub: **verificar arriba a la derecha que la sesión es `kestrion-dev`** (si aparece la cuenta personal: cerrar sesión de GitHub y volver a empezar)
- [ ] Autorizar "Cloudflare Pages" con **Only select repositories → `kestrion-cka`** (no dar acceso a todos los repos)

### 2. Configurar el build

> **Nota (7 jul)**: Cloudflare te llevó por el flujo nuevo de **Workers** (no el clásico Pages) — vale igual. La config correcta con Workers es esta, y Fable ya añadió el `wrangler.jsonc` que necesita el deploy (commit `9da1752`).

| Campo | Valor |
|---|---|
| Build command | `bash build.sh` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

- [x] Proyecto conectado con esa configuración
- [ ] `cd ~/Documents/kestrion-web && git push` (sube el `wrangler.jsonc` — el push dispara un build automático)
- [ ] En el proyecto: pestaña **Deployments** → esperar a que el build nuevo termine en verde
- [ ] Abrir la URL temporal `*.workers.dev` del proyecto y comprobar: se ve la landing y "Empezar gratis" carga la app con los 4 módulos

### 3. Dominio
- [ ] En el proyecto (Worker): **Settings → Domains & Routes → Add → Custom domain** → `kestrion.dev` (el DNS se configura solo al estar el dominio en Cloudflare; aceptar)
- [ ] Repetir para `www.kestrion.dev`
- [ ] En el dashboard del dominio: **SSL/TLS → Overview** → modo **Full (strict)**

### 4. Validación rápida
- [ ] `https://kestrion.dev` abre la landing con candado HTTPS
- [ ] "Empezar gratis" lleva a `/app/` y cargan los 4 módulos
- [ ] Marcar una sección ✓, recargar → el progreso persiste
- [ ] Probar desde el móvil
- [ ] `https://kestrion.dev/robots.txt` y `https://kestrion.dev/sitemap.xml` responden

### 5. Extras del mismo dashboard (5 min)
- [ ] **Email Routing**: dominio → Email → Email Routing → alias `contacto@kestrion.dev` → destino `kestrion@proton.me` (confirmar el destino desde Proton) → enviarse un correo de prueba
- [ ] **Web Analytics**: Analytics & Logs → Web Analytics → añadir `kestrion.dev` (sin cookies, no requiere banner)

**Ronda 1 completada (7 jul, 16:30)**: validación headless OK — landing 200, 4 módulos cargados, 5 quiz M00, 8 timers, assets (robots/sitemap/og.png/index.json), OG tags, JSON-LD, email ofuscado. Dominio activo con HTTPS strict y Email Routing activo.

---

## Ronda 2 — Buscadores (COMPLETADA)

### 0. Google Search Console
- [ ] Entra en [Google Search Console](https://search.google.com/search-console) con la cuenta de Kestrion (kestrion@proton.me)
- [ ] **Add property** → URL: `https://kestrion.dev`
- [ ] **Verificar dominio** → elige **DNS** (la opción más rápida con Cloudflare)
- [ ] Copias el record TXT que te da Google
- [ ] En Cloudflare → dominio `kestrion.dev` → **DNS → Records** → **Add record** → tipo **TXT**, name @ (o kestrion.dev), content = el record de Google
- [ ] Vuelves a Search Console y haces **Verify** — debería resolver en <1 min
- [ ] Una vez verificado, ve a **Sitemaps** → **Add/test sitemap** → pega `https://kestrion.dev/sitemap.xml` → **Submit**
- [ ] Espera 1-2 días a que Google rastreee (aparecerán bajo "Coverage" las 2 URLs)

### 1. Bing Webmaster Tools
- [ ] Entra en [Bing Webmaster Tools](https://www.bing.com/webmastertools/) con la cuenta de Kestrion
- [ ] **Add a site** → `https://kestrion.dev`
- [ ] **Verify by importing from Google Search Console** (opción más rápida si ya está verificado arriba)
- [ ] Envía el sitemap (`https://kestrion.dev/sitemap.xml`) en **Sitemaps**

### 2. Monitoreo inicial (día 2-3)
- [ ] Google Search Console: **Coverage** → debería mostrar "Covered" (2 URLs indexadas)
- [ ] Bing Webmaster: **URL reports** → sin errores críticos
- [ ] Searchability report: todo "Good"

**Ronda 2 completada (7 jul)**: GSC y Bing verificados (Bing importado desde GSC), sitemap enviado a ambos. Pendiente: revisar Coverage/URL reports en 1-2 días.

## Ronda 3 — Legales (COMPLETADA)

- [x] Decisión de titularidad: solo email de contacto, sin datos personales (mientras no haya actividad económica; se actualizará al constituir forma jurídica)
- [x] `landing/aviso-legal.html` — titularidad, objeto, propiedad intelectual, marcas de terceros, exclusión de responsabilidad, contacto
- [x] `landing/politica-privacidad.html` — resumen sin cookies/registro, qué guarda localStorage, Cloudflare Web Analytics, derechos, contacto
- [x] Enlazadas en el footer de la landing (`Aviso legal · Privacidad`)
- [x] `noindex` en ambas (páginas de utilidad, no contenido a posicionar)
- [x] Email ofuscado igual que en el resto del sitio
- [x] Verificado en local (200, email ensamblado por JS) y sincronizado al repo público — commit `858fa67`

**Pendiente de ti**: `cd ~/Documents/kestrion-web && git pull && git push` para publicar.

## Ronda 4 — Lanzamiento (pendiente de activar)

Borrador:
- Pasada editorial del contenido (erratas, tildes en lo visible)
- Primer post de LinkedIn + preparar Show HN / Product Hunt
- Decidir flujo de publicación (¿rama de trabajo + merge a `main` para publicar, o push directo?)

---

## Historial de rondas completadas

- **Fase previa (5–7 jul)**: repo público con landing, manifiesto de módulos, build para CF Pages, licencia dual, SEO base (robots, sitemap, og:image, JSON-LD). Commits `f3a0739`, `2f54897`, `c5da19f`.
- **Ronda 1 (7 jul, 14:00–16:30)**: GitHub→Cloudflare Workers, dominio `kestrion.dev`, HTTPS strict, Email Routing + Web Analytics. Validación headless OK (landing 200, 4 módulos, OG tags, JSON-LD). Commits `9da1752` (wrangler.jsonc), `f869ded` (quitar pie), `7234a5b` (email ofuscado), merge `8d7d78b`.
