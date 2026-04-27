import Link from 'next/link'

interface NavLinkProps {
  href: string
  label: string
}

export function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link href={href} className="nav-link">
      {label}
    </Link>
  )
}
