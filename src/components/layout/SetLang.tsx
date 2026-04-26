'use client'

import { useEffect } from 'react'
import { useLocale } from 'next-intl'

export function SetLang() {
  const locale = useLocale()
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
  return null
}
