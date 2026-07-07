# Plan: publicar la web de estudio CKA y convertirla en ingreso pasivo

Tres bloques: (1) plan técnico de hosting/dominio, (2) plan de negocio con marketing y monetización, (3) plan de mantenimiento. Al final, riesgos y cosas que no habías mencionado pero importan.

**Advertencia honesta antes de empezar:** "ingreso pasivo" con contenido educativo es real, pero la fase de construcción de audiencia (6–18 meses) es activa. Con publicidad sola, una web de nicho necesita decenas de miles de visitas/mes para generar cifras relevantes. El plan está montado para minimizar coste fijo (≈12 €/año al principio) de forma que cualquier ingreso sea casi margen puro.

---

## 1. Plan técnico: hosting y dominio

### 1.1 Arquitectura recomendada

La web ya es estática (HTML/CSS/JS sin backend), que es el escenario ideal: **hosting gratuito, sin servidores que mantener, sin superficie de ataque**.

| Pieza | Recomendación | Coste |
|---|---|---|
| Hosting | **Cloudflare Pages** (alternativas: GitHub Pages, Netlify) | 0 € |
| Dominio | Registrador: Cloudflare Registrar o Namecheap (`.com` o `.dev`) | 10–15 €/año |
| CDN + HTTPS | Incluido en Cloudflare Pages (certificado automático) | 0 € |
| DNS | Cloudflare | 0 € |
| Analítica | Cloudflare Web Analytics o Plausible self-hosted-lite | 0–9 €/mes |
| Email del dominio | Cloudflare Email Routing (reenvío a tu Gmail) | 0 € |

Por qué Cloudflare Pages sobre GitHub Pages: deploy automático desde el repo Git igual que GH Pages, pero con CDN global mejor, analítica sin cookies incluida, y camino de crecimiento (Workers/KV/D1) si algún día añades login o pagos sin cambiar de proveedor.

### 1.2 Adaptaciones necesarias en el código (pequeñas)

1. **Manifiesto de módulos**: la detección automática actual lee el listado de directorio de `python http.server`; los hostings estáticos no generan listados. Solución: un paso de build de 5 líneas que genera `modulos/index.json` con la lista de ficheros (se ejecuta en el deploy de Cloudflare Pages), y que `loadCourseText()` lo use como primera opción manteniendo el listado como fallback local. Coste: bajo (~20 líneas).
2. **SEO básico**: meta description, Open Graph, `sitemap.xml`, `robots.txt`, título por módulo en la URL (`#m01-...` ya existe; opcionalmente rutas reales con un pequeño prerender). Fase 2.
3. **Dominio del contenido**: decidir qué se publica. El TXT contiene *tu* material de estudio; antes de publicar conviene una pasada editorial (erratas como "examen4.4", tono, ejemplos).
4. **Privacidad del progreso**: el progreso seguirá en `localStorage` del visitante — funciona en público sin backend ni RGPD extra.

### 1.3 Pasos concretos de publicación

1. Comprar dominio (sugerencias: `aprende-cka.com`, `cka-es.dev`, `kubectl.es` si está libre — ver §4 marca).
2. Subir el repo a GitHub (ya tienes remote `xxfroxx/curso-cka`; valorar repo separado **público solo con la web** y contenido, sin notas personales como `descubrir-campos.txt`).
3. Conectar Cloudflare Pages al repo, directorio de build `/`, comando de build: el script del manifiesto.
4. Apuntar el dominio, activar HTTPS estricto, probar en móvil (la web ya es responsive).
5. Alta en Google Search Console + Bing Webmaster y enviar sitemap.

**Tiempo estimado hasta estar en línea: una tarde.**

---

## 2. Business plan

### 2.1 Producto y mercado

- **Nicho**: preparación CKA/CKAD/CKS **en español**. El mercado angloparlante está saturado (KodeKloud, Udemy, killer.sh), pero el contenido en español de calidad es escaso y la demanda hispanohablante (España + LATAM) crece con la adopción de Kubernetes.
- **Propuesta de valor**: curso práctico gratuito con herramientas de estudio activo (quiz, labs cronometrados, soluciones ocultas, progreso) que los PDFs y vídeos no ofrecen. La herramienta *es* el diferencial, no solo el contenido.
- **Competencia**: cursos Udemy en español (12–20 €), YouTube gratuito desordenado, docs oficiales en inglés. Tu hueco: **gratis + estructurado + interactivo + en español**.

### 2.2 Modelo de monetización (por fases, de menor a mayor fricción)

**Fase 1 — Tráfico (mes 0–6): todo gratis, monetización cero.**
Objetivo único: audiencia y SEO. Meter anuncios con 200 visitas/día mata la confianza y paga céntimos.

**Fase 2 — Monetización pasiva ligera (a partir de ~10k visitas/mes):**

| Vía | Realista | Notas |
|---|---|---|
| **Afiliación** | ⭐ La mejor para este nicho | Enlaces de afiliado al examen/formación Linux Foundation (tienen programa de afiliados con descuentos), killer.sh, libros de Amazon, cloud providers con free tier. Un solo alumno que compre el examen (~400 $) deja más que miles de impresiones de ads. |
| **Donaciones** | Complemento | Ko-fi / GitHub Sponsors / "invítame a un café". Ingresos bajos pero cero fricción. |
| **Publicidad display** | La menos rentable | AdSense al principio; RPM realista en nicho tech hispano: 2–6 €/1000 páginas vistas. Con 30k págs/mes ≈ 60–180 €/mes. Alternativa mejor: **EthicalAds/Carbon Ads** (nicho developer, un solo anuncio discreto, no degrada la web de estudio). Requiere banner de cookies + política de privacidad si es AdSense (RGPD). |

**Fase 3 — Producto premium (el verdadero ingreso pasivo, mes 6–18):**

- **Freemium**: M00–M02 gratis siempre (imán SEO); módulos avanzados + simulacros de examen completos + banco extra de preguntas = premium.
- **Formato**: pago único (19–39 €) mejor que suscripción para un examen puntual — la gente aprueba y se va; la suscripción genera cancelaciones y soporte.
- **Infra de pago sin backend propio**: Gumroad / Lemon Squeezy / Stripe Payment Links + acceso por clave o zona con Cloudflare Access/Workers. Mantiene el "pasivo".
- **Productos derivados casi gratis de producir**: PDF/cheatsheet imprimible del curso (5–9 €), pack de laboratorios con soluciones, plantilla de plan de estudio de 4 semanas.

### 2.3 ¿Registro con email? — análisis

**Recomendación: registro opcional, nunca obligatorio.**

- **En contra de obligarlo**: para una web de estudio gratuita, un muro de registro destruye el SEO (Google no indexa lo bloqueado) y el 70–90 % de visitantes rebota. Además te mete de lleno en RGPD: consentimiento, política de privacidad, derecho de supresión, y un backend/servicio para almacenar cuentas (deja de ser estático).
- **A favor de ofrecerlo (opt-in)**: una lista de email es el activo de marketing más valioso y el canal de venta del premium.
- **Cómo hacerlo bien**:
  1. La web funciona 100 % sin cuenta (progreso en `localStorage`, como ahora).
  2. Incentivos de suscripción voluntaria: *lead magnet* ("cheatsheet CKA en PDF gratis a tu correo"), "recibe cada módulo nuevo", y — si algún día hay backend — "sincroniza tu progreso entre dispositivos".
  3. Herramienta: **Brevo** (gratis hasta 300 emails/día) o **MailerLite**; ambos gestionan consentimiento RGPD y bajas por ti.
  4. Si más adelante quieres cuentas reales (progreso en la nube): Supabase (gratis hasta bastante volumen) sin montar servidor.

### 2.4 Plan de marketing (extenso)

**Pilar 1 — SEO (el motor del ingreso pasivo; 60 % del esfuerzo).**

- *Keywords objetivo*: "certificación CKA en español", "examen CKA preguntas", "kubectl cheat sheet español", "CKA vs CKAD", "cuánto cuesta el examen CKA", "simulacro CKA gratis", "etcd backup ejemplo", "kubectl dry-run yaml". Long-tail en español tiene competencia baja.
- *Arquitectura de contenido*: cada módulo como página indexable (requiere el prerender de §1.2), + artículos satélite que enlacen al curso: 1 artículo/semana los primeros 6 meses. Ejemplos: "Los 10 errores que suspenden el CKA", "Cómo configurar vim para YAML", "Guía 2026 del examen CKA: precio, formato, trucos".
- *SEO técnico*: sitemap, schema.org `Course`/`FAQPage` (los checkpoints son FAQs perfectas para rich results), Core Web Vitals (la web ya vuela por ser estática).
- *Backlinks*: aparecer en listas "awesome-kubernetes" y "recursos CKA" de GitHub, responder en Stack Overflow en español / Reddit enlazando cuando aporte.

**Pilar 2 — Comunidades y redes (30 %).**

- **LinkedIn** (el mejor canal B2B hispano): 2–3 posts/semana con un tip del curso (ej. un quiz del checkpoint como encuesta). Los posts de "aprobé el CKA, así estudié" funcionan — documenta tu propia preparación y examen.
- **YouTube/Shorts + TikTok tech**: clips de 60 s resolviendo una tarea del lab cronometrado en terminal. El formato "resuelvo esto en 90 segundos" encaja exactamente con tu material. Un vídeo largo/mes ("resuelvo un simulacro CKA en directo").
- **Comunidades**: r/kubernetes, r/devopsish, Discord/Slack de Kubernetes en español, grupos de Telegram de DevOps LATAM, foros de Platzi/DEV.to en español. Regla: aportar respuestas, no spamear enlaces.
- **Twitter/X y Bluesky**: hilos técnicos con los diagramas ASCII/comandos.

**Pilar 3 — Email (10 %).**

- Newsletter quincenal: 1 pregunta de quiz + 1 truco + novedades del curso. Automatizable con una secuencia de bienvenida de 5 emails (drip) que termina ofreciendo el premium — esto sí es pasivo una vez escrito.

**Pilar 4 — Lanzamientos puntuales.**

- Product Hunt / Hacker News ("Show HN: web app de estudio CKA open-source") — el ángulo "herramienta de estudio open source" viaja mejor que "otro curso".
- Cada release de Kubernetes (3/año) y cada cambio del examen = artículo + email + posts: tráfico estacional garantizado.

**Calendario resumido:** meses 1–3 publicar base SEO + presencia LinkedIn; meses 3–6 vídeo corto semanal + lista de email; mes 6 lanzamiento premium a la lista; a partir de ahí, ritmo de mantenimiento (§3).

### 2.5 Marketplaces de cursos: Udemy, Coursera, Hotmart

Analogía correcta: marketplace = publicar con editorial (distribución a cambio de margen y de la relación con el alumno); web propia = autopublicación.

- **Coursera: no es opción** — solo acepta universidades y empresas partner, no instructores individuales.
- **Udemy: viable como canal complementario.**
  - Requiere **vídeo** (mínimo ~2 h): habría que grabar el curso (pantalla + voz resolviendo los labs). El coste real de entrada es ese trabajo de producción, no dinero.
  - Reparto: ~37 % para el instructor en ventas del marketplace, ~97 % con cupón propio. Precios reales de venta: 9,99–13,99 € por sus promociones perpetuas → **~3–5 € netos por alumno** de marketplace.
  - A favor: distribución (compradores buscando dentro), pagos/impuestos/reembolsos/hosting gestionados, credibilidad por reseñas, ingreso bastante pasivo tras grabar (realista en nicho hispano con buenas reseñas: 50–500 €/mes).
  - En contra: no te llevas el email de los alumnos (prohibido contactarlos fuera), sin control de precio ni marca, enlaces externos muy restringidos.
- **Hotmart (clave en el mercado hispano/LATAM)**: self-serve, **precio libre** (30–80 € sin guerra de descuentos), ~90 % de reparto, te quedas la relación con el comprador, y red de afiliados propia. A cambio no tiene el escaparate/buscador de Udemy: el tráfico lo aportas tú.

**Estrategia recomendada — embudo de tres piezas (no excluyentes):**

1. **Web gratuita interactiva** → imán: SEO, herramienta única, lista de email.
2. **Curso en vídeo en Udemy** → distribución pasiva, credibilidad y descubrimiento a precio bajo/volumen.
3. **Premium propio (web o Hotmart)** → simulacros y pack completo con margen del 90 %+ vendido a la lista.

Formatos distintos (web interactiva ≠ vídeo ≠ simulacros), así que no se canibalizan. Orden de ejecución: web primero (ya casi está), Udemy cuando exista rutina de contenido (la grabación son semanas), premium cuando haya lista.

### 2.6 Estrategia de portfolio: Kestrion B2C + Kestrion Consulting B2B

**Problema**: confundir B2C (estudiantes, gratuito/premium) y B2B (empresas, servicios) en la misma marca genera fricción:
- Estudiantes buscan contenido gratis, ven "servicios de consultoría" en el footer y rebotan
- Empresas buscan consultor, no una web de estudio — no llegan a través de SEO de "CKA gratis"
- Mensajes compiten por atención: credibilidad basada en volumen vs. credibilidad basada en expertise

**Estrategia recomendada: dos sitios, un pipeline**

#### Kestrion.dev — B2C (Ahora — Español first, Inglés después)
- **Público**: estudiantes hispanohablantes preparando CKA/CKAD/CKS (Fase 1-2); luego extender a audiencia anglófona
- **Idioma v1 (mes 0-3)**: español puro (landing, módulos, blog, newsletter)
- **Idioma v2 (mes 3-6)**: agregar inglés como i18n opcional (rutas `/es/` y `/en/`, toggle en web) — prioridad baja hasta que se estabilice el tráfico en español
- **Modelo**: web gratuita (Fase 1) → afiliación + ads (Fase 2) → premium (Fase 3)
- **Timeline**: 
  - 0-3 meses: lanzamiento español, construcción SEO hispanohablante
  - 3-6 meses: crecimiento tráfico, primeras traducciones a inglés
  - 6-18 meses: ingresos pasivos en ambos idiomas
- **Meta mes 18-24**: 50k+ visitas/mes (mixto español+inglés) → 500-1.500 €/mes en ingresos (afiliados + premium)
- **Asset generado**: lista de email (500-1k suscriptores de calidad por mes 6, mayormente hispanohablantes)

#### Kestrion Consulting — B2B (Mes 6+, 100% Inglés)
- **Público**: empresas y equipos globales que ya dominan Kubernetes, buscan: design reviews, migraciones, arquitectura cloud-native, formación in-house
- **Idioma**: **inglés desde el inicio** (mercado B2B es anglófono por defecto, no necesita español)
- **Modelo**: retainers (3-5k €/mes) + proyectos puntuales (10-20k € c/u)
- **Posicionamiento**: "Cloud-native engineering team. We've passed CKA/CKAD/CKS and led Kubernetes projects at scale. Learn from Kestrion (free); hire us for architecture & consulting."
- **Lead gen**: LinkedIn (primary) + casos de estudio + referrals desde lista de Kestrion.dev
- **Dominio**: `kestrion-consulting.dev` o `kestrion.design` o similar (separado de Kestrion.dev)
- **Landing**: portfolio, case studies, pricing, contact form (simple, no es e-commerce)

#### Por qué "primero tráfico" (Kestrion B2C)

| Fase | Tráfico | Lista | Casos | Credibilidad B2B | Lead consulting |
|---|---|---|---|---|---|
| **Mes 0** | 0 | 0 | 0 | Baja (web nueva) | Bajo/nulo |
| **Mes 6** | 10-15k/mes | 500-1k | 5-10 | Media (tráfico probado) | Medio (gente que ya te conoce) |
| **Mes 12** | 20-40k/mes | 1.5-3k | 20-30 | Alta (casos documentados) | Alto (conversión >5%) |
| **Mes 18-24** | 50k+/mes | 3-5k | 50+ | Muy alta | Muy alto (inbound + referrals) |

**Resultado**: si intentas consulting sin Kestrion, gastas 6 meses en LinkedIn/outbound sin tracción. Si construyes Kestrion primero, en mes 6 tienes credibilidad real para vender servicios a empresas que descubrieron la web.

#### Materiales compartidos
- Marca Kestrion (logo, colores, tone of voice)
- Comunidad en Discord/Telegram (formada desde newsletter)
- Autoridad técnica (casos de estudio desde estudiantes que aprobaron)

#### No se canibalizan
- Kestrion.dev = tráfico gratuito, lead magnet, comunidad técnica
- Kestrion Consulting = venta B2B directa, alto ticket, pocas deals/mes
- Público distinto, timing distinto, canales distintos

### 2.7 Números orientativos (escenario conservador)

| Hito | Tráfico/mes | Ingreso/mes estimado |
|---|---|---|
| Mes 3 | 1–3k visitas | ~0 € |
| Mes 6–9 | 8–15k | 30–100 € (afiliados + café) |
| Mes 12 | 20–40k | 150–500 € (afiliados + ads discretos + primeras ventas premium) |
| Mes 18–24 | 50k+ | 500–1.500 € (premium vendiendo en automático a la lista) |

Coste fijo total mientras tanto: **~12–25 €/año**. El riesgo económico es casi nulo; el coste real es tu tiempo de los primeros 6–12 meses.

---

## 3. Plan de mantenimiento

**Técnico (muy bajo, por diseño):**

- Sin dependencias ni backend → sin parches de seguridad de servidor. Revisión trimestral de que el deploy y el dominio están OK (recordatorio de renovación del dominio con auto-renew activado).
- Repo Git = backup del contenido; Cloudflare Pages guarda historial de deploys (rollback en 1 clic).
- Revisar analítica y Search Console 1 vez/mes (errores de rastreo, keywords que suben).

**Contenido (el mantenimiento real):**

- **Kubernetes saca 3 versiones/año y el examen CKA se actualiza** (cambios de dominios/pesos como el de 2024-2025). Ritmo necesario: una revisión del contenido por release (~1 día, 3 veces/año) + actualizar el artículo "guía del examen 2026/2027". Esto es lo que separa una web que genera ingreso de una que muere: contenido de certificaciones desactualizado pierde el ranking en meses.
- Añadir 1 módulo o mejora de contenido al trimestre mientras crece (tú ya lo haces para tu propio estudio — publica lo que ya escribes).

**Negocio:**

- Newsletter quincenal (2 h/mes una vez rodada).
- Revisión semestral de afiliados (enlaces rotos, comisiones) y de precios del premium.
- Responder emails de alumnos: poner una página de FAQ agresivamente buena para minimizarlo.

**Total en régimen de crucero: ~4–6 horas/mes.** Eso es lo máximo de "pasivo" que permite el nicho de certificaciones.

---

## 4. Lo que no mencionaste y conviene tener en cuenta

1. **Marca registrada**: "CKA®" y "Kubernetes®" son marcas de la Linux Foundation/CNCF. Puedes decir "curso de preparación para el examen CKA", pero **no** usar CKA/Kubernetes como nombre del sitio o dominio de forma que sugiera afiliación oficial, ni sus logos. Elige marca propia (ej. "KubePrep en español", "AprueboK8s") con el término CKA en titulares descriptivos. Esto también afecta a AdSense/afiliados (revisiones de policy).
2. **Licencia del contenido**: decide si el contenido es todo-derechos-reservados o CC BY-NC. Si publicas el código de la web como open source (buen marketing), sepáralo del contenido del curso (el código MIT, el contenido con copyright) — si no, cualquiera clona el curso entero.
3. **RGPD/legal mínimo aun sin registro**: aviso legal + política de privacidad + banner de cookies *solo si* usas AdSense/analytics con cookies (Cloudflare Analytics y Plausible no las usan → sin banner). Si vendes premium: condiciones de venta, y facturación como autónomo/actividad económica en tu país — consúltalo antes de cobrar el primer euro.
4. **Accesibilidad e i18n**: el contenido sin tildes del TXT está bien para terminal, pero de cara a SEO/lectores conviene una pasada con tildes correctas (afecta a cómo Google entiende el texto).
5. **Prueba social**: desde el día 1, recoge testimonios ("aprobé usando esto") — es el activo de conversión número 1 para el premium.
6. **No pongas el progreso/quiz detrás del premium**: la herramienta interactiva gratuita es tu marketing; lo premium debe ser *más contenido* (simulacros, módulos avanzados), no *menos funcionalidad*.

---

## Orden de ejecución sugerido

1. Adaptación técnica mínima (`index.json` + SEO base) y pasada editorial del contenido → **1 semana**.
2. Dominio + Cloudflare Pages + Search Console → **1 tarde**.
3. Aviso legal/privacidad + decidir marca y licencia → **1 semana en paralelo**.
4. Rutina de marketing (SEO + LinkedIn) → **desde el día 1 del lanzamiento**.
5. Lista de email al superar ~3k visitas/mes; premium al superar ~10k y tener 300+ suscriptores.

---

## Estado de ejecución (julio 2026)

### ✅ Completado

#### Infraestructura e identidad (separación completa)
- **Marca elegida**: `Kestrion` (nombre inventado, sin choques de mercado)
- **Dominio**: `kestrion.dev` (Cloudflare Registrar, WHOIS privado activado, auto-renew configurado)
- **Email maestro**: `kestrion@proton.me` (cuenta Proton independiente, separada de identidad personal)
- **GitHub**: cuenta `kestrion-dev` creada, 2FA activado, email privado configurado (`300158305+kestrion-dev@users.noreply.github.com`)
- **Repo público**: `kestrion-cka` en `https://github.com/kestrion-dev/kestrion-cka.git`
  - Commits con autor "Kestrion Dev Team" (sin identidad personal)
  - Contiene: web de estudio + módulos TXT
  - Excluye: notas personales, plan de negocio, documentos privados
  - Branch principal: `main`

#### Decisiones de arquitectura
- Hosting: Cloudflare Pages (gratuito, estático puro, sin backend)
- Código: web estática (HTML/CSS/JS) + módulos como ficheros TXT
- Hosting de datos: localStorage en navegador (sin backend, sin RGPD extra)
- Monetización: afiliación + ads discretos + premium (Fases 2-3)
- Repo público con **licencia dual**: código MIT, contenido © Kestrion (protección DMCA frente a republicación)

#### Fase técnica ejecutada (5–7 julio, commits `f3a0739` + `2f54897`, ya pusheados)
- **Landing pública** (`landing/`): hero con mock de la app, funciones, módulos, FAQ, disclaimer de marcas LF/CNCF, botón "continuar" si hay progreso previo, hueco para futuros banners/consultoría
- **Rebrand** de la app a Kestrion (título, cabecera, meta description)
- **Manifiesto de módulos**: `modulos/index.json` + `cka-study-web/build-manifest.sh`; `app.js` con triple fuente (índice → listado local → TXT único), tolerante a manifiestos desfasados
- **`build.sh`** ensambla `dist/` (landing en raíz, app en `/app/`, módulos): listo para CF Pages con build command `bash build.sh` y output `dist`
- **Licencia dual**: `LICENSE` (MIT código), `modulos/LICENSE.txt` (© contenido), aviso en cada TXT (la app lo descarta al cargar), README raíz del repo público

---

### ⏳ Pendiente — Fase 1: Publicación técnica

**Responsabilidad: Fable (agente técnico)**

#### 1. ✅ Manifiesto de módulos (`modulos/index.json`) — HECHO

Resuelto con `cka-study-web/build-manifest.sh` + triple fuente en `app.js` + `build.sh` que ensambla `dist/` (la landing queda en la raíz de kestrion.dev y la app en `/app/`). En Cloudflare Pages: build command `bash build.sh`, output directory `dist`.

**Problema (original)**: `app.js` detecta módulos leyendo el listado de directorio HTTP; Cloudflare Pages (hosting estático) no genera listados.

**Solución**: 
- Crear archivo `modulos/index.json` que liste explícitamente los ficheros y metadatos
- Modificar `app.js` para:
  1. Intentar cargar `modulos/index.json` primero
  2. Si no existe, fallback al listado de directorio (compatibilidad con `python http.server` local)
- Script de build opcional: `build-manifest.js` que genera el JSON automáticamente (ejecutable en deploy de Cloudflare Pages)

**Coste**: ~20 líneas de código

**Referencia**: Plan § 1.2

---

#### 2. SEO base (mínimo requerido antes de lanzar)

**Archivos a crear**:

- `robots.txt`: permitir indexación, desallow de rutas privadas (si existen), apuntar a `sitemap.xml`
- `sitemap.xml`: listado de todos los módulos + secciones principales (puede ser estático o generado en build)

**Cambios en `index.html`**:

- Meta description estática (genérica para inicio) o dinámica por módulo (si se prerender)
  - Ej: `<meta name="description" content="Curso interactivo gratuito para certificación CKA en español. Quiz, labs cronometrados y progreso sincronizado.">`
- Open Graph (og:title, og:description, og:image) para compartir en redes
  - Ej: `<meta property="og:title" content="Kestrion: Preparación CKA en español">`
- Schema.org (JSON-LD) para `Course` (página principal) y `FAQPage` (checkpoints como FAQ)

**Coste**: ~50 líneas HTML + archivos estáticos

**Fase**: 2 (post-lanzamiento), pero planificar estructura ya

---

#### 3. Conectar Cloudflare Pages

**Pasos** (ejecutar en Cloudflare dashboard):
1. Crear nuevo proyecto en Cloudflare Pages
2. Conectar repo `kestrion-dev/kestrion-cka`
3. Configurar build:
   - Framework: None (sitio estático)
   - Build command: `bash build.sh`
   - Build output directory: `dist`
4. Apuntar dominio `kestrion.dev` → Cloudflare Pages
5. HTTPS automático (ya viene incluido)
6. Activar HTTPS estricto en Cloudflare settings

**Test de validación**:
- [ ] Accesible en `https://kestrion.dev`
- [ ] Módulos cargan correctamente (sin errores 404)
- [ ] localStorage persiste al recargar
- [ ] Responsive en móvil

---

### ⏳ Pendiente — Fase 1.5: Legal e infraestructura

**Responsabilidad: Comparta entre ambos (marco legal + setup técnico)**

#### 4. Documentos legales

- `aviso-legal.md` o `.html`: nombre del titular, sede, datos de contacto (mínimo RGPD EU)
- `politica-privacidad.md` o `.html`: explicar que:
  - No almacena datos personales (localStorage solo en navegador del usuario)
  - No usa cookies (Cloudflare Analytics no requiere banner)
  - No colecta emails sin consentimiento explícito (opt-in para newsletter)
  - Cumple RGPD
- Decidir **licencia**:
  - Código: MIT (open source, permisivo)
  - Contenido (TXT): Copyright © Kestrion Dev Team (o CC BY-NC si quieres permisividad)
  - Crear `LICENSE` en repo (elegir entre MIT, CC0, CC BY-NC)

**Ubicación**: enlaces en footer o página `/legal`

---

#### 5. Email Routing (Cloudflare)

- Crear alias `contacto@kestrion.dev` → `kestrion@proton.me`
- (Opcional futuro: `hola@kestrion.dev`, `soporte@kestrion.dev`)
- Test: enviar email a `contacto@kestrion.dev`, verificar que llega a bandeja de Proton

---

#### 6. Analítica sin cookies

- Activar Cloudflare Web Analytics (incluido, sin cookies, RGPD-safe)
- Crear cuenta en Google Search Console (para monitorear keywords, CTR, errores)
- Crear cuenta en Bing Webmaster Tools
- Enviar `sitemap.xml` a ambos

---

### ⏳ Pendiente — Fase 2: Marketing y contenido

**Responsabilidad: Planificación y ejecución (usuario)**

#### 7. Pasada editorial

- Revisar TXT de módulos: erratas, acentos, tono académico
- Validar que comandos/ejemplos funcionan con K8s actual (v1.30+)
- Versionar cambios en commits con mensaje claro

#### 8. Artículos satélite (blog/contenido SEO)

Primeros 3 artículos (semanas 1-3 post-lanzamiento):
- "10 errores que suspenden el examen CKA"
- "CKA vs CKAD vs CKS: cuál estudiar en 2026"
- "Cuánto cuesta el examen CKA y dónde registrarse"

**Formato**: Markdown en carpeta `blog/` (opcional: convertir a HTML estático o usar páginas dinámicas)

**SEO**: cada artículo enlaza a módulos relevantes de la web principal

---

#### 9. Presencia en redes (LinkedIn, YouTube, Discord, Reddit)

**LinkedIn** (2-3 posts/semana):
- Tips del curso (tip técnico + enlace a módulo)
- Testimonios ("aprobé el CKA usando esta web")
- Actualizaciones ("Kestrion ahora cubre etcd clustering")

**YouTube/Shorts**:
- Clips de 60s resolviendo labs cronometrados
- 1 vídeo largo/mes ("resuelvo un simulacro completo en directo")

**Comunidades**:
- Discord/Slack de Kubernetes en español
- Reddit r/kubernetes, r/devopsish
- Telegram DevOps LATAM

**Regla**: aportar respuestas genuinas, no spamear enlaces

---

#### 10. Newsletter quincenal

- Plataforma: Brevo (gratis hasta 300 emails/día) o MailerLite
- Contenido: 1 pregunta quiz + 1 truco + 1 artículo nuevo
- Lead magnet: "Descarga el cheatsheet CKA en PDF" (PDF estático en repo o Google Drive)
- Secuencia de bienvenida: 5 emails automatizados (drip) que termina ofreciendo premium

---

### 📋 Checklist antes de ir live

**Código y contenido:**
- [x] `modulos/index.json` generado o creado manualmente *(build-manifest.sh, regenerado en cada build)*
- [ ] `robots.txt` y `sitemap.xml` presentes
- [x] Meta descriptions y Open Graph en `index.html` *(landing con OG completo y app con meta description; falta og:image)*
- [ ] Aviso legal y política de privacidad accesibles (footer)
- [x] Licencia (`LICENSE`) definida y en repo *(dual: código MIT, contenido © Kestrion)*
- [x] `README.md` actualizado (descripción breve, instrucciones de desarrollo)
- [x] **Landing page** en la raíz del sitio *(no estaba en el plan original; hecha el 5 jul)*

**Infraestructura:**
- [ ] Cloudflare Pages deployado en `kestrion.dev` (rama `main`)
- [ ] Dominio apuntando a Pages
- [ ] HTTPS estricto activado en Cloudflare
- [ ] Email Routing funcionando (`contacto@kestrion.dev` → `kestrion@proton.me`)
- [ ] Cloudflare Web Analytics activo

**SEO y descubrimiento:**
- [ ] Google Search Console: proyecto creado, sitemap enviado, sin errores de rastreo
- [ ] Bing Webmaster: proyecto creado, sitemap enviado
- [ ] Schema.org Course/FAQPage en JSON-LD (opcional pero recomendado)

**Validación del producto:**
- [ ] Accesible en `https://kestrion.dev` (HTTPS válido)
- [ ] Módulos cargan correctamente (sin errores 404 en recursos)
- [ ] Búsqueda funciona
- [ ] Quiz y soluciones ocultas funcionan
- [ ] Cronómetros funcionan
- [ ] localStorage persiste (marcar como estudiado, recargar, verificar que sigue marcado)
- [ ] Responsive en móvil (iPhone 12, Android, tablet)
- [ ] Tema claro y oscuro conmutan correctamente

**Documentación:**
- [ ] README actualizado en repo con instrucciones de desarrollo
- [ ] Este documento (PLAN-PUBLICACION-Y-NEGOCIO.md) reflejando estado actual

---

### 🎯 Próximos hitos (estimado)

| Semana | Tarea | Responsable |
|--------|-------|---|
| 1 | Fable: `index.json` + robots.txt/sitemap | Fable |
| 1 | Usuario: pasada editorial, legal | Usuario |
| 2 | Usuario + Fable: Cloudflare Pages + Email Routing | Ambos |
| 2 | Usuario: alta en GSC/Bing, primer post LinkedIn | Usuario |
| 3-4 | Usuario: 3 artículos satélite, Product Hunt/HN | Usuario |
| 4+ | Usuario: newsletter, rutina semanal de redes | Usuario |

**Target de lanzamiento: final de semana 2**
