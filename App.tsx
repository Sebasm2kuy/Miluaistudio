
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Heart, 
  CheckCircle,
  Shirt,
  CalendarPlus,
  Music,
  PlusCircle,
  Send,
  Search,
  Loader2,
  ImageIcon,
  Copy,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Utensils
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [iaCaption, setIaCaption] = useState('');
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
      const base64Data = reader.result as string;
      setSelectedImage(base64Data);
      analyzePhoto(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async (base64: string) => {
    setIsAnalyzing(true);
    setIaCaption('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64.split(',')[1] } },
            { text: "Eres un poeta experto. Escribe una dedicatoria de máximo 8 palabras para Milagros Cabrera que celebra sus 15 años. Debe ser dulce, elegante y emotiva." }
          ]
        }
      });
      setIaCaption(response.text?.replace(/"/g, '') || "Un instante que brillará para siempre.");
    } catch (err) {
      setIaCaption("Capturando la magia de este gran día.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearchSongs = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Encuentra 3 canciones populares para bailar en una fiesta para la búsqueda: "${searchQuery}". Devuelve solo JSON: [{"title": "...", "artist": "..."}]`,
        config: { responseMimeType: "application/json" }
      });
      setSearchResults(JSON.parse(response.text || "[]"));
    } catch (err) {
      setSearchResults([{ title: searchQuery, artist: "Tu selección" }]);
    } finally { setIsSearching(false); }
  };

  if (!isOpened) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 overflow-hidden text-center bg-pearl">
        <div className={`transition-all duration-1000 ${envelopeClosing ? 'scale-150 opacity-0 blur-3xl' : 'scale-100 opacity-100'}`}>
          <p className="text-gold uppercase tracking-[0.5em] text-[10px] md:text-sm mb-6 font-semibold">Te invitamos a los XV de</p>
          <div className="font-cursive text-6xl md:text-[10rem] text-bordeaux mb-12 tracking-wide leading-none drop-shadow-md">Milagros</div>
          <button 
            onClick={() => { setEnvelopeClosing(true); setTimeout(() => setIsOpened(true), 800); }} 
            className="group relative w-24 h-24 md:w-36 md:h-36 flex items-center justify-center mx-auto"
          >
            <div className="absolute inset-0 bg-gold rounded-full animate-pulse blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-gold to-[#8a6b0d] rounded-full flex items-center justify-center border-2 border-white shadow-xl transition-transform group-hover:scale-110">
              <span className="font-serif font-bold text-white text-4xl md:text-7xl">M</span>
            </div>
          </button>
          <p className="mt-14 text-gold/60 text-[9px] md:text-xs uppercase tracking-[0.8em] animate-pulse">Toque para entrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800 pb-32">
      
      {/* NAVEGACIÓN */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] glass rounded-full px-6 py-4 flex gap-8 items-center shadow-lg animate-fade-in">
        <button onClick={() => scrollTo(galaRef)} className="text-gray-400 hover:text-bordeaux transition-colors"><Calendar size={20}/></button>
        <button onClick={() => scrollTo(recuerdosRef)} className="text-gray-400 hover:text-bordeaux transition-colors"><ImageIcon size={20}/></button>
        <button onClick={() => scrollTo(musicaRef)} className="text-gray-400 hover:text-bordeaux transition-colors"><Music size={20}/></button>
        <button onClick={() => scrollTo(rsvpRef)} className="text-gray-400 hover:text-bordeaux transition-colors"><CheckCircle size={20}/></button>
      </nav>

      {/* HERO */}
      <header className="h-screen flex flex-col items-center justify-center relative px-4 text-center">
        <div className="z-20 animate-reveal">
          <p className="text-gold uppercase tracking-[0.8em] text-sm md:text-2xl mb-4 font-bold">Mis XV Años</p>
          <h1 className="font-cursive text-7xl md:text-[13rem] text-bordeaux leading-tight">Milagros</h1>
          <div className="h-0.5 w-24 md:w-48 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-6 md:my-10"></div>
          <p className="text-gray-500 font-serif italic text-lg md:text-4xl tracking-widest uppercase font-medium">22 . Agosto . 2026</p>
          <div className="mt-16 animate-bounce opacity-40">
            <ChevronDown size={32} className="text-bordeaux" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 space-y-32 md:space-y-64">
        
        {/* LA GALA */}
        <section ref={galaRef} className="scroll-mt-20">
          <div className="glass p-6 sm:p-12 md:p-20 rounded-[3rem] md:rounded-[5rem] relative overflow-hidden bg-white/60">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="font-serif text-3xl sm:text-5xl md:text-7xl italic mb-8 text-bordeaux">Faltan tan solo...</h2>
              
              {/* CONTADOR AJUSTADO */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                {Object.entries(timeLeft).map(([label, val]) => (
                  <div key={label} className="bg-white/50 rounded-2xl p-4 sm:p-8 md:p-10 border border-gold/10 shadow-sm flex flex-col items-center justify-center overflow-hidden">
                    <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-bordeaux leading-none block tabular-nums">
                      {val}
                    </span>
                    <span className="text-[9px] sm:text-[10px] md:text-sm uppercase text-gold tracking-[0.2em] font-bold mt-3 block whitespace-nowrap">
                      {label === 'D' ? 'Días' : label === 'H' ? 'Horas' : label === 'M' ? 'Min' : 'Seg'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-pearl border border-gold/20 rounded-full flex items-center justify-center text-bordeaux shrink-0 group-hover:bg-bordeaux group-hover:text-white transition-all duration-500 shadow-sm">
                  <Clock size={28} className="md:w-12 md:h-12" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl md:text-4xl italic mb-2 text-bordeaux">El Evento</h3>
                  <p className="text-gray-600 text-sm sm:text-base md:text-xl leading-relaxed">
                    Sábado 22 de Agosto a las 21:00 hs. <br/> Tu presencia es mi mejor regalo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-pearl border border-gold/20 rounded-full flex items-center justify-center text-bordeaux shrink-0 group-hover:bg-bordeaux group-hover:text-white transition-all duration-500 shadow-sm">
                  <Shirt size={28} className="md:w-12 md:h-12" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl md:text-4xl italic mb-2 text-bordeaux">Dress Code</h3>
                  <p className="text-gray-600 text-sm sm:text-base md:text-xl leading-relaxed uppercase font-semibold tracking-wide">
                    Elegante / Gala
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 md:mt-32">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <MapPin size={24} className="text-bordeaux" />
                  <span className="text-xl sm:text-2xl md:text-3xl font-serif italic text-gray-800">Salón My Father</span>
                </div>
                <button 
                  onClick={() => window.open(`https://maps.app.goo.gl/uXq5HCuF54u8DqJj8`, '_blank')}
                  className="bg-pearl hover:bg-gold hover:text-white px-5 py-2.5 rounded-full text-[10px] sm:text-xs md:text-sm uppercase tracking-widest flex items-center gap-2 transition-all border border-gold/20 text-gold font-bold shadow-sm"
                >
                  Ver Mapa <ExternalLink size={14} />
                </button>
              </div>
              <div className="h-60 sm:h-80 md:h-[500px] rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-gold/20 shadow-md">
                <iframe src={MAPS_EMBED} className="w-full h-full border-0" allowFullScreen loading="lazy"></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* RECUERDOS */}
        <section ref={recuerdosRef} className="scroll-mt-20">
          <div className="text-center mb-16 px-4">
            <h2 className="font-serif text-4xl md:text-7xl italic mb-4 text-bordeaux">Momentos Compartidos</h2>
            <p className="text-gold uppercase text-[10px] sm:text-xs md:text-sm tracking-[0.3em] font-bold">Sube una foto y deja que Milu vea tu mensaje especial</p>
          </div>

          <div className="glass p-6 md:p-20 rounded-[3rem] md:rounded-[5rem] text-center bg-white/40">
            {!selectedImage ? (
              <div 
                className="py-20 md:py-40 border-2 border-dashed border-gold/30 rounded-[2rem] md:rounded-[4rem] hover:border-bordeaux transition-all cursor-pointer flex flex-col items-center group" 
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 md:w-32 md:h-32 bg-pearl rounded-full flex items-center justify-center mb-8 border border-gold/10 group-hover:scale-110 transition-transform shadow-sm">
                   <ImageIcon size={40} className="text-gold md:w-16 md:h-16" />
                </div>
                <p className="text-gray-500 text-sm md:text-xl mb-10 font-medium px-4">Toca para elegir una foto con ella</p>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button className="bg-bordeaux text-white px-10 py-4 rounded-full text-xs md:text-sm uppercase tracking-widest font-bold hover:bg-gold transition-colors shadow-lg">
                  Seleccionar Imagen
                </button>
              </div>
            ) : (
              <div className="space-y-10 md:space-y-16 animate-fade-in max-w-2xl mx-auto">
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-gold/20 bg-white shadow-xl">
                  <img src={selectedImage} className="w-full h-full object-cover" alt="Recuerdo" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-md">
                      <Loader2 className="text-bordeaux mb-6 animate-spin w-12 h-12" />
                      <p className="text-xs md:text-sm uppercase tracking-widest text-bordeaux font-bold animate-pulse">Creando un recuerdo...</p>
                    </div>
                  )}
                </div>
                
                {iaCaption && (
                  <div className="p-8 md:p-12 bg-pearl rounded-[2rem] border border-gold/10 relative shadow-inner">
                    <div className="font-cursive text-2xl sm:text-3xl md:text-5xl text-bordeaux leading-relaxed">
                      "{iaCaption}"
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  <button onClick={() => {setSelectedImage(null); setIaCaption('');}} 
                    className="flex-1 bg-white border border-gold/20 py-5 rounded-2xl text-[10px] md:text-xs uppercase tracking-widest font-bold text-gold">
                    Cambiar Foto
                  </button>
                  <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`¡Milu! Mira este recuerdo que subí a tu web: "${iaCaption}"`)}`, '_blank')} 
                    className="flex-[2] bg-bordeaux text-white py-5 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-gold transition-all">
                    <Send size={18} /> Enviar a Milu
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PLAYLIST */}
        <section ref={musicaRef} className="scroll-mt-20">
          <div className="glass p-6 sm:p-10 md:p-20 rounded-[3rem] md:rounded-[5rem] bg-white/50">
            <div className="text-center mb-16 px-4">
              <h2 className="font-serif text-4xl md:text-7xl italic mb-4 text-bordeaux">Ritmo & Fiesta</h2>
              <p className="text-gold font-bold uppercase text-xs md:text-sm tracking-[0.4em]">¿Qué canciones no pueden faltar?</p>
            </div>

            <form onSubmit={handleSearchSongs} className="relative mb-12">
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Busca tu tema favorito..." 
                className="w-full bg-white border border-gold/20 rounded-full px-6 sm:px-8 py-5 sm:py-6 md:py-8 focus:outline-none focus:border-bordeaux text-gray-800 text-sm sm:text-base md:text-2xl shadow-sm" 
              />
              <button type="submit" className="absolute right-2 top-2 sm:right-3 sm:top-3 md:top-4 w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-bordeaux rounded-full flex items-center justify-center text-white shadow-md hover:bg-gold transition-all">
                {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={24} className="md:w-7 md:h-7" />}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-16">
              {searchResults.map((song, i) => (
                <div key={i} className="flex items-center justify-between p-5 sm:p-6 md:p-10 bg-white rounded-[2rem] border border-gold/10 hover:border-bordeaux transition-all shadow-sm">
                  <div className="text-left overflow-hidden pr-2">
                    <p className="text-gray-800 text-sm sm:text-lg md:text-2xl font-bold truncate">{song.title}</p>
                    <p className="text-gold text-[9px] sm:text-[10px] md:text-sm uppercase tracking-widest font-bold mt-1 md:mt-2">{song.artist}</p>
                  </div>
                  <button onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Sugiero+esta+canción+para+la+fiesta:+${song.title}+de+${song.artist}`, '_blank')} 
                    className="text-bordeaux hover:scale-110 transition-transform shrink-0"><PlusCircle size={28} className="md:w-8 md:h-8" /></button>
                </div>
              ))}
            </div>

            <div className="rounded-[2.5rem] overflow-hidden shadow-lg border border-gold/10">
                <iframe src={SPOTIFY_EMBED_URL} width="100%" height="380" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
            </div>
          </div>
        </section>

        {/* RSVP Y REGALO */}
        <section ref={rsvpRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-16 pb-32">
          {/* CONFIRMACIÓN */}
          <div className="glass p-8 sm:p-10 md:p-20 rounded-[3rem] md:rounded-[5rem] flex flex-col justify-between min-h-[480px] bg-white/60">
            <div className="text-center">
              <h2 className="font-serif text-4xl md:text-7xl italic mb-10 text-bordeaux">RSVP</h2>
              {!isConfirmed ? (
                <div className="space-y-6 sm:space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold block ml-4 text-left">Tu Nombre</label>
                    <input 
                      type="text" 
                      value={guestName} 
                      onChange={(e) => setGuestName(e.target.value)} 
                      placeholder="Nombre y Apellido" 
                      className="w-full bg-white border border-gold/20 rounded-2xl px-5 sm:px-6 py-4 sm:py-5 text-base sm:text-lg outline-none focus:border-bordeaux shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gold font-bold block ml-4 text-left flex items-center gap-2">
                      <Utensils size={12}/> Menú Especial (Opcional)
                    </label>
                    <input 
                      type="text" 
                      value={dietaryInfo} 
                      onChange={(e) => setDietaryInfo(e.target.value)} 
                      placeholder="Vegetariano, Celíaco, etc." 
                      className="w-full bg-white border border-gold/20 rounded-2xl px-5 sm:px-6 py-4 sm:py-5 text-sm outline-none focus:border-bordeaux shadow-sm" 
                    />
                  </div>
                  <button 
                    onClick={() => { 
                      if(guestName.length < 3) return; 
                      const msg = `¡Hola Milu! Confirmo mi lugar. Soy ${guestName}. ${dietaryInfo ? `Nota de menú: ${dietaryInfo}` : ''}`;
                      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank'); 
                      setIsConfirmed(true); 
                    }} 
                    className="w-full bg-bordeaux text-white font-bold py-5 sm:py-6 rounded-2xl text-[10px] sm:text-xs md:text-lg uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-lg active:scale-95"
                  >
                    Confirmar Asistencia
                  </button>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center animate-fade-in">
                  <CheckCircle size={50} className="text-bordeaux mb-6" />
                  <p className="text-xl md:text-3xl font-serif italic text-bordeaux">¡Lugar Reservado!</p>
                </div>
              )}
            </div>
            <p className="text-gold/60 text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest pt-10 border-t border-gold/10 text-center font-bold">Agradecemos confirmar antes del 10.08</p>
          </div>

          {/* REGALO */}
          <div className="glass p-8 sm:p-10 md:p-20 rounded-[3rem] md:rounded-[5rem] text-center flex flex-col justify-center relative overflow-hidden bg-white/60 min-h-[480px]">
            <h2 className="font-serif text-4xl md:text-7xl italic mb-10 text-bordeaux">Presente</h2>
            <p className="text-gray-500 text-sm sm:text-base md:text-2xl mb-12 sm:mb-16 italic leading-relaxed px-4 font-light max-w-sm mx-auto">
              "Mi mayor regalo es compartir mi noche contigo, pero si deseas colaborar con mis sueños de futuro..."
            </p>
            <div className="bg-pearl p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-gold/20 relative z-10 shadow-sm w-full">
              <p className="text-[10px] sm:text-[11px] md:text-sm text-gold uppercase tracking-[0.6em] mb-4 sm:mb-6 font-bold">Colectivo Abitad</p>
              <p className="text-3xl sm:text-4xl md:text-6xl font-light mb-8 sm:mb-10 tracking-widest text-bordeaux">145920</p>
              <button 
                onClick={() => { navigator.clipboard.writeText("145920"); setCopiedAbitab(true); setTimeout(() => setCopiedAbitab(false), 2000); }} 
                className="flex items-center justify-center gap-3 sm:gap-4 mx-auto text-gold font-bold text-[10px] sm:text-xs md:text-lg hover:text-bordeaux transition-all uppercase tracking-widest"
              >
                {copiedAbitab ? (
                  <span className="text-bordeaux flex items-center gap-2 sm:gap-3 font-bold">¡Copiado! <CheckCircle size={18}/></span>
                ) : (
                  <><Copy size={20} className="md:w-6 md:h-6" /> Copiar Número</>
                )}
              </button>
            </div>
          </div>
        </section>

      </main>

      <footer className="text-center py-24 sm:py-32 md:py-64 border-t border-gold/10 relative">
        <h2 className="font-cursive text-7xl sm:text-8xl md:text-[14rem] text-bordeaux opacity-5 mb-8 sm:mb-10 leading-none select-none">Milagros</h2>
        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8 sm:mb-10">
           <div className="h-px w-14 sm:w-20 md:w-64 bg-gold/20"></div>
           <Sparkles className="text-gold/40 w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12" />
           <div className="h-px w-14 sm:w-20 md:w-64 bg-gold/20"></div>
        </div>
        <p className="text-gold text-[9px] sm:text-[10px] md:text-sm uppercase tracking-[1.5em] sm:tracking-[2em] md:tracking-[4em] font-semibold">Montevideo • Uruguay</p>
      </footer>
    </div>
  );
};

export default App;
