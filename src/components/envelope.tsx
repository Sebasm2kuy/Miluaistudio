'use client'
import { useState, useCallback } from 'react'

interface EnvelopeProps { onOpen: () => void }

export default function Envelope({ onOpen }: EnvelopeProps) {
  const [opening, setOpening] = useState(false)
  const [fading, setFading] = useState(false)

  const handleOpen = useCallback(() => {
    if (opening) return
    setOpening(true)
    // Esperar a que la solapa se abra antes de mostrar el loader
    setTimeout(() => {
      setFading(true)
      onOpen()
    }, 1000)
  }, [opening, onOpen])

  return (
    <div
      onClick={handleOpen}
      className="fixed inset-0 z-[200] cursor-pointer bg-black flex items-center justify-center"
      style={{
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
        padding: 'clamp(20px, 5vw, 60px)',
      }}
    >
      <div
        className="relative"
        style={{
          width: 'min(76vw, 340px)',
          animation: 'fadeIn 1.5s ease forwards',
        }}
      >
        {/* Resplandor dorado detras del sobre */}
        <div
          className="absolute rounded-3xl"
          style={{
            inset: '-24px',
            background: 'radial-gradient(ellipse, rgba(212,175,55,0.2) 0%, transparent 60%)',
            animation: 'breathe 3s ease-in-out infinite',
            filter: 'blur(20px)',
          }}
        />

        {/* Contenedor del sobre con perspectiva 3D */}
        <div
          className="relative rounded-lg"
          style={{
            aspectRatio: '4/5.2',
            perspective: '800px',
          }}
        >
          {/* Cuerpo del sobre (parte trasera) */}
          <div
            className="absolute inset-0 rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(165deg, #f5e6c8 0%, #ebd8ac 30%, #dcc89a 60%, #ccb888 100%)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            {/* Forro interior del sobre */}
            <div
              className="absolute rounded-lg"
              style={{
                inset: '5px',
                background: 'linear-gradient(165deg, #fdf8ee, #f5edda)',
                borderRadius: '0 0 10px 10px',
              }}
            />
            {/* Borde decorativo interior */}
            <div
              className="absolute"
              style={{
                inset: '14px',
                border: '1px solid rgba(184,134,11,0.1)',
                borderRadius: '0 0 6px 6px',
              }}
            />
            {/* Lineas decorativas abajo */}
            <div className="absolute bottom-4 left-[12%] right-[12%] space-y-1.5">
              {[80, 60, 40].map((w, i) => (
                <div key={i} className="h-px" style={{
                  background: 'rgba(184,134,11,0.15)',
                  width: `${w}%`,
                  marginLeft: `${(100 - w) / 2}%`,
                }} />
              ))}
            </div>
          </div>

          {/* Solapa inferior (V invertida) */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '48%',
              clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
              background: 'linear-gradient(0deg, #b8a060, #d4c090)',
              zIndex: 2,
            }}
          />

          {/* Solapa superior (la que se abre en 3D) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '55%',
              transformOrigin: 'top center',
              transform: opening ? 'rotateX(-180deg)' : 'rotateX(0deg)',
              transition: 'transform 1s cubic-bezier(0.33, 1, 0.68, 1)',
              transformStyle: 'preserve-3d',
              WebkitTransformStyle: 'preserve-3d',
              zIndex: 4,
            }}
          >
            {/* Cara frontal de la solapa */}
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, #d8c498 0%, #ccb888 50%, #c0a870 100%)',
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }} />
            {/* Cara trasera de la solapa (visible al abrirse) */}
            <div style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(0deg, #a89050 0%, #c0a870 100%)',
              clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
              transform: 'rotateX(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }} />
          </div>

          {/* Sello con glow pulsante */}
          <div
            className="absolute z-[5]"
            style={{
              left: '50%',
              top: '37%',
              transform: 'translate(-50%, -50%)',
              opacity: opening ? 0 : 1,
              transition: 'opacity 0.4s ease',
            }}
          >
            {/* Halo dorado pulsante */}
            <div
              className="absolute rounded-full"
              style={{
                inset: '-18px',
                background: 'radial-gradient(circle, rgba(212,175,55,0.55) 0%, rgba(184,134,11,0.15) 50%, transparent 70%)',
                animation: 'breathe 2.5s ease-in-out infinite',
                filter: 'blur(8px)',
              }}
            />
            {/* Anillo dorado */}
            <div
              className="absolute rounded-full"
              style={{
                inset: '-6px',
                border: '1.5px solid rgba(212,175,55,0.25)',
                animation: 'breathe 2.5s ease-in-out infinite',
              }}
            />
            <img
              src="/Miluaistudio/sello.png"
              alt="Sello"
              draggable={false}
              style={{
                width: 'clamp(60px, 20vw, 100px)',
                height: 'clamp(60px, 20vw, 100px)',
                display: 'block',
                position: 'relative',
                filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.5))',
              }}
            />
          </div>
        </div>
      </div>

      {/* Texto "Toca para abrir" */}
      <p
        className="fixed bottom-6 sm:bottom-12 left-0 right-0 text-center text-goldLight/60 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] font-light"
        style={{
          opacity: fading ? 0 : undefined,
          animation: !fading ? 'fadeIn 1s ease 2s both, slideHint 2.5s ease-in-out 3s infinite' : undefined,
        }}
      >
        Toca para abrir
      </p>
    </div>
  )
}
