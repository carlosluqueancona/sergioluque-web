# Guía del Panel de Administración — sergioluque.com

Esta guía explica cómo administrar el contenido del sitio web. No requiere conocimientos técnicos.

---

## 1. Acceder al Panel

**URL:** https://sergioluque-web.pages.dev/admin/login

Ingresa con:
- Email: el correo registrado
- Contraseña: la que se te entregó

> Si pierdes la contraseña, contacta al equipo técnico — no se puede recuperar, solo restablecer.

Una vez dentro, verás el menú con las secciones que puedes administrar.

---

## 2. Estructura del Sitio

El sitio tiene 7 secciones de contenido:

| Sección | Qué contiene | URL pública |
|---------|--------------|-------------|
| **Obras** | Catálogo de composiciones (con audio) | `/obras` |
| **Proyectos** | Proyectos artísticos y colaboraciones | `/proyectos` |
| **Blog** | Artículos y reflexiones | `/blog` |
| **Conciertos** | Eventos pasados y futuros | `/conciertos` |
| **Publicaciones** | Artículos académicos / papers | `/publicaciones` |
| **Bio** | Biografía y CV | `/bio` |
| **Configuración** | Datos generales del sitio | (no tiene URL) |

---

## 3. Contenido Bilingüe

Casi todos los campos de texto largo (descripciones, biografía, artículos del blog) tienen **dos versiones**: español 🇪🇸 e inglés 🇺🇸.

Cuando editas una obra, verás dos pestañas o dos campos: uno para cada idioma. **Llena ambos** para que el sitio funcione correctamente en `/es/` y `/en/`.

Si un campo solo tiene español y el visitante está en `/en/`, verá el texto en español (no se rompe el sitio, pero no es lo ideal).

---

## 4. Cómo Agregar una Obra

1. Menú → **Obras** → botón **"Nueva obra"**
2. Llena los campos:
   - **Título** (ES + EN)
   - **Slug**: identificador único en URL (ej: `solo-violin-2023`). Sin espacios, sin acentos, todo en minúsculas
   - **Año** de composición
   - **Formación / Instrumentation** (ES + EN): "Violín solo", "Solo violin"
   - **Duración** en minutos (ej: `12`)
   - **Descripción** (ES + EN): texto largo, puedes usar formato (negrita, listas, etc.)
   - **Audio URL**: pega el enlace público al archivo mp3 (subir a Cloudflare R2 — ver sección 9)
   - **Imagen**: portada de la obra
   - **Estreno** (opcional): lugar, fecha, intérprete
   - **Encargos** (opcional): institución/persona que encargó la obra
   - **Destacada**: marca esta casilla si quieres que aparezca en la portada
   - **Orden**: número que controla el orden de aparición (menor número = aparece primero)
3. **Guardar**

La obra estará visible en `/obras` inmediatamente.

---

## 5. Cómo Agregar un Concierto

1. Menú → **Conciertos** → **Nuevo evento**
2. Campos:
   - **Título** (ES + EN)
   - **Fecha**: incluye fecha y hora
   - **Recinto** y **Ciudad** y **País**
   - **Descripción** breve (opcional)
   - **Enlace externo** (opcional): venta de boletos, sitio del festival, etc.
3. Guardar

Los conciertos se ordenan automáticamente por fecha. Los pasados aparecen en la sección "Conciertos pasados", los futuros en "Próximos conciertos".

---

## 6. Cómo Publicar un Post del Blog

1. Menú → **Blog** → **Nueva entrada**
2. Campos:
   - **Título** (ES + EN)
   - **Slug**: ej. `notas-sobre-spectralism`
   - **Resumen / Excerpt** (ES + EN): aparece en el listado del blog
   - **Cuerpo** (ES + EN): el artículo completo. Puedes usar formato.
   - **Fecha de publicación**
   - **Tags** (opcional): ej. "composición, técnica, ensayo"
3. Guardar

---

## 7. Cómo Agregar un Proyecto

Similar a obras, pero sin audio. Sirve para colaboraciones, instalaciones, proyectos interdisciplinarios.

1. Menú → **Proyectos** → **Nuevo proyecto**
2. Campos: título, slug, año, descripción, imágenes (puedes subir varias), enlaces externos.
3. Guardar.

---

## 8. Cómo Agregar una Publicación Académica

1. Menú → **Publicaciones** → **Nueva publicación**
2. Campos:
   - **Título**
   - **Revista** (journal)
   - **Año**
   - **Resumen / Abstract** (no necesita ser bilingüe)
   - **PDF URL**: enlace al PDF
   - **DOI** (opcional)
3. Guardar.

---

## 9. Cómo Subir Audio e Imágenes (Cloudflare R2)

Los archivos de audio e imágenes no se suben directamente desde el panel — se almacenan en **Cloudflare R2** (servicio de almacenamiento).

**Proceso:**
1. Ingresa a https://dash.cloudflare.com
2. Menú izquierdo → **R2** → bucket `sergioluque-media`
3. Botón **"Upload"** → selecciona el archivo
4. Una vez subido, haz clic en el archivo → copia la **URL pública**
5. Pega esa URL en el campo correspondiente del panel admin (Audio URL, Imagen, etc.)

**Recomendaciones de archivos:**
- Audio: MP3, máximo 320kbps, ideal entre 5-15 MB
- Imágenes: JPG o WebP, máximo 1920px de ancho, idealmente <500 KB
- Nombres de archivo: sin espacios ni acentos (ej: `obra-cuarteto-2023.mp3`)

---

## 10. Configuración del Sitio

Menú → **Configuración** (Settings)

Aquí editas datos generales que aparecen en todo el sitio:

- **Bio corta**: aparece en la home
- **Bio larga**: aparece en `/bio`
- **Foto de perfil**: imagen tuya
- **CV PDF**: enlace al PDF para descargar
- **Email de contacto**
- **Redes sociales**: Twitter, Instagram, etc.

Solo puedes tener UNA configuración (es global, no se crean múltiples).

---

## 11. Después de Publicar — ¿Cuándo Aparece?

El sitio se actualiza automáticamente al guardar — **inmediatamente**. Si no ves los cambios, refresca la página con `Ctrl+Shift+R` (Windows) o `Cmd+Shift+R` (Mac) para limpiar caché.

---

## 12. Cerrar Sesión

Botón **"Cerrar sesión"** en la esquina superior derecha del panel.

---

## 13. Problemas Comunes

| Problema | Solución |
|----------|----------|
| No puedo entrar al login | Revisa que el email esté bien escrito (sin espacios). Verifica mayúsculas en la contraseña. |
| Subí un audio pero no se reproduce | Verifica que la URL termine en `.mp3` y sea pública (debe abrir directamente en el navegador) |
| El texto en inglés no aparece | Asegúrate de haber llenado el campo en inglés Y haber guardado |
| Una obra no aparece en `/obras` | Verifica que esté guardada (no borrador) y que tenga título + slug |
| El sitio se ve raro / desconfigurado | Refresca con `Cmd+Shift+R` (Mac) o `Ctrl+Shift+R` (Windows) |

---

## 14. Contacto Técnico

Si algo deja de funcionar o tienes dudas no cubiertas en esta guía, contacta a Carlos (cerostudiomx@gmail.com).

---

**Última actualización:** abril 2026
