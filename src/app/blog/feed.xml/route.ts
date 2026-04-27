export const runtime = 'edge'

import { getPosts } from '@/lib/db/queries'

export async function GET() {
  const posts = await getPosts()

  const baseUrl = 'https://sergioluque.com'
  const siteTitle = 'Sergio Luque — Blog'

  const items = posts
    .slice(0, 20)
    .map((post) => {
      const title = post.title
      const slug = post.slug
      const excerpt = post.excerpt ?? ''
      const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : new Date().toUTCString()

      return `<item>
        <title><![CDATA[${title}]]></title>
        <link>${baseUrl}/blog/${slug}</link>
        <guid>${baseUrl}/blog/${slug}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${excerpt}]]></description>
      </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <link>${baseUrl}/blog</link>
    <description>Sergio Luque's blog</description>
    <language>en</language>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
