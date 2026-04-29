import { useEffect, useRef, useState } from 'react'

/**
 * Lightweight IntersectionObserver hook — replaces framer-motion whileInView.
 * Fires once and disconnects immediately.
 * Zero JS animation overhead — just adds a CSS class.
 */
export function useInView(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '-60px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isInView }
}
