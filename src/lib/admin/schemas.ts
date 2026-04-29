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
  | 'select'

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  rows?: number // for textarea
  /** For 'select' type — list of allowed values + display labels. */
  options?: { value: string; label: string }[]
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
      { key: 'is_featured', label: 'Featured' },
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
      { key: 'is_featured', label: 'Featured? (shown on home)', type: 'boolean' },
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
    label: 'News',
    labelSingular: 'News item',
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
    label: 'Stochastics',
    labelSingular: 'Stochastics entry',
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

  catalogue: {
    name: 'catalogue',
    route: 'catalogue',
    label: 'Catalogue',
    labelSingular: 'Catalogue entry',
    emoji: '⌗',
    listColumns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'year_text', label: 'Year' },
    ],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          { value: 'vocal_instrumental_mixed', label: 'Vocal, Instrumental and Mixed Works' },
          { value: 'electroacoustic', label: 'Electroacoustic Works' },
        ],
      },
      {
        key: 'year_text',
        label: 'Year (display)',
        type: 'text',
        placeholder: 'e.g. 2022, or 2020 – 2021, or 2014, rev. 2019',
      },
      {
        key: 'year_sort',
        label: 'Year (numeric, for sorting)',
        type: 'number',
        placeholder: 'End year of the composition (used to order the list)',
      },
      {
        key: 'instrumentation',
        label: 'Instrumentation',
        type: 'textarea',
        rows: 3,
        placeholder: 'e.g. Piano, violin, viola and cello',
      },
      {
        key: 'notes',
        label: 'Notes (commissions, prizes, movement list)',
        type: 'textarea',
        rows: 3,
        placeholder: 'Multi-line OK. Used for "Commissioned by …", "Composed with the support of …", etc.',
      },
      {
        key: 'description',
        label: 'Description (featured-work block body)',
        type: 'textarea',
        rows: 4,
        placeholder: 'Used only when this entry is the Featured one — appears next to the cover image at the top of /catalogue.',
      },
      {
        key: 'image_url',
        label: 'Cover image (used by the featured-work block)',
        type: 'image-upload',
      },
      { key: 'score_url', label: 'Score URL', type: 'url' },
      { key: 'listen_url', label: 'Listen URL', type: 'url' },
      { key: 'patch_url', label: 'Patch URL (Pure Data / SuperCollider)', type: 'url' },
      { key: 'video_url', label: 'Video URL', type: 'url' },
      { key: 'lossless_url', label: 'Lossless audio URL', type: 'url' },
      {
        key: 'is_featured',
        label: 'Featured (show in the hero block at top of /catalogue)',
        type: 'boolean',
      },
      { key: 'sort_order', label: 'Sort order (within same year)', type: 'number' },
    ],
  },
}

export function getSchema(route: string): EntitySchema | null {
  return SCHEMAS[route] ?? null
}

export const ENTITY_LIST = Object.values(SCHEMAS)
