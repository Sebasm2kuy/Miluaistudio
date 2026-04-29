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
          <motion.div
            animate={{ y: [0, -5, 0], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Music size={18} strokeWidth={1.5} className="text-goldLight/60 sm:w-5 sm:h-5" />
          </motion.div>
          <h2 className="font-serif italic text-2xl sm:text-3xl md:text-5xl text-bordeaux">
            Nuestra Playlist
          </h2>
        </div>
        <p className="text-gray-400 italic mb-4 sm:mb-6 md:mb-8 text-xs sm:text-sm md:text-base px-2">
          Escuchá nuestra selección y ayudanos con la música de la noche
        </p>

        <motion.a
          href="https://open.spotify.com/playlist/4RAVjizGdBtJx18kkwttqn?si=cefb9bcb1cdf470c&pt=c7fa8ec582e71775cd0ebda794d251d0"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 sm:gap-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-white text-xs sm:text-sm md:text-base font-semibold px-5 sm:px-7 md:px-10 py-2.5 sm:py-3 md:py-3.5 rounded-full mb-6 sm:mb-10 md:mb-12 transition-colors duration-300 shadow-lg"
          style={{ boxShadow: '0 4px 20px rgba(29,185,84,0.35)' }}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
          Agregar canciones
        </motion.a>

        <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
          <iframe
            src="https://open.spotify.com/embed/playlist/4RAVjizGdBtJx18kkwttqn?utm_source=generator&theme=0&si=cefb9bcb1cdf470c&pt=c7fa8ec582e71775cd0ebda794d251d0"
            width="100%"
            height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
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
