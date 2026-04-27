'use client'
import { motion } from 'framer-motion'
import { Music } from 'lucide-react'

export default function SpotifyPlayer() {
  return (
    <section id="musica" className="max-w-3xl mx-auto px-3 sm:px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-5 sm:p-8 md:p-16 text-center relative overflow-hidden"
      >
        <div className="flex items-center justify-center gap-2.5 mb-2 sm:mb-3">
          <Music size={18} strokeWidth={1.5} className="text-goldLight/60 sm:w-5 sm:h-5" />
          <h2 className="font-serif italic text-2xl sm:text-3xl md:text-5xl text-bordeaux">
            Nuestra Playlist
          </h2>
        </div>
        <p className="text-gray-400 italic mb-6 sm:mb-10 md:mb-12 text-xs sm:text-sm md:text-base px-2">
          Ayudanos a elegir la musica de la noche. Agrega tus canciones favoritas a la playlist
        </p>

        <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
          <iframe
            src="https://open.spotify.com/embed/playlist/4RAVjizGdBtJx18kkwttqn?utm_source=generator&theme=0"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ borderRadius: '12px' }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-5 sm:mt-6 text-xs sm:text-sm md:text-base uppercase tracking-[0.15em] sm:tracking-[0.2em] text-goldLight/70 font-light"
        >
          Abre en Spotify y suma tus temas favoritos
        </motion.p>
      </motion.div>
    </section>
  )
}
