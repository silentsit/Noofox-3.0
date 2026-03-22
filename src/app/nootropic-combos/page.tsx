'use client'

import { useEffect } from 'react'

/**
 * Legacy path from noofox.com — forwards to shop with #combos scroll target.
 * (Next.js redirects cannot preserve URL fragments.)
 */
export default function NootropicCombosHubPage() {
  useEffect(() => {
    window.location.replace(`${window.location.origin}/shop#combos`)
  }, [])

  return (
    <p className="mx-auto max-w-lg px-4 py-12 text-center text-muted-foreground">
      Redirecting to Nootropic Combos…
    </p>
  )
}
