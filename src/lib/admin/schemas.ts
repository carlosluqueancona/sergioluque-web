export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'url'
  | 'image-upload'
  | 'pdf-upload'
  | 'image-list'
  | 'link-list'

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  rows?: number // for textarea
}

export interface EntitySchema {
  name: string // table name, used in worker URL
  route: string // URL slug under /admin/
  label: string // plural label
  labelSingular: string
  emoji?: string
  listColumns: { key: string; label: string }[]
  fields: FieldDef[]
}

const bilingual = (
  baseKey: string,
  baseLabel: string,
  type: 'text' | 'textarea' = 'text',
  rows = 3
): FieldDef[] => [
  {
    key: `${baseKey}_es`,
    label: `${baseLabel} (ES)`,
    type,
    rows: type === 'textarea' ? rows : undefined,
  },
  {
    key: `${baseKey}_en`,
    label: `${baseLabel} (EN)`,
    type,
    rows: type === 'textarea' ? rows : undefined,
  },
]

export const SCHEMAS: Record<string, EntitySchema> = {
  posts: {
    name: 'posts',
    route: 'posts',
    label: 'Blog',
    labelSingular: 'Entrada',
    emoji: '✎',
    listColumns: [
      { key: 'title_es', label: 'Título' },
      { key: 'status', label: 'Estado' },
      { key: 'published_at', label: 'Publicado' },
    ],
    fields: [
      ...bilingual('title', 'Título'),
      ...bilingual('slug', 'Slug'),
      ...bilingual('excerpt', 'Resumen', 'textarea', 2),
      ...bilingual('body', 'Cuerpo', 'textarea', 10),
      { key: 'tags', label: 'Tags (separados por coma)', type: 'text' },
      { key: 'status', label: 'Estado (draft / published)', type: 'text' },
      { key: 'published_at', label: 'Fecha de publicación', type: 'date' },
    ],
  },

  proyectos: {
    name: 'proyectos',
    route: 'proyectos',
    label: 'Proyectos',
    labelSingular: 'Proyecto',
    emoji: '◐',
    listColumns: [
      { key: 'title_es', label: 'Título' },
      { key: 'year', label: 'Año' },
      { key: 'is_featured', label: 'Destacado' },
    ],
    fields: [
      ...bilingual('title', 'Título'),
      ...bilingual('slug', 'Slug'),
      { key: 'year', label: 'Año', type: 'number' },
      ...bilingual('description', 'Descripción', 'textarea', 6),
      { key: 'images', label: 'Imágenes', type: 'image-list' },
      { key: 'links', label: 'Enlaces', type: 'link-list' },
      { key: 'is_featured', label: '¿Destacado?', type: 'boolean' },
    ],
  },

  eventos: {
    name: 'eventos',
    route: 'eventos',
    label: 'Conciertos',
    labelSingular: 'Concierto',
    emoji: '♪',
    listColumns: [
      { key: 'title_es', label: 'Título' },
      { key: 'event_date', label: 'Fecha' },
      { key: 'city', label: 'Ciudad' },
    ],
    fields: [
      ...bilingual('title', 'Título'),
      { key: 'event_date', label: 'Fecha y hora', type: 'datetime', required: true },
      { key: 'venue', label: 'Recinto', type: 'text' },
      { key: 'city', label: 'Ciudad', type: 'text' },
      { key: 'country', label: 'País', type: 'text' },
      ...bilingual('description', 'Descripción', 'textarea', 4),
      { key: 'external_link', label: 'Enlace externo', type: 'url' },
    ],
  },

  publicaciones: {
    name: 'publicaciones',
    route: 'publicaciones',
    label: 'Publicaciones',
    labelSingular: 'Publicación',
    emoji: '◇',
    listColumns: [
      { key: 'title_es', label: 'Título' },
      { key: 'journal', label: 'Revista' },
      { key: 'year', label: 'Año' },
    ],
    fields: [
      ...bilingual('title', 'Título'),
      { key: 'journal', label: 'Revista / Journal', type: 'text' },
      { key: 'year', label: 'Año', type: 'number' },
      ...bilingual('abstract', 'Abstract', 'textarea', 6),
      { key: 'pdf_url', label: 'URL del PDF', type: 'url' },
      { key: 'doi', label: 'DOI', type: 'text' },
    ],
  },
}

export function getSchema(route: string): EntitySchema | null {
  return SCHEMAS[route] ?? null
}

export const ENTITY_LIST = Object.values(SCHEMAS)
