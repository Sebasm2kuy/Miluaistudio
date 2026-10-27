'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Revela el contenido con un fade-up suave cuando entra en viewport.
 * Sin JS el contenido permanece visible (la clase .js solo existe con JS)
 * y respeta prefers-reduced-motion.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      // Sin soporte de observer: mostrar el contenido directamente.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={'reveal' + (visible ? ' is-visible' : '') + (className ? ' ' + className : '')}
      style={delay ? { transitionDelay: delay + 'ms' } : undefined}
    >
      {children}
    </div>
  );
}
