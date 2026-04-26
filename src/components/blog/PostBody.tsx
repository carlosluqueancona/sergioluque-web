// PostBody renders plain-text (Markdown-like) content stored in D1 as a string.
// Content is split on double-newlines into paragraphs and rendered with the
// design-system typography styles.

interface PostBodyProps {
  value: string
}

export function PostBody({ value }: PostBodyProps) {
  const paragraphs = value.split(/\n{2,}/).filter(Boolean)

  return (
    <div>
      {paragraphs.map((para, i) => (
        <p
          key={i}
          style={{
            fontFamily: 'var(--font-ibm-plex-sans)',
            fontSize: '17px',
            lineHeight: 1.75,
            color: 'var(--text-primary)',
            margin: '0 0 24px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {para}
        </p>
      ))}
    </div>
  )
}
