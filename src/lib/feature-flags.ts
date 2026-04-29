/**
 * Public-site feature flags.
 *
 * Hide or show sections of the public site for staged launches without
 * touching the admin or the underlying data. The admin routes
 * (`/admin/posts`, `/admin/proyectos`, …) and the worker endpoints
 * always stay live so the operator can keep loading content; only the
 * public surface (header / footer / mobile nav, the home featured
 * blocks, the section pages themselves and the sitemap) follows these
 * flags.
 *
 * Flip a value to `true` and redeploy to switch the section back on.
 */
export type PublicSectionKey = 'blog' | 'projects'

export const PUBLIC_SECTIONS: Record<PublicSectionKey, boolean> = {
  blog: false,
  projects: false,
}

export function isPublicSectionEnabled(key: PublicSectionKey): boolean {
  return PUBLIC_SECTIONS[key]
}
