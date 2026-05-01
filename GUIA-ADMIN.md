# Guía del Panel de Administración — sergioluque.com

Esta guía explica cómo administrar el contenido del sitio. No requiere conocimientos técnicos.

> El sitio público es **solo en inglés**. Todos los campos del admin se llenan en inglés. La interfaz del panel también está en inglés.

---

## 1. Acceder al Panel

**URL:** https://sergioluque-web.pages.dev/admin/login (o https://sergioluque.com/admin/login si el dominio custom ya apunta a Pages)

Ingresa con tu correo y contraseña. Si pierdes la contraseña no se recupera — se restablece. Contacta al equipo técnico.

Una vez dentro verás el dashboard con tarjetas para cada sección.

---

## 2. Estructura del Sitio

El admin gestiona 7 secciones de contenido + 2 utilidades:

| Sección admin | Qué contiene | URL pública |
|---|---|---|
| **Works** | Catálogo de composiciones (con audio + imagen) | `/works` |
| **Blog** | Artículos / news | `/blog` |
| **Projects** | Colaboraciones, instalaciones | `/projects` |
| **Concerts** | Eventos pasados y próximos | `/concerts` |
| **Publications** | Papers académicos | `/publications` |
| **Media library** | Archivos en R2 (imágenes, audio, PDFs) | (interno) |
| **Settings** | Bio, foto de perfil, CV, email, redes | (se muestra en `/bio`, footer, etc.) |

> Las URLs del **admin** mantienen los paths internos (`/admin/obras`, `/admin/proyectos`, `/admin/eventos`, `/admin/publicaciones`) por compatibilidad. La etiqueta visible es la inglesa.

---

## 3. Botones que verás en todo el panel

| Botón | Qué hace |
|---|---|
| **+ NEW \<thing\>** | Crea una entrada nueva |
| **SAVE / SAVE CHANGES / CREATE** | Guarda lo que estás editando |
| **DELETE** (rojo) | Borra el registro completo de la base de datos |
| **REPLACE** | En un campo de archivo: sube un archivo nuevo, sustituye el actual |
| **LIBRARY** | Abre el explorador de archivos de R2 (ver §6) |
| **UNLINK** | **Quita el archivo de esta entrada pero NO lo borra del servidor** |

---

## 4. Cómo Agregar una Obra (Work)

1. Dashboard → **Works** → botón **+ NEW WORK**
2. Llena los campos:
   - **Title** (obligatorio): título de la obra
   - **Slug** (obligatorio): identificador en URL, todo en minúsculas, sin acentos, sin espacios. Ejemplo: `well-never-know`. La URL pública será `/works/well-never-know`.
   - **Year**: año de composición
   - **Duration**: ej. `12'` o `8:12`
   - **Instrumentation**: ej. `for piano, violin, viola and cello`
   - **Description**: texto largo, soporta saltos de párrafo
   - **Audio**: dropzone para subir un archivo de audio (MP3, M4A, MP4, AAC). También puedes seleccionar uno ya subido con **Or browse library →**
   - **Audio duration (sec)**: duración en segundos como entero (ej. 492 para 8'12''). Se usa para mostrar el tiempo total en el reproductor antes de cargar el archivo
   - **Image**: portada de la obra. Mismas opciones de upload o library
   - **Premiere date** / **Premiere venue** / **Premiere city** (opcional)
   - **Commissions** (opcional)
   - **Performers** (opcional): texto libre con los intérpretes
   - **Sort order**: número entero. Menor = aparece antes en la lista
   - **Featured work**: marca para que aparezca en "Selected works" en la home
3. **SAVE**

La obra estará visible en `/works` y `/works/<slug>` inmediatamente.

---

## 5. Cómo Agregar Otros Tipos de Contenido

### Blog post (`/admin/posts`)

- **Title**, **Slug**, **Excerpt** (resumen para el listado), **Body** (artículo completo)
- **Cover image**: opcional, aparece como thumbnail en el listado
- **Tags**: separados por coma — ej. `composition, score, essay`
- **Status**: `draft` (no aparece en público) o `published`
- **Publish date**: fecha que se muestra y se usa para ordenar

### Project (`/admin/proyectos`)

- **Title**, **Slug**, **Year**, **Description**
- **Images**: galería. Puedes subir varias o agregar desde library con **+ From library**. Reordena con ↑/↓, quita una con ×
- **Links**: pares de etiqueta + URL (ej. `Watch on Vimeo` → `https://...`)
- **Featured?**: aparece destacado en home si lo marcas

### Concert (`/admin/eventos`)

- **Title**, **Date and time**, **Venue**, **City**, **Country**
- **Description** (opcional)
- **External link** (opcional): venta de boletos, página del festival, etc.
- **Image** (opcional): aparece como thumbnail en el listado

Ordenamiento automático: pasados / próximos según `Date and time`.

### Publication (`/admin/publicaciones`)

- **Title**, **Journal**, **Year**, **Abstract**
- **PDF URL**: enlace directo al PDF (puede ser de R2 o externo)
- **DOI** (opcional): se convierte en enlace `https://doi.org/<doi>`
- **Cover image** (opcional)

---

## 6. Subir Archivos: dos rutas

Tienes **dos formas** de poner un archivo en un campo (audio / imagen / PDF):

### A. Subir nuevo archivo (drag & drop)

Cualquier campo de archivo tiene un dropzone gris con texto "**SELECT FILE**". Puedes:

- **Arrastrar** un archivo desde tu computadora
- **Hacer clic** y elegir desde el diálogo del sistema

El archivo se sube a R2 (Cloudflare) y la URL queda automáticamente registrada en el campo. No necesitas tocar el dashboard de Cloudflare.

**Formatos soportados:**
- Audio: MP3, M4A, MP4, AAC
- Imagen: JPG, PNG, WebP
- PDF: PDF

**Recomendaciones:**
- Audio: ideal 5–15 MB, MP3 320 kbps o M4A AAC ~256 kbps
- Imagen: máx 1920px de ancho, idealmente <500 KB (usa WebP si es posible)
- Nombres de archivo: sin acentos ni espacios. El sistema sanitiza nombres pero más vale prevenir.

### B. Reusar un archivo ya subido

Bajo cada dropzone hay un link **Or browse library →**. Lo abres y verás un modal con todos los archivos del tipo correspondiente que están en R2.

- Filtra por nombre de archivo en el buscador
- Click en un item → asigna su URL al campo y cierra el modal
- Para audio puedes escuchar inline antes de elegir
- Para PDF puedes abrirlo en otra pestaña con **OPEN ↗** antes de elegir

Si la entrada ya tiene un archivo asignado, el botón equivalente se llama **LIBRARY**.

### Diferencia importante: UNLINK vs DELETE

- **UNLINK** (en cualquier formulario): solo desconecta el archivo de **esta entrada**. El archivo se queda en R2 y otras entradas que lo usen siguen funcionando.
- **DELETE** (solo en `/admin/media`): borra el archivo de R2 **permanentemente**. Si alguna entrada todavía apunta al archivo, esa entrada queda con un enlace roto. El admin te avisa antes de borrar.

**Regla mental:** si crees que vas a re-usar el archivo, **UNLINK**. Si estás seguro de que ya nadie lo necesita, ve a `/admin/media` y haz **DELETE**.

---

## 7. Media Library (`/admin/media`)

Es el panel central de archivos. Tres pestañas: **Images**, **Audio**, **PDFs**.

Para cada archivo:
- Vista previa (thumbnail para imágenes, reproductor inline para audio, link OPEN para PDFs)
- Nombre + tamaño + fecha de subida
- Botón **DELETE** (rojo) que borra de R2 con confirmación

Filtro por nombre de archivo en la parte superior.

> Cualquier archivo subido (vía formulario o vía library) aparece aquí. Es el único lugar donde puedes purgar archivos del servidor.

---

## 8. Settings (`/admin/settings`)

Datos globales del sitio:

| Campo | Dónde se muestra |
|---|---|
| **Long bio** | `/bio` |
| **Short bio** | (reservado para futuro snippet en home) |
| **Profile picture** | `/bio` |
| **CV (PDF)** | botón "Download CV" en `/bio` |
| **Contact email** | (interno; el formulario `/contact` usa `CONTACT_EMAIL` env var) |
| **Twitter / Instagram / YouTube / SoundCloud / Bandcamp / Facebook / LinkedIn** | (reservado para futuro footer / contacto) |

Solo hay UNA configuración (es global, no múltiple). El botón se llama **SAVE SETTINGS**.

---

## 9. Listas y edición

Cada sección (Works, Blog, etc.) muestra una tabla:

| Columna | Significado |
|---|---|
| **ID** | Identificador interno. Solo informativo. |
| **Title** | Título de la entrada |
| Otras | Variarán por tipo (Year, Status, City, etc.) |
| **Edit →** | Abre la página de edición de esa entrada |

En la edición tienes los botones **SAVE CHANGES** y **DELETE** (este último borra el registro completo, no solo el archivo).

---

## 10. Después de Publicar — Cuándo Aparece

Los cambios se reflejan en el sitio público **inmediatamente**.

Si después de guardar no ves el cambio en el navegador, haz **hard refresh**:
- Mac: `Cmd + Shift + R`
- Windows / Linux: `Ctrl + Shift + R`

---

## 11. Cerrar Sesión

Botón **LOGOUT** en la esquina superior derecha.

La sesión expira automáticamente después de 24 horas.

---

## 12. Tema oscuro / claro

Esquina superior derecha: botón con luna ☾ / sol ☀. Toggle entre tema oscuro (default) y claro. La preferencia se guarda en tu navegador. Funciona igual en el sitio público.

---

## 13. Estadísticas (Google Analytics)

El sitio mide visitas y engagement con **Google Analytics 4**, propiedad `G-42YX6327BF`. Toda la medición respeta el consentimiento de cookies — antes de que un visitante acepte en el banner, GA recolecta solo *pings sin cookies* (anónimos, sin identificación de usuario).

### 13.1 Cómo entrar

1. https://analytics.google.com
2. Inicia sesión con la cuenta de Google que tiene acceso a la propiedad
3. En el selector arriba a la izquierda → propiedad **sergioluque.com (G-42YX6327BF)**

### 13.2 Qué se mide automáticamente

| Reporte | Dónde verlo | Para qué sirve |
|---|---|---|
| **Tiempo real** | Reports → Realtime | Ver visitas en vivo (útil después de publicar nueva obra o compartir un link) |
| **Visitas por página** | Reports → Engagement → Pages and screens | Qué obras / artículos atraen más tráfico |
| **Origen del tráfico** | Reports → Acquisition → Traffic acquisition | Cuánto viene de Google, redes sociales, etc. |
| **País / idioma** | Reports → Demographics → Demographic details | Mapa global de la audiencia |

### 13.3 Eventos custom configurados

Más allá de las visitas básicas, el sitio emite estos eventos cuando un visitante interactúa con elementos clave. Todos respetan el banner de consentimiento.

| Evento | Cuándo se dispara | Dimensiones útiles |
|---|---|---|
| `play_audio` | Cuando alguien le da Play a un audio (en una obra) | `work_title`, `surface` (`detail` = página individual de la obra, `card` = tarjeta del listado) |
| `download_cv` | Click al botón de descarga de CV en `/bio` | `destination` (hostname del PDF) |
| `news_external_click` | Click al link `→` en una entrada de News (`/news`) | `event_title`, `destination` |
| `publication_doi_click` | Click al DOI de una publicación en `/stochastics` | `publication_title`, `destination` (siempre `doi.org`) |
| `publication_pdf_click` | Click al PDF de una publicación en `/stochastics` | `publication_title`, `destination` |
| `contact_form_submit` | Cuando se envía con éxito el formulario de contacto | (sin parámetros) |
| `contact_form_error` | Cuando el formulario falla (Resend caído, etc.) | `reason` |

### 13.4 Cómo ver estos eventos en GA

1. **Reports → Engagement → Events**
2. En la tabla, click en el nombre del evento (ej. `play_audio`)
3. Se abre el detalle con dimensiones y tendencia en el tiempo

Para filtrar por dimensión específica (ej. ver solo plays desde el detail page):
1. En el detalle del evento, sección **Custom parameters**
2. Click en `surface` → ves split entre `detail` y `card`

### 13.5 Reportes útiles que te interesa armar

**Top obras escuchadas (los últimos 30 días)**
- Reports → Engagement → Events → click `play_audio`
- Dimensión: `work_title`
- Vas a ver ranking de qué obras se escuchan más

**Tasa de conversión del formulario de contacto**
- Reports → Engagement → Events → busca `contact_form_submit` en el listado
- El número total de eventos es exactamente cuántos correos has recibido
- Si quieres conversion rate: divide entre `page_view` con `page_path = /contact`

**¿Card vs detail page genera más plays?**
- Detalle del evento `play_audio` → dimensión `surface`
- Si `card` >> `detail`: la gente escucha desde el listado y rara vez navega al detalle (la mini player es suficiente). Si `detail` >> `card`: el listado es punto de entrada y el contenido completo está en el detalle.

### 13.6 Privacidad y consentimiento

- El sitio tiene un banner de cookies que respeta GDPR (Reglamento Europeo).
- Antes de que un visitante acepte: GA recibe pings cookieless — números agregados, sin identificación.
- Después de aceptar: GA setea cookies `_ga` y `_ga_*` con un ID anónimo de visitante (no identifica nombre, email, etc.).
- El visitante puede cambiar su preferencia en cualquier momento via el link **Cookie preferences** en el footer.
- Detalles legales completos en `/privacy`.

### 13.7 Si ves números raros

| Síntoma | Causa probable |
|---|---|
| Muchos `page_view` pero pocos `play_audio` | Normal — la gente lee bio/news pero no necesariamente reproduce audio |
| `contact_form_error` con `reason: server_rejected` | Resend (servicio de email) está rechazando — revisa que `RESEND_API_KEY` no haya expirado |
| `contact_form_error` con `reason: network_error` | Cliente perdió red mid-submit — no es un problema en tu lado |
| Caída brusca de tráfico | Revisa Reports → Acquisition → Traffic acquisition para ver si algún canal se cayó (ej. perdiste posición en Google) |
| Pico repentino de tráfico | Revisa el origen — puede ser una mención en redes / prensa / academia. Bueno saber. |

### 13.8 Si no ves ningún dato

Posibles causas:
1. **Acabas de publicar el sitio** — los datos históricos pueden tardar 24-48h. Realtime debe verse al instante.
2. **Estás visitando con bloqueador de anuncios o extensión privacy** — tu propia visita no cuenta. Prueba en ventana privada.
3. **Bloqueaste el banner de cookies** — entonces solo se reciben pings cookieless, que aparecen en reportes pero con datos limitados.
4. **El cookie banner no está cargando** — abre DevTools (F12) → Console, revisa errores.

Si nada de eso funciona, contacta al técnico.

---

## 14. Problemas Comunes

| Problema | Solución |
|---|---|
| No puedo entrar al login | Email sin espacios, mayúsculas exactas en contraseña. |
| Subí un audio pero falla la subida | Formato no soportado o mayor a límite. Audio: MP3/M4A/MP4/AAC. Si el error persiste, revisa que el archivo abra correctamente en tu computadora. |
| Subí un archivo pero no aparece en library | Refresca la página de Media (`/admin/media`) o haz hard refresh. |
| Borré un archivo de Media y ahora una entrada se ve rota | Es esperado — DELETE en Media es permanente. Sube de nuevo el archivo o asigna otro con LIBRARY. |
| Una obra no aparece en `/works` | Verifica que tenga **Title** y **Slug** llenos, y que se guardó (sin error rojo). |
| Quiero quitar un archivo de una entrada pero no del servidor | Botón **UNLINK** (no **DELETE**, no botón rojo del Media library) |
| El sitio se ve raro / desconfigurado | Hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Win/Linux) |
| El sitio carga pero los datos parecen viejos | Edge cache. Espera ~1 min y refresca. Si persiste, contactar técnico. |

---

## 15. Convenciones de slugs (URLs)

Todos los slugs deben ser:
- Solo minúsculas: `well-never-know` ✅, `Well-Never-Know` ❌
- Solo letras inglesas, dígitos y guiones: `vouloir-croire-entrevoir` ✅, `vouloir_croire_entrevoir` ❌ (los guiones son mejor para SEO que los guiones bajos)
- Sin acentos: `tinguely` ✅, `tinguelý` ❌
- Únicos por tipo (no puede haber dos works con el mismo slug, pero sí un work y un post con el mismo slug)

Si cambias el slug de una entrada que ya estaba publicada, su URL pública cambia y los enlaces externos rompen. Pensar bien antes.

---

## 16. Contacto Técnico

Si algo deja de funcionar o tienes dudas no cubiertas en esta guía, contacta a Carlos (cerostudiomx@gmail.com).

---

**Última actualización:** abril 2026 — tras la migración a inglés-único, la unificación monolingüe del schema, y la incorporación de la Media library.
