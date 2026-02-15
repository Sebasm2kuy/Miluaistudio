
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Heart, 
  CheckCircle,
  Shirt,
  Music,
  PlusCircle,
  Send,
  ImageIcon,
  Copy,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Utensils,
  X
} from 'lucide-react';

const EVENT_DATE = new Date('2026-08-22T21:00:00'); 
const WHATSAPP_NUMBER = "59895239386"; 
const MAPS_EMBED = "https://maps.google.com/maps?q=Salón%20My+Father%2C+Granaderos+3875%2C+Montevideo&t=&z=17&ie=UTF8&iwloc=&output=embed";
const SPOTIFY_EMBED_URL = "https://open.spotify.com/embed/playlist/4RAVjizGdBtJx18kkwttqn?utm_source=generator&theme=0";

const App = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [envelopeClosing, setEnvelopeClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ D: 0, H: 0, M: 0, S: 0 });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [dietaryInfo, setDietaryInfo] = useState('');
  const [copiedAbitab, setCopiedAbitab] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userCaption, setUserCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const galaRef = useRef<HTMLDivElement>(null);
  const recuerdosRef = useRef<HTMLDivElement>(null);
  const musicaRef = useRef<HTMLDivElement>(null);
  const rsvpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = EVENT_DATE.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          D: Math.floor(diff / (1000 * 60 * 60 * 24)),
          H: Math.floor((diff / (1000 * 60 * 60)) % 24),
          M: Math.floor((diff / 1000 / 60) % 60),
          S: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const offset = 80;
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSuggestSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const msg = `¡Hola Milu! Te sugiero esta canción para la fiesta: ${searchQuery}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setSearchQuery('');
  };

  if (!isOpened) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 overflow-hidden text-center bg-[#fdfcfb]">
        <div className={`transition-all duration-1000 ${envelopeClosing ? 'scale-150 opacity-0 blur-3xl' : 'scale-100 opacity-100'}`}>
          <p className="text-[#b8860b] uppercase tracking-[0.5em] text-[10px] md:text-sm mb-6 font-semibold">Te invitamos a los XV de</p>
          <div className="font-cursive text-6xl md:text-[10rem] text-[#800020] mb-12 tracking-wide leading-none drop-shadow-md">Milagros</div>
          <button 
            onClick={() => { setEnvelopeClosing(true); setTimeout(() => setIsOpened(true), 800); }} 
            className="group relative w-24 h-24 md:w-36 md:h-36 flex items-center justify-center mx-auto"
          >
            <div className="absolute inset-0 bg-[#b8860b] rounded-full animate-pulse blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-[#b8860b] to-[#8a6b0d] rounded-full flex items-center justify-center border-2 border-white shadow-xl transition-transform group-hover:scale-110">
              <span className="font-serif font-bold text-white text-4xl md:text-7xl">M</span>
            </div>
          </button>
          <p className="mt-14 text-[#b8860b]/60 text-[9px] md:text-xs uppercase tracking-[0.8em] animate-pulse">Toque para entrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800 pb-32">
      
      {/* NAVEGACIÓN */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] glass rounded-full px-6 py-4 flex gap-8 items-center shadow-lg animate-fade-in bg-white/70 backdrop-blur-md border border-[#b8860b]/20">
        <button onClick={() => scrollTo(galaRef)} className="text-gray-400 hover:text-[#800020] transition-colors"><Calendar size={20}/></button>
        <button onClick={() => scrollTo(recuerdosRef)} className="text-gray-400 hover:text-[#800020] transition-colors"><ImageIcon size={20}/></button>
        <button onClick={() => scrollTo(musicaRef)} className="text-gray-400 hover:text-[#800020] transition-colors"><Music size={20}/></button>
        <button onClick={() => scrollTo(rsvpRef)} className="text-gray-400 hover:text-[#800020] transition-colors"><CheckCircle size={20}/></button>
      </nav>

      {/* HERO */}
      <header className="h-screen flex flex-col items-center justify-center relative px-4 text-center">
        <div className="z-20 animate-reveal">
          <p className="text-[#b8860b] uppercase tracking-[0.8em] text-sm md:text-2xl mb-4 font-bold">Mis XV Años</p>
          <h1 className="font-cursive text-7xl md:text-[13rem] text-[#800020] leading-tight">Milagros</h1>
          <div className="h-0.5 w-24 md:w-48 bg-gradient-to-r from-transparent via-[#b8860b] to-transparent mx-auto my-6 md:my-10"></div>
          <p className="text-gray-500 font-serif italic text-lg md:text-4xl tracking-widest uppercase font-medium">22 . Agosto . 2026</p>
          <div className="mt-16 animate-bounce opacity-40">
            <ChevronDown size={32} className="text-[#800020]" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-32 md:space-y-64">
        
        {/* LA GALA */}
        <section ref={galaRef} className="scroll-mt-20">
          <div className="glass p-6 sm:p-12 md:p-20 rounded-[3rem] md:rounded-[5rem] relative overflow-hidden bg-white/60">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl italic mb-8 text-[#800020]">Faltan tan solo...</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                {Object.entries(timeLeft).map(([label, val]) => (
                  <div key={label} className="bg-white/50 rounded-2xl p-4 sm:p-8 md:p-10 border border-[#b8860b]/10 shadow-sm flex flex-col items-center justify-center">
                    <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-[#800020] leading-none block tabular-nums">
                      {val}
                    </span>
                    <span className="text-[9px] sm:text-[10px] md:text-sm uppercase text-[#b8860b] tracking-[0.2em] font-bold mt-3 block">
                      {label === 'D' ? 'Días' : label === 'H' ? 'Horas' : label === 'M' ? 'Min' : 'Seg'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-[#fdfcfb] border border-[#b8860b]/20 rounded-full flex items-center justify-center text-[#800020] shrink-0 group-hover:bg-[#800020] group-hover:text-white transition-all duration-500 shadow-sm">
                  <Clock size={28} className="md:w-12 md:h-12" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl md:text-4xl italic mb-2 text-[#800020]">El Evento</h3>
                  <p className="text-gray-600 text-sm sm:text-base md:text-xl leading-relaxed">
                    Sábado 22 de Agosto a las 21:00 hs. <br/> Tu presencia es mi mejor regalo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-[#fdfcfb] border border-[#b8860b]/20 rounded-full flex items-center justify-center text-[#800020] shrink-0 group-hover:bg-[#800020] group-hover:text-white transition-all duration-500 shadow-sm">
                  <Shirt size={28} className="md:w-12 md:h-12" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl md:text-4xl italic mb-2 text-[#800020]">Dress Code</h3>
                  <p className="text-gray-600 text-sm sm:text-base md:text-xl leading-relaxed uppercase font-semibold tracking-wide">
                    Elegante / Gala
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 md:mt-32">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <MapPin size={24} className="text-[#800020]" />
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif italic text-gray-800">Salón My Father</span>
                </div>
                <button 
                  onClick={() => window.open(`https://maps.app.goo.gl/uXq5HCuF54u8DqJj8`, '_blank')}
                  className="bg-[#fdfcfb] hover:bg-[#b8860b] hover:text-white px-5 py-2.5 rounded-full text-[10px] sm:text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 transition-all border border-[#b8860b]/20 text-[#b8860b] font-bold shadow-sm"
                >
                  Ver Mapa <ExternalLink size={14} />
                </button>
              </div>
              <div className="h-60 sm:h-80 md:h-[500px] rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-[#b8860b]/20 shadow-md">
                <iframe src={MAPS_EMBED} className="w-full h-full border-0" allowFullScreen loading="lazy"></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* RECUERDOS - VERSIÓN MANUAL */}
        <section ref={recuerdosRef} className="scroll-mt-20">
          <div className="text-center mb-16 px-4">
            <h2 className="font-serif text-4xl md:text-7xl italic mb-4 text-[#800020]">Momentos Compartidos</h2>
            <p className="text-[#b8860b] uppercase text-[10px] sm:text-xs md:text-sm tracking-[0.3em] font-bold">Sube una foto y deja un mensaje para Milu</p>
          </div>

          <div className="glass p-6 md:p-20 rounded-[3rem] md:rounded-[5rem] text-center bg-white/40">
            {!selectedImage ? (
              <div 
                className="py-20 md:py-40 border-2 border-dashed border-[#b8860b]/30 rounded-[2rem] md:rounded-[4rem] hover:border-[#800020] transition-all cursor-pointer flex flex-col items-center group" 
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 md:w-32 md:h-32 bg-[#fdfcfb] rounded-full flex items-center justify-center mb-8 border border-[#b8860b]/10 group-hover:scale-110 transition-transform shadow-sm">
                   <ImageIcon size={40} className="text-[#b8860b] md:w-16 md:h-16" />
                </div>
                <p className="text-gray-500 text-sm md:text-xl mb-10 font-medium px-4">Toca para elegir una foto con ella</p>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button className="bg-[#800020] text-white px-10 py-4 rounded-full text-xs md:text-sm uppercase tracking-widest font-bold hover:bg-[#b8860b] transition-colors shadow-lg">
                  Seleccionar Imagen
                </button>
              </div>
            ) : (
              <div className="space-y-8 md:space-y-12 animate-fade-in max-w-xl mx-auto">
                <div className="bg-white p-4 pb-12 shadow-2xl rounded-sm transform -rotate-1 border border-gray-100">
                  <img src={selectedImage} className="w-full aspect-[4/5] object-cover mb-6" alt="Recuerdo" />
                  <textarea 
                    value={userCaption}
                    onChange={(e) => setUserCaption(e.target.value)}
                    placeholder="Escribe algo lindo aquí..."
                    className="w-full font-cursive text-2xl md:text-4xl text-[#800020] text-center bg-transparent border-none focus:ring-0 resize-none h-24 placeholder:opacity-30"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => {setSelectedImage(null); setUserCaption('');}} 
                    className="flex-1 bg-white border border-[#b8860b]/20 py-4 rounded-2xl text-xs uppercase tracking-widest font-bold text-[#b8860b]">
                    Cambiar Foto
                  </button>
                  <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`¡Milu! Mira este recuerdo que subí a tu web: "${userCaption || '¡Feliz cumple!'}"`)}`, '_blank')} 
                    className="flex-[2] bg-[#800020] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-[#b8860b] transition-all">
                    <Send size={18} /> Enviar a Milu
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PLAYLIST - VERSIÓN MANUAL */}
        <section ref={musicaRef} className="scroll-mt-20">
          <div className="glass p-6 sm:p-10 md:p-20 rounded-[3rem] md:rounded-[5rem] bg-white/50">
            <div className="text-center mb-16 px-4">
              <h2 className="font-serif text-4xl md:text-7xl italic mb-4 text-[#800020]">Ritmo & Fiesta</h2>
              <p className="text-[#b8860b] font-bold uppercase text-xs md:text-sm tracking-[0.4em]">¿Qué canciones no pueden faltar?</p>
            </div>

            <form onSubmit={handleSuggestSong} className="relative mb-16">
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Escribe el nombre de tu canción..." 
                className="w-full bg-white border border-[#b8860b]/20 rounded-full px-6 sm:px-8 py-5 sm:py-6 md:py-8 focus:outline-none focus:border-[#800020] text-gray-800 text-sm sm:text-base md:text-2xl shadow-sm" 
              />
              <button type="submit" className="absolute right-2 top-2 sm:right-3 sm:top-3 md:top-4 w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-[#800020] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#b8860b] transition-all">
                 <Send size={24} className="md:w-7 md:h-7" />
              </button>
              <p className="mt-4 text-center text-[10px] text-gray-400 uppercase tracking-widest">Al enviarla, Milu la recibirá por WhatsApp</p>
            </form>

            <div className="rounded-[2.5rem] overflow-hidden shadow-lg border border-[#b8860b]/10">
                <iframe src={SPOTIFY_EMBED_URL} width="100%" height="380" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
            </div>
          </div>
        </section>

        {/* RSVP Y REGALO */}
        <section ref={rsvpRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-16 pb-32">
          {/* CONFIRMACIÓN */}
          <div className="glass p-8 sm:p-10 md:p-20 rounded-[3rem] md:rounded-[5rem] flex flex-col justify-between min-h-[480px] bg-white/60">
            <div className="text-center">
              <h2 className="font-serif text-4xl md:text-7xl italic mb-10 text-[#800020]">RSVP</h2>
              {!isConfirmed ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#b8860b] font-bold block ml-4 text-left">Tu Nombre</label>
                    <input 
                      type="text" 
                      value={guestName} 
                      onChange={(e) => setGuestName(e.target.value)} 
                      placeholder="Nombre y Apellido" 
                      className="w-full bg-white border border-[#b8860b]/20 rounded-2xl px-5 py-4 text-base outline-none focus:border-[#800020] shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#b8860b] font-bold block ml-4 text-left flex items-center gap-2">
                      <Utensils size={12}/> Menú Especial (Opcional)
                    </label>
                    <input 
                      type="text" 
                      value={dietaryInfo} 
                      onChange={(e) => setDietaryInfo(e.target.value)} 
                      placeholder="Vegetariano, Celíaco, etc." 
                      className="w-full bg-white border border-[#b8860b]/20 rounded-2xl px-5 py-4 text-sm outline-none focus:border-[#800020] shadow-sm" 
                    />
                  </div>
                  <button 
                    onClick={() => { 
                      if(guestName.length < 3) return; 
                      const msg = `¡Hola Milu! Confirmo mi lugar. Soy ${guestName}. ${dietaryInfo ? `Nota de menú: ${dietaryInfo}` : ''}`;
                      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank'); 
                      setIsConfirmed(true); 
                    }} 
                    className="w-full bg-[#800020] text-white font-bold py-5 rounded-2xl text-xs md:text-lg uppercase tracking-[0.2em] hover:bg-[#b8860b] transition-all shadow-lg active:scale-95"
                  >
                    Confirmar Asistencia
                  </button>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center animate-fade-in text-[#800020]">
                  <CheckCircle size={50} className="mb-6" />
                  <p className="text-xl md:text-3xl font-serif italic">¡Lugar Reservado!</p>
                </div>
              )}
            </div>
            <p className="text-[#b8860b]/60 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest pt-10 border-t border-[#b8860b]/10 text-center font-bold">Agradecemos confirmar antes del 10.08</p>
          </div>

          {/* REGALO */}
          <div className="glass p-8 sm:p-10 md:p-20 rounded-[3rem] md:rounded-[5rem] text-center flex flex-col justify-center relative overflow-hidden bg-white/60 min-h-[480px]">
            <h2 className="font-serif text-4xl md:text-7xl italic mb-10 text-[#800020]">Presente</h2>
            <p className="text-gray-500 text-sm sm:text-base md:text-2xl mb-12 italic leading-relaxed px-4 font-light max-w-sm mx-auto">
              "Mi mayor regalo es compartir mi noche contigo, pero si deseas colaborar con mis sueños de futuro..."
            </p>
            <div className="bg-[#fdfcfb] p-6 sm:p-10 rounded-[2.5rem] border border-[#b8860b]/20 relative z-10 shadow-sm w-full">
              <p className="text-[10px] text-[#b8860b] uppercase tracking-[0.6em] mb-4 font-bold">Colectivo Abitad</p>
              <p className="text-3xl sm:text-4xl md:text-6xl font-light mb-8 tracking-widest text-[#800020]">145920</p>
              <button 
                onClick={() => { navigator.clipboard.writeText("145920"); setCopiedAbitab(true); setTimeout(() => setCopiedAbitab(false), 2000); }} 
                className="flex items-center justify-center gap-3 mx-auto text-[#b8860b] font-bold text-[10px] sm:text-xs md:text-lg hover:text-[#800020] transition-all uppercase tracking-widest"
              >
                {copiedAbitab ? (
                  <span className="text-[#800020] flex items-center gap-2 font-bold">¡Copiado! <CheckCircle size={18}/></span>
                ) : (
                  <><Copy size={20} /> Copiar Número</>
                )}
              </button>
            </div>
          </div>
        </section>

      </main>

      <footer className="text-center py-24 md:py-64 border-t border-[#b8860b]/10 relative">
        <h2 className="font-cursive text-7xl sm:text-8xl md:text-[14rem] text-[#800020] opacity-5 mb-8 leading-none select-none">Milagros</h2>
        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8 sm:mb-10">
           <div className="h-px w-14 sm:w-20 md:w-64 bg-[#b8860b]/20"></div>
           <Sparkles className="text-[#b8860b]/40 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12" />
           <div className="h-px w-14 sm:w-20 md:w-64 bg-[#b8860b]/20"></div>
        </div>
        <p className="text-[#b8860b] text-[9px] sm:text-[10px] md:text-sm uppercase tracking-[1.5em] sm:tracking-[2em] md:tracking-[4em] font-semibold">Montevideo • Uruguay</p>
      </footer>
    </div>
  );
};

export default App;
