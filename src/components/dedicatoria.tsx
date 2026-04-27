'use client'
import { motion } from 'framer-motion'

export default function Dedicatoria() {
  return (
    <section id="dedicatoria" className="max-w-3xl mx-auto px-3 sm:px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
        className="glass-card rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] p-6 sm:p-10 md:p-20 text-center relative overflow-hidden"
      >
        {/* Decorativa superior */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-20 sm:w-28 mx-auto mb-6 sm:mb-8 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, #d4af37, #fcf6ba, #d4af37, transparent)',
            boxShadow: '0 0 12px rgba(212,175,55,0.3)',
          }}
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-cursive text-2xl sm:text-3xl md:text-4xl text-bordeaux mb-6 sm:mb-8"
        >
          Queridos familiares y amigos
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4 sm:space-y-5 md:space-y-6 text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed sm:leading-relaxed md:leading-loose font-light"
        >
          <p>
            Hay momentos en la vida que soñamos desde pequeñas, y esta noche es una de ellos. Mis XV años no son solo una celebración, son el inicio de una etapa nueva llena de sueños, risas y recuerdos que quiero compartir con cada uno de ustedes.
          </p>
          <p>
            Cada persona que lee esta invitación tiene un lugar especial en mi corazón. Su presencia es el mejor regalo que me pueden hacer, y que juntos hagamos de esta noche algo verdaderamente inolvidable.
          </p>
          <p>
            Los espero con el corazón abierto y una sonrisa enorme.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.7 }}
          className="font-cursive text-xl sm:text-2xl md:text-3xl mt-6 sm:mt-8 md:mt-10"
          style={{
            background: 'linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fcf6ba, #bf953f)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 6s ease-in-out infinite',
          }}
        >
          Con todo mi amor, Milagros
        </motion.p>

        {/* Decorativa inferior */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-20 sm:w-28 mx-auto mt-6 sm:mt-8 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, #d4af37, #fcf6ba, #d4af37, transparent)',
            boxShadow: '0 0 12px rgba(212,175,55,0.3)',
          }}
        />
      </motion.div>
    </section>
  )
}
