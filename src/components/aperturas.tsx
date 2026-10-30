'use client'
import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useConfig } from '@/hooks/useConfig'
import Envelope from '@/components/envelope'
import { fechaVisual } from '@/components/mini-invitation'
import type { SiteConfig } from '@/data/config-schema'

/**
 * Apertura animada de la invitación. `tipo` viene de APERTURAS_META
 * (config.apertura.tipo); 'sobre' conserva la apertura clásica original.
 * Todas las variantes heredan los colores del diseño y avisan "tocá para abrir".
 */

interface AperturaProps {
  tipo: string
  onOpen: () => void
}

/** PRNG determinista: mismas posiciones en servidor y cliente (sin hidratación rota) */
function prng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/* ---------- piezas compartidas ---------- */

function Resplandor({ accent, tam = 480 }: { accent: string; tam?: number }) {
  return (
    <div
      aria-hidden="true"
      className="absolute rounded-full"
      style={{
        width: tam,
        height: tam,
        left: '50%',
        top: '44%',
        translate: '-50% -50%',
        background: `radial-gradient(circle, color-mix(in srgb, ${accent} 22%, transparent) 0%, transparent 65%)`,
        animation: 'apResplandor 3.6s ease-in-out infinite',
      }}
    />
  )
}

function TituloApertura({ cfg, accent, texto }: { cfg: SiteConfig; accent: string; texto: string }) {
  return (
    <div className="relative z-10 text-center px-6">
      <div style={{ fontSize: 11, letterSpacing: '0.42em', textIndent: '0.42em', textTransform: 'uppercase', color: texto, opacity: 0.8 }}>
        {cfg.evento.tipo}
      </div>
      <div
        className="font-cursive"
        style={{ fontSize: 'clamp(2.6rem, 9vw, 4rem)', lineHeight: 1.12, color: accent, marginTop: 10, textShadow: `0 0 26px color-mix(in srgb, ${accent} 35%, transparent)` }}
      >
        {cfg.evento.nombre}
      </div>
      <div className="flex items-center justify-center gap-3 my-3.5" aria-hidden="true">
        <span style={{ width: 46, height: 1, background: `linear-gradient(90deg, transparent, ${accent})` }} />
        <span style={{ width: 6, height: 6, rotate: '45deg', background: accent }} />
        <span style={{ width: 46, height: 1, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      </div>
      <div style={{ fontSize: 13, letterSpacing: '0.3em', textIndent: '0.3em', color: texto }}>
        {fechaVisual(cfg.evento.fecha, cfg.evento.anio)}
      </div>
    </div>
  )
}

/* ---------- 1 · Sobre clásico (la apertura original) ---------- */

function AperturaSobre({ onOpen }: { onOpen: () => void }) {
  const abrir = useCallback(() => {
    window.dispatchEvent(new CustomEvent('milua:abrir'))
    onOpen()
  }, [onOpen])
  return <Envelope onOpen={abrir} />
}

/* ---------- 2 · Cortinas de gala ---------- */

function ContenidoCortina({ cfg, abriendo, accent, accentLight, texto }: { cfg: SiteConfig; abriendo: boolean; accent: string; accentLight: string; texto: string }) {
  const panel = (lado: 'izq' | 'der'): CSSProperties => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '52%',
    [lado === 'izq' ? 'left' : 'right']: 0,
    zIndex: 20,
    background: `linear-gradient(${lado === 'izq' ? '90deg' : '270deg'}, #0b0b0e 0%, color-mix(in srgb, ${accent} 14%, #12100b) 55%, color-mix(in srgb, ${accent} 30%, #1a160d) 100%)`,
    transition: 'transform 1.3s cubic-bezier(.65,0,.35,1)',
    transform: abriendo ? `translateX(${lado === 'izq' ? '-108%' : '108%'})` : 'none',
    boxShadow: lado === 'izq' ? '8px 0 26px rgba(0,0,0,0.55)' : '-8px 0 26px rgba(0,0,0,0.55)',
  })
  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at 50% 40%, #16130c 0%, #060606 72%)' }}>
        <Resplandor accent={accentLight} />
        <TituloApertura cfg={cfg} accent={accentLight} texto={texto} />
      </div>
      {(['izq', 'der'] as const).map((lado) => (
        <div key={lado} style={panel(lado)}>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 16px, transparent 16px 42px)' }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              [lado === 'izq' ? 'right' : 'left']: 0,
              width: 5,
              background: `linear-gradient(180deg, transparent, ${accentLight} 30%, ${accentLight} 70%, transparent)`,
              opacity: 0.85,
            }}
          />
        </div>
      ))}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 z-30"
        style={{ height: '4.5%', background: `linear-gradient(180deg, #08080a, color-mix(in srgb, ${accent} 22%, #141109))`, boxShadow: '0 6px 18px rgba(0,0,0,0.5)' }}
      />
    </>
  )
}

/* ---------- 3 · Caja de regalo ---------- */

function ContenidoRegalo({ cfg, abriendo, accent, accentLight, texto }: { cfg: SiteConfig; abriendo: boolean; accent: string; accentLight: string; texto: string }) {
  const chispas = useMemo(() => {
    const rnd = prng(77)
    return Array.from({ length: 10 }, (_, i) => ({
      dx: Math.cos((i / 10) * Math.PI * 2) * (90 + rnd() * 70),
      dy: Math.sin((i / 10) * Math.PI * 2) * (80 + rnd() * 60) - 40,
      delay: rnd() * 0.18,
    }))
  }, [])
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-9">
      <div className="relative" style={{ width: 'min(54vw, 250px)' }}>
        {abriendo &&
          chispas.map((c, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2"
              style={{
                width: 10,
                height: 10,
                background: accentLight,
                rotate: '45deg',
                ['--dx' as string]: `${c.dx}px`,
                ['--dy' as string]: `${c.dy}px`,
                animation: `apEstallar .95s ease ${c.delay}s forwards`,
                zIndex: 5,
              }}
            />
          ))}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1', animation: 'apFlotar 3.6s ease-in-out infinite' }}>
          {/* moño */}
          <div
            className="absolute left-1/2"
            style={{
              top: '2%',
              width: '48%',
              height: '17%',
              translate: '-50% 0',
              transform: abriendo ? 'translateY(-160%) rotate(-8deg)' : 'none',
              transition: 'transform .95s cubic-bezier(.34,1.35,.5,1)',
              zIndex: 3,
            }}
          >
            <span className="absolute left-0 top-0" style={{ width: '46%', height: '100%', border: `7px solid ${accentLight}`, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', opacity: 0.95 }} />
            <span className="absolute right-0 top-0" style={{ width: '46%', height: '100%', border: `7px solid ${accentLight}`, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', opacity: 0.95 }} />
            <span className="absolute left-1/2 top-1/2" style={{ width: 14, height: 14, background: accentLight, borderRadius: 4, translate: '-50% -50%' }} />
          </div>
          {/* tapa */}
          <div
            className="absolute"
            style={{
              left: '-7%',
              right: '-7%',
              top: '20%',
              height: '21%',
              borderRadius: 10,
              background: `linear-gradient(180deg, color-mix(in srgb, ${accentLight} 82%, #fff) 0%, ${accent} 100%)`,
              boxShadow: '0 8px 22px rgba(0,0,0,0.35)',
              transform: abriendo ? 'translateY(-165%) rotate(-9deg)' : 'none',
              transition: 'transform .95s cubic-bezier(.34,1.35,.5,1)',
              zIndex: 2,
            }}
          />
          {/* caja */}
          <div
            className="absolute"
            style={{
              inset: '40% 0 0 0',
              borderRadius: '4px 4px 16px 16px',
              background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 80%, #2b2415) 0%, color-mix(in srgb, ${accent} 55%, #14100a) 100%)`,
              boxShadow: '0 18px 44px rgba(0,0,0,0.45)',
              transform: abriendo ? 'translateY(30px)' : 'none',
              transition: 'transform .85s ease',
            }}
          >
            <span className="absolute left-1/2 top-0 bottom-0" style={{ width: '17%', translate: '-50% 0', background: `color-mix(in srgb, ${accentLight} 75%, transparent)`, opacity: 0.85 }} />
          </div>
        </div>
      </div>
      <TituloApertura cfg={cfg} accent={accentLight} texto={texto} />
    </div>
  )
}

/* ---------- 4 · Corazón que late ---------- */

function ContenidoCorazon({ cfg, abriendo, accent, accentLight, texto }: { cfg: SiteConfig; abriendo: boolean; accent: string; accentLight: string; texto: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
      <Resplandor accent={accentLight} tam={420} />
      <svg
        viewBox="0 0 32 29"
        aria-hidden="true"
        className="relative z-10"
        style={{
          width: 'min(38vw, 190px)',
          fill: accent,
          filter: `drop-shadow(0 0 24px color-mix(in srgb, ${accentLight} 55%, transparent))`,
          animation: 'apLatido 1.7s ease-in-out infinite',
          transform: abriendo ? 'scale(1.85)' : undefined,
          opacity: abriendo ? 0 : 1,
          transition: 'transform .9s ease, opacity .9s ease',
        }}
      >
        <path d="M23.6 0c-3.4 0-6.3 2.7-7.6 5.6C14.7 2.7 11.8 0 8.4 0 3.8 0 0 3.8 0 8.4c0 9.4 9.5 11.9 16 19.2 6.1-7.3 16-9.8 16-19.2C32 3.8 28.2 0 23.6 0z" />
      </svg>
      <TituloApertura cfg={cfg} accent={accentLight} texto={texto} />
    </div>
  )
}

/* ---------- 5 · Cielo estrellado ---------- */

function ContenidoEstrellas({ cfg, abriendo, accent, accentLight, texto }: { cfg: SiteConfig; abriendo: boolean; accent: string; accentLight: string; texto: string }) {
  const estrellas = useMemo(() => {
    const rnd = prng(2027)
    return Array.from({ length: 52 }, () => ({
      left: rnd() * 100,
      top: rnd() * 100,
      tam: 1.5 + rnd() * 2.6,
      delay: rnd() * 3,
      dur: 1.8 + rnd() * 2.2,
      clara: rnd() > 0.45,
    }))
  }, [])
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, color-mix(in srgb, ${accent} 20%, #0b1120) 0%, #05070f 72%)`,
          opacity: abriendo ? 0 : 1,
          transition: 'opacity .8s ease',
        }}
      />
      <div className="absolute inset-0" style={{ opacity: abriendo ? 0 : 1, transform: abriendo ? 'scale(1.25)' : 'none', transition: 'opacity .8s ease, transform 1.2s ease' }}>
        {estrellas.map((e, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute rounded-full"
            style={{
              left: `${e.left}%`,
              top: `${e.top}%`,
              width: e.tam,
              height: e.tam,
              background: e.clara ? accentLight : accent,
              boxShadow: `0 0 ${e.tam * 3}px ${e.clara ? accentLight : accent}`,
              animation: `apTitilar ${e.dur}s ease-in-out ${e.delay}s infinite`,
            }}
          />
        ))}
        <svg
          viewBox="0 0 40 40"
          aria-hidden="true"
          className="absolute left-1/2"
          style={{
            top: '18%',
            width: 'min(14vw, 64px)',
            translate: '-50% 0',
            fill: accentLight,
            filter: `drop-shadow(0 0 18px ${accentLight})`,
            animation: abriendo ? 'apDestelloGiro .9s ease forwards' : 'apDestelloGiro 7s ease-in-out infinite',
          }}
        >
          <path d="M20 0c1.2 11.5 8.5 18.8 20 20-11.5 1.2-18.8 8.5-20 20-1.2-11.5-8.5-18.8-20-20C11.5 18.8 18.8 11.5 20 0z" />
        </svg>
      </div>
      <div className="absolute inset-0 flex items-end justify-center pb-[22vh]" style={{ opacity: abriendo ? 0 : 1, transition: 'opacity .7s ease' }}>
        <TituloApertura cfg={cfg} accent={accentLight} texto={texto} />
      </div>
    </>
  )
}

/* ---------- 6 · Gran puerta ---------- */

function ContenidoPuerta({ cfg, abriendo, accent, accentLight, texto }: { cfg: SiteConfig; abriendo: boolean; accent: string; accentLight: string; texto: string }) {
  const puerta = (lado: 'izq' | 'der'): CSSProperties => ({
    position: 'relative',
    width: 'min(36vw, 200px)',
    height: 'min(62vh, 430px)',
    background: `linear-gradient(${lado === 'izq' ? '100deg' : '260deg'}, color-mix(in srgb, ${accent} 20%, #171310) 0%, #0d0b08 90%)`,
    borderRadius: lado === 'izq' ? '10px 0 0 10px' : '0 10px 10px 0',
    transition: 'transform 1.15s cubic-bezier(.6,0,.3,1)',
    transformOrigin: lado === 'izq' ? 'left center' : 'right center',
    transform: abriendo ? `perspective(1100px) rotateY(${lado === 'izq' ? -74 : 74}deg)` : 'none',
    boxShadow: 'inset 0 0 0 1px color-mix(in srgb, ' + accentLight + ' 30%, transparent), 0 14px 40px rgba(0,0,0,0.5)',
  })
  return (
    <>
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at 50% 45%, color-mix(in srgb, ' + accentLight + ' 26%, #241c0e) 0%, #070604 70%)' }}>
        <div style={{ opacity: abriendo ? 1 : 0.35, transition: 'opacity 1s ease' }}>
          <TituloApertura cfg={cfg} accent={accentLight} texto={texto} />
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center gap-0" style={{ perspective: 1100 }}>
        {(['izq', 'der'] as const).map((lado) => (
          <div key={lado} style={puerta(lado)}>
            <span className="absolute" style={{ inset: '12% 14%', border: `1px solid color-mix(in srgb, ${accentLight} 38%, transparent)`, borderRadius: 6 }} />
            <span className="absolute" style={{ inset: '24% 26%', border: `1px solid color-mix(in srgb, ${accentLight} 26%, transparent)`, borderRadius: 4 }} />
            <span
              className="absolute"
              style={{
                [lado === 'izq' ? 'right' : 'left']: '9%',
                top: '48%',
                width: 13,
                height: 13,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${accentLight}, ${accent})`,
                boxShadow: `0 0 10px color-mix(in srgb, ${accentLight} 60%, transparent)`,
              }}
            />
          </div>
        ))}
      </div>
    </>
  )
}

/* ---------- 7 · Pergamino real ---------- */

function ContenidoPergamino({ cfg, abriendo }: { cfg: SiteConfig; abriendo: boolean; accent: string; accentLight: string; texto: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        style={{
          width: 'min(76vw, 320px)',
          transform: abriendo ? 'scaleY(0.02)' : 'none',
          opacity: abriendo ? 0.4 : 1,
          transition: 'transform .9s cubic-bezier(.55,0,.7,1), opacity .9s ease',
          animation: abriendo ? 'none' : 'apFlotar 4.4s ease-in-out infinite',
          filter: 'drop-shadow(0 22px 40px rgba(0,0,0,0.45))',
        }}
      >
        {/* rollo superior */}
        <div style={{ height: 22, margin: '0 -12px', borderRadius: 999, background: 'linear-gradient(180deg, #d9bd85, #a8874e)', boxShadow: '0 3px 8px rgba(0,0,0,0.35)' }} />
        <div
          className="relative text-center px-8 py-9"
          style={{
            background: 'linear-gradient(180deg, #f8efda 0%, #ecdcb6 100%)',
            color: '#5a4632',
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: '0.34em', textTransform: 'uppercase', opacity: 0.7 }}>{cfg.evento.tipo}</div>
          <div className="font-cursive" style={{ fontSize: 'clamp(2.2rem, 8vw, 3.2rem)', color: '#7c5a2e', margin: '12px 0 6px', lineHeight: 1.1 }}>
            {cfg.evento.nombre}
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.26em', marginTop: 8 }}>✦</div>
          <div style={{ fontSize: 12, letterSpacing: '0.24em', marginTop: 8 }}>{fechaVisual(cfg.evento.fecha, cfg.evento.anio)}</div>
        </div>
        {/* rollo inferior */}
        <div style={{ height: 22, margin: '0 -12px', borderRadius: 999, background: 'linear-gradient(180deg, #a8874e, #d9bd85)', boxShadow: '0 -3px 8px rgba(0,0,0,0.3)' }} />
      </div>
    </div>
  )
}

/* ---------- 8 · Ticket dorado ---------- */

function ContenidoTicket({ cfg, abriendo, accent, accentLight, texto }: { cfg: SiteConfig; abriendo: boolean; accent: string; accentLight: string; texto: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">
      <div
        className="relative"
        style={{
          width: 'min(82vw, 400px)',
          transform: abriendo ? 'translateX(60vw) rotate(9deg)' : 'rotate(-4deg)',
          opacity: abriendo ? 0 : 1,
          transition: 'transform .95s cubic-bezier(.5,0,.8,.4), opacity .8s ease',
          animation: abriendo ? 'none' : 'apFlotar 4s ease-in-out infinite',
          filter: `drop-shadow(0 16px 34px color-mix(in srgb, ${accent} 45%, rgba(0,0,0,0.4)))`,
        }}
      >
        <div
          className="relative flex items-stretch overflow-hidden"
          style={{
            background: `linear-gradient(120deg, color-mix(in srgb, ${accentLight} 72%, #f7ecd2) 0%, ${accent} 100%)`,
            borderRadius: 14,
            color: '#2f2312',
          }}
        >
          <div className="flex-1 text-center py-7 px-5">
            <div style={{ fontSize: 9.5, letterSpacing: '0.4em', textIndent: '0.4em', fontWeight: 700, opacity: 0.75 }}>ADMITE UNO</div>
            <div className="font-cursive" style={{ fontSize: 'clamp(1.9rem, 7vw, 2.7rem)', lineHeight: 1.15, margin: '6px 0 2px' }}>
              {cfg.evento.nombre}
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.24em', fontWeight: 600 }}>{fechaVisual(cfg.evento.fecha, cfg.evento.anio)}</div>
          </div>
          <div
            className="relative flex items-center justify-center"
            style={{ width: 74, borderLeft: '2px dashed rgba(47,35,18,0.5)' }}
          >
            <span style={{ writingMode: 'vertical-rl', fontSize: 10, letterSpacing: '0.34em', fontWeight: 700, opacity: 0.8 }}>LUMEN GALA</span>
            {/* muescas */}
            <span className="absolute left-1/2" style={{ top: -11, width: 22, height: 22, borderRadius: '50%', background: '#0a0a0a', translate: '-50% 0' }} />
            <span className="absolute left-1/2" style={{ bottom: -11, width: 22, height: 22, borderRadius: '50%', background: '#0a0a0a', translate: '-50% 0' }} />
          </div>
        </div>
      </div>
      <TituloApertura cfg={cfg} accent={accentLight} texto={texto} />
    </div>
  )
}

/* ---------- 9 · Flor que florece ---------- */

function ContenidoFlores({ cfg, abriendo, accent, accentLight, texto }: { cfg: SiteConfig; abriendo: boolean; accent: string; accentLight: string; texto: string }) {
  const [florecida, setFlorecida] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setFlorecida(true), 60)
    return () => clearTimeout(t)
  }, [])
  const inicial = (cfg.evento.nombre.trim()[0] || '✦').toUpperCase()
  const petalos = Array.from({ length: 8 }, (_, i) => i)
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
      <Resplandor accent={accentLight} tam={430} />
      <div className="relative z-10" style={{ width: 'min(62vw, 280px)', aspectRatio: '1' }}>
        {petalos.map((i) => {
          const scale = florecida ? 1 : 0.18
          const open = abriendo ? 1.35 : scale
          return (
            <span
              key={i}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2"
              style={{
                width: '30%',
                height: '52%',
                borderRadius: '50%',
                background: `linear-gradient(180deg, color-mix(in srgb, ${accentLight} 85%, #fff) 0%, ${accent} 78%)`,
                opacity: abriendo ? 0 : 0.92,
                transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(${abriendo ? -95 : -50}px) scale(${open})`,
                transition: `transform 1.1s ease ${i * 0.12}s, opacity .8s ease ${i * 0.08}s`,
                boxShadow: `0 4px 18px color-mix(in srgb, ${accent} 35%, transparent)`,
              }}
            />
          )
        })}
        <span
          className="absolute left-1/2 top-1/2 flex items-center justify-center rounded-full font-cursive"
          style={{
            width: '30%',
            aspectRatio: '1',
            translate: '-50% -50%',
            background: `radial-gradient(circle at 35% 30%, ${accentLight}, ${accent})`,
            color: '#231a0d',
            fontSize: 'clamp(1.6rem, 6vw, 2.4rem)',
            boxShadow: `0 0 30px color-mix(in srgb, ${accentLight} 60%, transparent)`,
            transform: abriendo ? 'translate(-50%, -50%) scale(1.4)' : 'translate(-50%, -50%) scale(1)',
            transition: 'transform .9s ease',
            opacity: abriendo ? 0 : 1,
          }}
        >
          {inicial}
        </span>
      </div>
      <TituloApertura cfg={cfg} accent={accentLight} texto={texto} />
    </div>
  )
}

/* ---------- 10 · Lluvia de confeti ---------- */

function ContenidoConfeti({ cfg, abriendo, accent, accentLight, texto }: { cfg: SiteConfig; abriendo: boolean; accent: string; accentLight: string; texto: string }) {
  const piezas = useMemo(() => {
    const rnd = prng(1515)
    const colores = [accent, accentLight, '#ffffff', texto]
    return Array.from({ length: 56 }, () => ({
      left: rnd() * 100,
      ancho: 5 + rnd() * 5,
      dur: 2.6 + rnd() * 2.6,
      delay: -rnd() * 5,
      color: colores[Math.floor(rnd() * colores.length)],
      redondo: rnd() > 0.7,
    }))
  }, [])
  return (
    <>
      <div className="absolute inset-0 overflow-hidden" style={{ opacity: abriendo ? 0 : 1, transform: abriendo ? 'scale(1.15)' : 'none', transition: 'opacity .7s ease, transform 1s ease' }}>
        {piezas.map((p, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute"
            style={{
              left: `${p.left}%`,
              top: 0,
              width: p.ancho,
              height: p.ancho * (p.redondo ? 1 : 1.7),
              borderRadius: p.redondo ? '50%' : 2,
              background: p.color,
              opacity: 0.9,
              animation: `apCaerConfeti ${p.dur}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: abriendo ? 0 : 1, transform: abriendo ? 'scale(1.12)' : 'none', transition: 'opacity .65s ease, transform .9s ease' }}>
        <div className="rounded-3xl px-8 py-7" style={{ background: 'rgba(8,8,10,0.45)', backdropFilter: 'blur(6px)' }}>
          <TituloApertura cfg={cfg} accent={accentLight} texto={texto} />
        </div>
      </div>
    </>
  )
}

/* ---------- shell + selector ---------- */

function AperturaAnimada({ tipo, onOpen }: AperturaProps) {
  const cfg = useConfig()
  const [abriendo, setAbriendo] = useState(false)
  const light = cfg.estilos.modoClaro === true
  const accent = cfg.colores.dorado
  const accentLight = cfg.colores.doradoClaro
  const texto = light ? 'color-mix(in srgb, var(--theme-accent) 80%, var(--theme-ivory))' : 'color-mix(in srgb, var(--theme-accent-light) 70%, transparent)'
  // Las aperturas de "revelado" (cortina, puerta) merecen más tiempo en escena
  const esRevelado = tipo === 'cortina' || tipo === 'puerta'
  const demoraFade = esRevelado ? 0.85 : 0.45
  const demoraAbrir = esRevelado ? 1300 : 800

  const abrir = useCallback(() => {
    setAbriendo((prev) => {
      if (prev) return prev
      window.dispatchEvent(new CustomEvent('milua:abrir'))
      setTimeout(onOpen, demoraAbrir)
      return true
    })
  }, [onOpen, demoraAbrir])

  const contenido: Record<string, ReactNode> = {
    cortina: <ContenidoCortina cfg={cfg} abriendo={abriendo} accent={accent} accentLight={accentLight} texto={texto} />,
    regalo: <ContenidoRegalo cfg={cfg} abriendo={abriendo} accent={accent} accentLight={accentLight} texto={texto} />,
    corazon: <ContenidoCorazon cfg={cfg} abriendo={abriendo} accent={accent} accentLight={accentLight} texto={texto} />,
    estrellas: <ContenidoEstrellas cfg={cfg} abriendo={abriendo} accent={accent} accentLight={accentLight} texto={texto} />,
    puerta: <ContenidoPuerta cfg={cfg} abriendo={abriendo} accent={accent} accentLight={accentLight} texto={texto} />,
    pergamino: <ContenidoPergamino cfg={cfg} abriendo={abriendo} accent={accent} accentLight={accentLight} texto={texto} />,
    ticket: <ContenidoTicket cfg={cfg} abriendo={abriendo} accent={accent} accentLight={accentLight} texto={texto} />,
    flores: <ContenidoFlores cfg={cfg} abriendo={abriendo} accent={accent} accentLight={accentLight} texto={texto} />,
    confeti: <ContenidoConfeti cfg={cfg} abriendo={abriendo} accent={accent} accentLight={accentLight} texto={texto} />,
  }

  return (
    <div
      onClick={abrir}
      role="button"
      aria-label={cfg.invitacion.textoAbrir}
      className="fixed inset-0 z-[200] cursor-pointer overflow-hidden select-none"
      style={{
        background: light
          ? `radial-gradient(ellipse at 50% 38%, color-mix(in srgb, ${accent} 14%, #fffdf8) 0%, ${cfg.colores.fondo} 78%)`
          : `radial-gradient(ellipse at 50% 38%, color-mix(in srgb, ${accent} 10%, #0b0b0d) 0%, #050505 75%)`,
        opacity: abriendo ? 0 : 1,
        transition: `opacity .6s ease ${demoraFade}s`,
      }}
    >
      {contenido[tipo] ?? contenido.regalo}
      <div
        className="fixed bottom-6 sm:bottom-12 left-0 right-0 text-center text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light"
        style={{
          color: texto,
          opacity: abriendo ? 0 : 1,
          animation: abriendo ? 'none' : 'fadeIn 1s ease 1.4s both, slideHint 2.5s ease-in-out 2.4s infinite',
        }}
      >
        {cfg.invitacion.textoAbrir}
      </div>
    </div>
  )
}

export default function Apertura({ tipo, onOpen }: AperturaProps) {
  if (tipo === 'sobre') return <AperturaSobre onOpen={onOpen} />
  return <AperturaAnimada tipo={tipo} onOpen={onOpen} />
}
