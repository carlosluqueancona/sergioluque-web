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

export const SCHEMAS: Record<string, EntitySchema> = {
  posts: {
    name: 'posts',
    route: 'posts',
    label: 'Blog',
    labelSingular: 'Post',
    emoji: '✎',
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status' },
      { key: 'published_at', label: 'Published' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2 },
      { key: 'body', label: 'Body', type: 'textarea', rows: 10 },
      { key: 'image_url', label: 'Cover image', type: 'image-upload' },
      { key: 'tags', label: 'Tags (comma-separated)', type: 'text' },
      { key: 'status', label: 'Status (draft / published)', type: 'text' },
      { key: 'published_at', label: 'Publish date', type: 'date' },
    ],
  },

  proyectos: {
    name: 'proyectos',
    route: 'proyectos',
    label: 'Projects',
    labelSingular: 'Project',
    emoji: '◐',
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'year', label: 'Year' },
      { key: 'is_featured', label: 'Featured' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 6 },
      { key: 'images', label: 'Images', type: 'image-list' },
      { key: 'links', label: 'Links', type: 'link-list' },
      { key: 'is_featured', label: 'Featured?', type: 'boolean' },
    ],
  },

  eventos: {
    name: 'eventos',
    route: 'eventos',
    label: 'Concerts',
    labelSingular: 'Concert',
    emoji: '♪',
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'event_date', label: 'Date' },
      { key: 'city', label: 'City' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'event_date', label: 'Date and time', type: 'datetime', required: true },
      { key: 'venue', label: 'Venue', type: 'text' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea', rows: 4 },
      { key: 'external_link', label: 'External link', type: 'url' },
      { key: 'image_url', label: 'Image', type: 'image-upload' },
    ],
  },

  publicaciones: {
    name: 'publicaciones',
    route: 'publicaciones',
    label: 'Publications',
    labelSingular: 'Publication',
    emoji: '◇',
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'journal', label: 'Journal' },
      { key: 'year', label: 'Year' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'journal', label: 'Journal', type: 'text' },
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'abstract', label: 'Abstract', type: 'textarea', rows: 6 },
      { key: 'pdf_url', label: 'PDF URL', type: 'url' },
      { key: 'doi', label: 'DOI', type: 'text' },
      { key: 'image_url', label: 'Cover image', type: 'image-upload' },
    ],
  },
}

export function getSchema(route: string): EntitySchema | null {
  return SCHEMAS[route] ?? null
}

export const ENTITY_LIST = Object.values(SCHEMAS)
