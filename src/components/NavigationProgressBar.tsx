"use client"

import { useEffect, useState, useRef, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Top Navigation Progress Bar Content
 * - Triggers immediately when an internal link is clicked or route change starts
 * - Displays a sleek, slim brand-colored progress bar at the top of the viewport
 * - Automatically completes and fades out when pathname/searchParams update
 */
function NavigationProgressBarContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [state, setState] = useState<'idle' | 'loading' | 'completing'>('idle')
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const completeTimerRef = useRef<NodeJS.Timeout | null>(null)

  const start = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current)

    setState('loading')
    setProgress(15)

    // Incrementally increase progress to simulate activity
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 85
        }
        // Jump faster at start, slower near the end
        const step = Math.max(1, (85 - prev) * 0.15)
        return Math.min(85, prev + step)
      })
    }, 120)
  }

  const complete = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setProgress(100)
    setState('completing')

    completeTimerRef.current = setTimeout(() => {
      setState('idle')
      setProgress(0)
    }, 350)
  }

  // Intercept click on internal <a> links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = e.target as HTMLElement | null
      const anchor = target?.closest('a') as HTMLAnchorElement | null
      if (!anchor) return

      const href = anchor.getAttribute('href')
      const targetAttr = anchor.getAttribute('target')

      // Ignore external links, downloads, new tabs, modifier keys, hash-only
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        targetAttr === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return
      }

      // Check if href is internal and different from current location
      try {
        const targetUrl = new URL(href, window.location.href)
        const currentUrl = new URL(window.location.href)

        // Only start if navigating to a different pathname/search
        if (
          targetUrl.origin === currentUrl.origin &&
          (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
        ) {
          start()
        }
      } catch {
        // Ignore invalid URLs
      }
    }

    const handleCustomStart = () => start()
    const handleCustomComplete = () => complete()

    document.addEventListener('click', handleDocumentClick, true)
    window.addEventListener('lb:nav-start', handleCustomStart)
    window.addEventListener('lb:nav-complete', handleCustomComplete)

    return () => {
      document.removeEventListener('click', handleDocumentClick, true)
      window.removeEventListener('lb:nav-start', handleCustomStart)
      window.removeEventListener('lb:nav-complete', handleCustomComplete)
      if (timerRef.current) clearInterval(timerRef.current)
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
    }
  }, [])

  // When pathname or searchParams change, mark the navigation complete
  useEffect(() => {
    complete()
  }, [pathname, searchParams])

  if (state === 'idle') return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300"
      style={{
        opacity: state === 'completing' ? 0 : 1,
      }}
    >
      <div
        className="h-[2.5px] w-full transition-all duration-200 ease-out shadow-[0_0_12px_rgba(254,69,72,0.85)]"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #FE4548 0%, #FF6E54 50%, #FFA07A 100%)',
        }}
      />
    </div>
  )
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBarContent />
    </Suspense>
  )
}
