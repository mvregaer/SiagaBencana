import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import { Layers, ListFilter, Navigation, MapPin, AlertCircle, X, Check, Share2, Info, Droplet, Mountain, Wind, Flame, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Fix leaflet default icons issue with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `<div style="width:16px;height:16px;background-color:#3b82f6;border-radius:50%;border:2px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.3);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Category Icons Configuration
const CATEGORY_CONFIG = {
  earthquake: { label: 'Gempa Bumi', icon: Activity, color: '#f97316', bg: 'bg-orange-500' },
  tsunami: { label: 'Tsunami', icon: Droplet, color: '#1e3a8a', bg: 'bg-blue-900' },
  flood: { label: 'Banjir', icon: Droplet, color: '#3b82f6', bg: 'bg-blue-500' },
  landslide: { label: 'Tanah Longsor', icon: Mountain, color: '#8b5cf6', bg: 'bg-purple-500' },
  volcano: { label: 'Erupsi Gunung Api', icon: Flame, color: '#ef4444', bg: 'bg-red-500' },
  extreme_weather: { label: 'Cuaca Ekstrem', icon: Wind, color: '#eab308', bg: 'bg-yellow-500' },
};

function createDisasterIcon(color: string) {
  return L.divIcon({
    className: 'custom-disaster-icon',
    html: `<div style="width:20px;height:20px;background-color:${color};border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const disasterIcons = {
  earthquake: createDisasterIcon(CATEGORY_CONFIG.earthquake.color),
  tsunami: createDisasterIcon(CATEGORY_CONFIG.tsunami.color),
  flood: createDisasterIcon(CATEGORY_CONFIG.flood.color),
  landslide: createDisasterIcon(CATEGORY_CONFIG.landslide.color),
  volcano: createDisasterIcon(CATEGORY_CONFIG.volcano.color),
  extreme_weather: createDisasterIcon(CATEGORY_CONFIG.extreme_weather.color),
};

interface BencanaData {
  id: string;
  type: keyof typeof CATEGORY_CONFIG;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  severity: 'info' | 'waspada' | 'siaga' | 'awas';
  source: string;
  eventTime: string;
  updatedAt: string;
  instruction: string;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function MapUpdater({ center, zoom }: { center: [number, number] | null, zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [disasters, setDisasters] = useState<BencanaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{type: 'success'|'error', msg: string}|null>(null);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, boolean>>({
    semua: true,
    earthquake: true,
    tsunami: true,
    flood: true,
    landslide: true,
    volcano: true,
    extreme_weather: true,
  });

  // Default to Indonesia center
  const defaultCenter: [number, number] = [-2.5489, 118.0149];
  const center = userLocation || defaultCenter;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('/api/bencana/semua');
        if (res.data?.data) {
          setDisasters(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setError("Data gagal dimuat. Periksa koneksi atau coba lagi.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLocateMe = () => {
    setIsLocating(true);
    setLocationStatus(null);
    if (!('geolocation' in navigator)) {
      setLocationStatus({ type: 'error', msg: 'Geolocation tidak didukung. Anda tetap dapat melihat data bencana nasional.' });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationStatus({ type: 'success', msg: 'Lokasi Anda ditemukan.' });
        setIsLocating(false);
      },
      (err) => {
        setLocationStatus({ type: 'error', msg: 'Gagal mendeteksi lokasi. Anda tetap dapat melihat data bencana nasional.' });
        setIsLocating(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleFilterToggle = (key: string) => {
    let newFilters = { ...filters };
    if (key === 'semua') {
      const newVal = !filters.semua;
      for (const k in newFilters) newFilters[k] = newVal;
    } else {
      newFilters[key] = !newFilters[key];
      // Check if all are true
      const allTrue = ['earthquake', 'tsunami', 'flood', 'landslide', 'volcano', 'extreme_weather'].every(k => newFilters[k]);
      newFilters.semua = allTrue;
    }
    setFilters(newFilters);
  };

  const filteredDisasters = disasters.filter(d => filters[d.type] || filters.semua);

  // Find nearby disasters
  let nearbyDisasters: BencanaData[] = [];
  if (userLocation && filteredDisasters.length > 0) {
    nearbyDisasters = filteredDisasters.filter(d => {
      const dist = getDistance(userLocation[0], userLocation[1], d.latitude, d.longitude);
      return dist <= 300; // within 300km
    });
  }

  return (
    <div className="h-[calc(100vh-140px)] w-full flex flex-col gap-4 relative">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 transition-colors duration-200">Peta Bencana Nasional</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <button 
             onClick={handleLocateMe}
             disabled={isLocating}
             className={cn(
               "flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm transition-all duration-300 backdrop-blur-xl border flex-1 md:flex-auto",
               userLocation ? "bg-bencana-info text-white border-bencana-info/50" : "bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 border-white/60 dark:border-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80"
             )}
          >
             <Navigation className={cn("size-4", isLocating && "animate-pulse")} />
             {isLocating ? 'Mencari...' : 'Lokasi Saat Ini'}
          </button>
          
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/60 dark:border-slate-700/60 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-300 hover:bg-white/80 hover:shadow-md dark:hover:bg-slate-700/80 active:scale-95 flex-1 md:flex-auto justify-center"
          >
            <ListFilter className="size-4" /> Filter
          </button>
        </div>
      </div>
      
      {locationStatus?.type === 'error' && (
        <div className="bg-red-50/80 backdrop-blur-xl text-red-600 dark:text-red-400 px-4 py-2 rounded-xl border border-red-200/60 dark:border-red-900/50 text-sm flex items-center gap-2 pointer-events-auto transition-colors duration-200">
          <AlertCircle className="size-4 shrink-0" />
          {locationStatus.msg}
        </div>
      )}

      {error && (
        <div className="bg-red-50/80 backdrop-blur-xl text-red-600 dark:text-red-400 px-4 py-3 rounded-xl border border-red-200/60 dark:border-red-900/50 text-sm flex items-center gap-2">
          <AlertCircle className="size-5 shrink-0" />
          {error}
        </div>
      )}

      {userLocation && (
         <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-white/60 dark:border-slate-800/60 transition-colors duration-200">
           <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3">
             <MapPin className="size-4 text-bencana-info" /> Ringkasan Sekitar Anda (Radius 300km)
           </h3>
           {nearbyDisasters.length > 0 ? (
              <div className="space-y-2 max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                {nearbyDisasters.map((nd, i) => (
                   <div key={i} className={`text-sm border-l-2 pl-3 py-1 flex items-start justify-between`} style={{ borderColor: CATEGORY_CONFIG[nd.type].color }}>
                     <div>
                       <p className="font-semibold text-slate-800 dark:text-slate-200">{nd.title}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400">{nd.location} • {nd.eventTime}</p>
                     </div>
                     <span className="font-bold text-xs uppercase" style={{ color: CATEGORY_CONFIG[nd.type].color }}>{nd.severity}</span>
                   </div>
                ))}
              </div>
           ) : (
             <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada peringatan bencana aktif di sekitar lokasi Anda.</p>
           )}
         </div>
      )}

      <div className="flex-1 rounded-[24px] overflow-hidden border border-white/60 dark:border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative isolate bg-slate-100 dark:bg-slate-800 transition-colors duration-200">
        {!loading && !error && (
          <MapContainer center={center} zoom={userLocation ? 7 : 5} scrollWheelZoom={true} className="h-full w-full z-0">
             <MapUpdater center={userLocation} zoom={userLocation ? 7 : undefined} />
             
             <LayersControl position="topright">
               <LayersControl.BaseLayer checked name="Peta Jalan (Standar)">
                 <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 />
               </LayersControl.BaseLayer>
               
               <LayersControl.BaseLayer name="Peta Satelit">
                 <TileLayer
                    attribution='&copy; <a href="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">Esri</a>'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                 />
               </LayersControl.BaseLayer>

               <LayersControl.Overlay checked name="Zona Bahaya & Bencana">
                 <div>
                   {userLocation && (
                      <Marker position={userLocation} icon={userIcon}>
                         <Popup><span className="font-bold">Lokasi Anda</span></Popup>
                      </Marker>
                   )}
                   
                   {filteredDisasters.map((d) => (
                     <Marker key={d.id} position={[d.latitude, d.longitude]} icon={disasterIcons[d.type] || disasterIcons.earthquake}>
                       <Popup className="custom-popup">
                         <div className="font-sans min-w-[220px]">
                           <div className="flex items-center gap-2 mb-2">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${CATEGORY_CONFIG[d.type].bg}`}>
                               {CATEGORY_CONFIG[d.type].label}
                             </span>
                             <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase",
                                d.severity === 'awas' ? 'border-red-500 text-red-600 bg-red-50' :
                                d.severity === 'siaga' ? 'border-orange-500 text-orange-600 bg-orange-50' :
                                d.severity === 'waspada' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
                                'border-blue-500 text-blue-600 bg-blue-50'
                             )}>{d.severity}</span>
                           </div>
                           <p className="font-bold text-slate-800 mb-1 leading-tight">{d.title}</p>
                           <p className="text-xs text-slate-500 mb-2 border-b pb-2">{d.location} • {d.eventTime}</p>
                           
                           <p className="text-sm text-slate-700 mb-2">{d.description}</p>
                           
                           <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 mb-3">
                             <p className="text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1"><Info className="size-3" /> Instruksi Keselamatan:</p>
                             <p className="text-xs text-slate-600">{d.instruction}</p>
                           </div>

                           <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                             <span>Sumber: {d.source}</span>
                             <button className="text-bencana-info flex items-center gap-1 font-medium hover:underline">
                               <Share2 className="size-3" /> Bagikan
                             </button>
                           </div>
                         </div>
                       </Popup>
                     </Marker>
                   ))}
                 </div>
               </LayersControl.Overlay>
             </LayersControl>
          </MapContainer>
        )}
        
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10 text-slate-600">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-bencana-info mb-4"></div>
            <p className="font-medium">Memuat data bencana terbaru...</p>
          </div>
        )}
        
        {/* Floating Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-4 border border-white/60 dark:border-slate-800/60 shadow-xl transition-colors duration-300">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5"><Layers className="size-4" /> Legenda Bencana</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-700 dark:text-slate-300">
             {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
               <div key={key} className="flex items-center gap-2">
                 <span className="size-3 rounded-full shadow-sm" style={{ backgroundColor: config.color }}></span>
                 {config.label}
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Slide-over Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" 
            />
            <motion.div 
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 w-full md:w-80 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border-l border-white/60 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-5 border-b border-white/40 dark:border-slate-800/60 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <ListFilter className="size-5 text-bencana-info" /> Filter Bencana
                </h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <label className="flex items-center justify-between p-4 rounded-[20px] bg-white/50 dark:bg-slate-800/50 border border-white/60 dark:border-slate-700/50 shadow-sm cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors group">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Semua Bencana</span>
                  <div className={cn("size-6 rounded-lg border-2 flex items-center justify-center transition-colors", filters.semua ? "bg-bencana-info border-bencana-info text-white" : "border-slate-300 dark:border-slate-600 bg-white/50")}>
                    {filters.semua && <Check className="size-4" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={filters.semua} onChange={() => handleFilterToggle('semua')} />
                </label>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-2">Kategori</p>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <label key={key} className={cn("flex items-center justify-between p-3.5 rounded-[20px] cursor-pointer transition-all duration-300 group border", filters[key] ? "bg-white/80 dark:bg-slate-800/80 border-white/60 dark:border-slate-700/60 shadow-sm" : "bg-white/30 dark:bg-slate-800/30 border-transparent hover:bg-white/50 dark:hover:bg-slate-800/50")}>
                      <div className="flex items-center gap-3">
                        <div className={cn("size-9 rounded-xl flex items-center justify-center shadow-sm", config.bg, "bg-opacity-10 text-opacity-100")} style={{ color: config.color, backgroundColor: `${config.color}20` }}>
                          <config.icon className="size-[18px]" />
                        </div>
                        <span className={cn("font-medium transition-colors", filters[key] ? "text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300")}>{config.label}</span>
                      </div>
                      <div className={cn("size-5 rounded border flex items-center justify-center transition-colors", filters[key] ? "bg-bencana-info border-bencana-info text-white" : "border-slate-300 dark:border-slate-600 bg-white/50")}>
                        {filters[key] && <Check className="size-3.5" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={filters[key]} onChange={() => handleFilterToggle(key)} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-5 border-t border-white/40 dark:border-slate-800/60 bg-white/30 dark:bg-slate-900/30">
                <div className="flex gap-3">
                  <button 
                    onClick={() => setFilters({
                      semua: false, earthquake: false, tsunami: false, flood: false, landslide: false, volcano: false, extreme_weather: false
                    })}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-slate-200/50 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-[2] py-3 rounded-2xl text-sm font-bold bg-bencana-info text-white shadow-[0_8px_16px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)] hover:bg-bencana-info/90 transition-all"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 20px;
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255,255,255,0.6);
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
        }
        .dark .custom-popup .leaflet-popup-content-wrapper {
           background-color: rgba(15, 23, 42, 0.95);
           border-color: rgba(51, 65, 85, 0.6);
        }
        .custom-popup .leaflet-popup-tip {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        /* Custom Scrollbar for list */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.3);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
