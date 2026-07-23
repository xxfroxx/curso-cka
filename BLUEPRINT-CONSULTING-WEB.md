# Blueprint: web de Kestrion Consulting

**Qué es este documento**: el prompt/contexto completo para la sesión de Fable 5 que construya la web de consulting. Contiene posicionamiento, comprador, oferta, contenido, dirección de diseño, recomendaciones técnicas heredadas de kestrion.dev y decisiones abiertas. Solo en el repo privado — nunca al público.

**Cómo usarlo**: abre una sesión nueva y di "construye la web de consulting siguiendo BLUEPRINT-CONSULTING-WEB.md", resolviendo antes (o en la sesión) las decisiones abiertas de la sección 12.

---

## 1. Contexto: qué existe ya y de dónde venimos

- **kestrion.dev** está en producción: curso CKA gratuito en español, estático, sin backend, desplegado en Cloudflare Workers (assets estáticos) desde `github.com/kestrion-dev/kestrion-cka`. Es el sandbox donde se aprendió el negocio web (SEO, deploy, analytics, legales). Se queda como está: educación.
- **Identidades separadas**: todo lo público va con la identidad Kestrion (GitHub `kestrion-dev`, `kestrion@proton.me`, Cloudflare de Kestrion). El autor trabaja como SRE en finanzas enterprise y **sigue empleado** — ver sección 9, es una restricción dura.
- **Arquitectura de referencia**: ver `ARQUITECTURA.md`. Patrón probado: HTML/CSS/JS puro sin dependencias, `build.sh` → `dist/`, `wrangler.jsonc`, tema claro/oscuro con CSS custom properties, email ofuscado por JS, robots+sitemap+og.png+JSON-LD, páginas legales con `noindex`, Cloudflare Web Analytics (sin cookies → sin banner).
- **Decisión de dominio previa (7 jul 2026, PLAN-PUBLICACION-Y-NEGOCIO.md)**: acumular autoridad en `kestrion.dev`; cuando el consulting sea real, consulting a la raíz y curso a `/cka/` o `cka.kestrion.dev` con 301s. **Pero** el punto estratégico 7 (abajo) argumenta separar audiencias. Las dos posturas están en tensión — es la decisión abierta nº 1 (sección 12).

## 2. Marca y posicionamiento (no CNCF, no herramientas)

La marca es **Kestrion**. La web nunca dice "CNCF consulting" ni "Kubernetes expert". Dice:

> **"Production Kubernetes for teams under 50 engineers who can't justify a full platform team."**

El comprador no se levanta queriendo CNCF. Se levanta diciendo: "la factura es demasiado alta", "los deploys dan miedo", "nadie entiende el cluster", "necesitamos pasar una revisión de seguridad". Todo el copy se formula en el lenguaje del comprador, no en el de las herramientas. Las herramientas (Kubernetes, Istio, AKS/EKS/GKE) aparecen como *cómo*, nunca como *qué*.

**Ámbito técnico de los servicios** (para la página de servicios y los artículos):
- Kubernetes en producción: diseño, arquitectura, operación, upgrades, costes
- Service mesh: **Istio** (tráfico, mTLS, observabilidad, cuándo NO ponerlo — coherente con la sección 4)
- Managed Kubernetes en las tres nubes: **AKS** (Azure), **EKS** (AWS), **GKE** (Google Cloud) — migraciones, arquitectura de landing zone, coste
- Extensible después al ecosistema CNCF (observabilidad, GitOps, seguridad de la cadena de suministro) — el negocio empieza en Kubernetes/CNCF y se extiende, no al revés

## 3. El comprador específico (no genérico)

**Sí**: CTOs/founders de B2B SaaS pequeñas, pymes reguladas (fintech, healthtech), equipos migrando de VMs/docker-compose a Kubernetes. Gente ya en producción y bajo presión.

**No**: enterprise (tienen platform team), hobbistas, gente aprendiendo teoría de Kubernetes. Esa especificidad es lo que hace que el contenido conecte — cada texto se escribe para esa persona concreta.

## 4. Los cinco problemas reales (mapa de todo el contenido)

No "cómo usar Kubernetes". Estos cinco, y cada artículo/post/pregunta del scorecard mapea a uno:

1. **Costes descontrolados** — nadie es dueño del número; facturas de observabilidad de $80K+/mes
2. **Deploys arriesgados** — rolling updates que aún causan 503s; rollback sin probar
3. **Un solo ingeniero lo sabe todo** — key-person risk; "si se va, esto se cae"
4. **Las revisiones de seguridad bloquean ventas** — RBAC/secrets/compliance sin documentar
5. **Upgrades aplazados** — APIs deprecadas, versión con 2 años, demasiado miedo para tocar

## 5. El modelo operativo (la salsa secreta)

**Disciplina enterprise, tamaño small-team.** Los equipos pequeños deben copiar los *hábitos* enterprise (ownership, restore probado, cadencia de upgrades, RBAC, runbooks), no la *complejidad* enterprise (multi-cluster, change boards, portales — y sí: también "service mesh cuando no toca"; que Istio esté en el catálogo de servicios da credibilidad justo para decir cuándo no ponerlo).

La web enseña la **disciplina mínima viable**: qué DEBE existir para estar seguro en producción y qué puede esperar. Casi todo el consejo de Kubernetes añade peso; este lo quita. Ese contraste es el ángulo diferencial de todo el copy.

## 6. Estrategia de contenido: el activo es la lista de email

La web **no** es una máquina de tráfico; es una **pista de aterrizaje**.

- El tráfico viene de: LinkedIn, syndication en DEV.to, comentarios en Reddit/HN, meetups
- El trabajo de la web: convertir visitas en **suscriptores de email** (objetivo: 100 en 90 días)
- Por qué email: sobrevive a cualquier cambio de algoritmo, portable, canal directo al comprador
- El scorecard y los artículos son la razón para suscribirse. **Todo CTA apunta al alta de email**, no a "book a call" (eso llega en el día 90+)

**Biblioteca ya creada** (usa el placeholder `CONSULTING-DOMAIN` en todos los textos; sustituir al decidir dominio):
- 5 artículos profundos (1.5–2.5K palabras): checklist, triage de cluster caótico, fugas de coste, rolling updates/503s, worksheet de auditoría
- 13 posts semanales de LinkedIn (EN + ES): narrativa progresiva desde "¿deberíamos siquiera usar K8s?" hasta el lanzamiento
- 1 post bonus: ritmo enterprise vs startup ("he estado en ambos" — credibilidad)
- 1 lead magnet: **Production Readiness Scorecard** de 50 preguntas (puntuación 0–100)

## 7. Modelo de negocio: audit-first, no SaaS

Producto inicial: **Kubernetes Production Readiness Audit** — precio fijo, 1–2 semanas, async-friendly (compatible con mantener el empleo):

- Fase 1 (30 min): las preguntas difíciles sobre el cluster
- Fase 2 (3–5 días): auditoría, mapa de riesgos, oportunidades de coste, backlog de remediación
- Fase 3 (1–2 días): presentación async + recomendaciones

Es consulting productizado: repetible, escalable, precio defendible. Fases posteriores: sprints de estabilización, formación, soporte retained. **Nunca** "yo te opero el cluster" (trabajo 24/7).

## 8. Dos propiedades web separadas (a propósito)

- **kestrion.dev** — curso CKA en español. Educación. No se toca.
- **Web de consulting** — en **inglés**, Kubernetes en producción para equipos pequeños. La marca de consulting real.

No mezclar audiencias: los estudiantes de CKA y los compradores de consulting son personas distintas. En fase 3 el curso sirve de puente de credibilidad ("I also teach Kubernetes certification"). La resolución dominio/subdominio/path está en la sección 12.

## 9. Posicionamiento seguro mientras siga empleado (restricción dura)

Públicamente: *"SRE in enterprise finance, documenting production Kubernetes patterns for small teams."*

**Nunca públicamente**: "I'm starting a consultancy", "founder", "available for hire", ni nada que suene a irse o a vender activamente. Los posts son reflexión de ingeniería; la validación de negocio ocurre en privado por DMs. La web debe *parecer* investigación/documentación, no un funnel de ventas — hasta que se decida el flip (día 90+).

**Gate previo a publicar nada**: revisar el contrato laboral (cláusulas de moonlighting/propiedad intelectual — especialmente estrictas en finanzas). Sin ese OK, no se lanza.

Implicaciones para la web v1: sin precios, sin "book a call", sin la palabra "consulting" prominente. Estructura preparada para el flip (la página de la auditoría existe pero sin publicar/enlazar, o detrás de un flag en el build).

## 10. Estructura y copy de la web (recomendación analizada)

Basado en lo que funcionó en kestrion.dev (one-pager con secciones ancladas, nav sticky, FAQ en `<details>`, footer con disclaimer). Para consulting recomiendo **multi-página pequeña** en lugar de one-pager puro — los artículos necesitan URLs propias para syndication y SEO:

```text
/                     Home (la landing de posicionamiento)
/scorecard/           Lead magnet: el Production Readiness Scorecard (el CTA primario vive aquí)
/writing/             Índice de artículos
/writing/<slug>/      Los 5 artículos (uno por URL, canonical propio)
/about/               El posicionamiento personal seguro (sección 9) + foto/credenciales sin identidad conflictiva
/legal + /privacy     Mismo patrón que kestrion.dev (noindex, email ofuscado)
```

**Home, sección a sección** (el orden importa — es un argumento, no un menú):
1. **Hero**: "Production Kubernetes for small teams without a platform team." Subtítulo con el posicionamiento. CTA único: "Get the Scorecard". Nada de "book a call" en v1.
2. **Problema**: los cinco dolores de la sección 4, en lenguaje del comprador, cada uno en una tarjeta con una frase que duela ("Your observability bill has its own line item now").
3. **Modelo**: "Enterprise discipline, small-team size" — qué copiar del enterprise y qué no. Es la sección diferencial; merece el mejor diseño (p. ej. dos columnas copy/skip).
4. **Prueba**: extractos de los artículos + el scorecard como "muestra gratis" del criterio.
5. **Quién escribe**: una línea del posicionamiento seguro + enlace a /about.
6. **CTA final**: alta de email con la promesa concreta ("One field-tested pattern per week. No vendor pitches.").

**Diseño** — profesional, que capte atención, y distinto del sitio CKA (otra audiencia):
- Sobrio y denso en señal, tipo "engineering journal" premium: mucho blanco/negro, una sola tinta de acento, tipografía seria (system stack o una variable font autohospedada — nada de CDNs, mismo criterio CSP/self-contained que el sitio actual)
- Tema claro/oscuro con el mismo mecanismo de CSS custom properties + `data-theme` ya probado
- Nada de stock photos ni ilustraciones 3D genéricas; si hay gráficos, que sean diagramas técnicos reales (un mapa de riesgos, un gauge del scorecard)
- El scorecard interactivo es la oportunidad de "wow" útil: 50 preguntas, puntuación 0–100 en el navegador (mismo patrón localStorage, sin backend), y el resultado con desglose por los 5 problemas — al terminar, el alta de email para recibir el informe/plantilla completa
- Rendimiento como rasgo de marca: cero dependencias, Lighthouse ~100, se carga instantáneo — coherente con "menos peso, más disciplina"

**SEO/metadatos**: mismo kit que kestrion.dev — robots, sitemap, og.png propio (1200×630, estética de la nueva marca), JSON-LD (`WebSite`, `Person`/`Organization`, `Article` por artículo), canonical en cada página. Artículos con `canonical_url` coherente con la estrategia Substack/DEV.to (si el artículo nace en Substack, decidir quién lleva el canonical antes de publicar).

## 11. Captura de email en un sitio estático (decidir proveedor)

Sin backend propio. Opciones, por orden de recomendación:
1. **Buttondown** — form HTML simple hacia su endpoint, sin JS de terceros, gratis hasta 100 subs (encaja con el objetivo del día 90), API para exportar. El más limpio para un sitio sin cookies.
2. **Substack embebido/enlazado** — si la fase Substack (sección 13) ya arrancó, la web puede simplemente enlazar el alta de Substack; menos control estético, cero mantenimiento.
3. **Cloudflare Worker + Turnstile + KV** — control total, cero terceros, pero es construir un mini-backend; solo si las otras dos fallan.

El sitio ya corre en un Worker: añadir un endpoint `/subscribe` en el mismo `wrangler.jsonc` es viable más adelante sin cambiar de arquitectura.

## 12. Decisiones abiertas (resolver antes o al inicio de la sesión de construcción)

1. **Dominio** — tensión entre la decisión SEO del 7 jul (todo bajo `kestrion.dev`) y la separación de audiencias del punto 8. Opciones:
   - a) `consulting.kestrion.dev` — separa audiencia, hereda algo de marca, no compra dominio; el plan "consulting a la raíz en el futuro" sigue abierto
   - b) dominio nuevo (`kestrion-consulting.dev` o similar) — separación total, SEO desde cero, coste extra; coherente con poder vender/independizar después
   - c) `kestrion.dev` raíz reorganizada ya (consulting a la raíz, curso a `/cka/`) — máximo SEO compartido, pero mezcla audiencias e idiomas hoy
   - Mi recomendación por defecto si no se decide otra cosa: **(a)**, y revisar al llegar al día 90.
2. **Proveedor de email** (sección 11) — por defecto: Buttondown.
3. **Repo** — ¿repo público nuevo `kestrion-dev/consulting-web` (mismo patrón dual privado→público) o carpeta en el monorepo actual? Por defecto: repo nuevo, mismo flujo rsync + `build.sh` + `wrangler.jsonc`.
4. **Gate legal del empleo** (sección 9) — bloqueante para publicar, no para construir.
5. **Dónde nace el contenido** — ¿Substack primero (sección 13) y la web después, o la web ya con los artículos? El plan original dice Substack primero; si la web se construye ya, decidir el canonical.

## 13. Secuencia de lanzamiento (no "construir y esperar tráfico")

- **Semana 1**: alta en Substack (casa temporal), post de bienvenida (posicionamiento), artículo 01 (Kubernetes Checklist) en Substack + DEV.to (con canonical a Substack)
- **Semanas 2–13**: un post de LinkedIn por semana (con enlace al artículo), construir lista (objetivo 100), y en privado: entrevistas con lectores enganchados ("help me calibrate my scorecard")
- **Día 90+**: dominio + web de consulting en producción (con 100+ suscriptores y validación), flip del mensaje de "documenting" a "audits available", publicar la oferta de pago

La web triunfa porque llega con audiencia + validación, no por ser bonita. (Y aun así debe ser bonita: es la prueba silenciosa de criterio profesional.)

## 14. Checklist de aceptación para la sesión que construya la web

- [ ] Todo copy en inglés; sin "consulting/founder/available for hire" en v1 (sección 9)
- [ ] CTA primario único: alta de email vía scorecard; cero "book a call" visible en v1
- [ ] Los 5 problemas de la sección 4 aparecen literalmente en la home
- [ ] Scorecard interactivo funcional sin backend (probar en headless: responder, ver puntuación, persistencia)
- [ ] Autocontenido: sin CDNs, sin fuentes externas, sin cookies; analytics = Cloudflare Web Analytics
- [ ] Tema claro/oscuro, responsive móvil (probar 420px), Lighthouse performance/SEO ≥ 95
- [ ] Kit SEO completo: robots, sitemap, og.png, JSON-LD, canonicals
- [ ] Legales con el mismo criterio que kestrion.dev (solo email de contacto, noindex)
- [ ] `CONSULTING-DOMAIN` sustituido en todo el contenido por el dominio decidido
- [ ] Placeholder/flag para la página de la auditoría (existe, no enlazada) listo para el flip del día 90
- [ ] Repo público sin rastro de identidad personal (git config de Kestrion, sin docs de estrategia)
