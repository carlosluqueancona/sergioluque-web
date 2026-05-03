// PostBody renders plain-text (Markdown-like) content stored in D1 as a string.
// Content is split on double-newlines into paragraphs and rendered with the
// design-system typography styles.

interface PostBodyProps {
  value: string
}

export function PostBody({ value }: PostBodyProps) {
  const paragraphs = value.split(/\n{2,}/).filter(Boolean)

  return (
    <div className="post-body">
      {paragraphs.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  )
}
