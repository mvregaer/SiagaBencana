import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, AlertTriangle, CheckCircle, Navigation, Info, ExternalLink, ChevronRight, Activity, Clock, MapPin, BookOpen, Briefcase, PhoneCall, Send, CloudRain } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface GempaData {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi: string;
  Dirasakan: string;
  Shakemap: string;
}

export default function Dashboard() {
  const [gempa, setGempa] = useState<GempaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('Jakarta Selatan'); // Mock for MVP without true gps integration
  
  const [isReporting, setIsReporting] = useState(false);
  const [reportStatus, setReportStatus] = useState<{type: 'success'|'error', message: string} | null>(null);

  const handleReportCondition = () => {
    setIsReporting(true);
    setReportStatus(null);

    if (!('geolocation' in navigator)) {
      setReportStatus({ type: 'error', message: 'Geolocation tidak didukung oleh browser Anda.' });
      setIsReporting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await axios.post('/api/report-condition', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
          });
          setReportStatus({ type: 'success', message: res.data.message });
        } catch (err) {
          setReportStatus({ type: 'error', message: 'Gagal mengirim laporan. Periksa koneksi Anda.' });
        } finally {
          setIsReporting(false);
        }
      },
      (geoError) => {
        let msg = 'Gagal mengakses lokasi. Pastikan izin lokasi aktif.';
        if (geoError.code === 1) msg = 'Akses lokasi ditolak oleh pengguna.';
        setReportStatus({ type: 'error', message: msg });
        setIsReporting(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    async function fetchGempa() {
      try {
        const res = await axios.get('/api/bencana/gempa/baru');
        // BMKG JSON returns structure: Infogempa.gempa
        if (res.data?.Infogempa?.gempa) {
          setGempa(res.data.Infogempa.gempa);
        }
      } catch (err) {
        setError('Gagal memuat data gempa BMKG');
      } finally {
        setLoading(false);
      }
    }
    fetchGempa();
  }, []);

  const magnitude = parseFloat(gempa?.Magnitude || '0');
  const isDanger = magnitude >= 6.0;
  const isWarning = magnitude >= 5.0 && magnitude < 6.0;

  return (
    <div className="space-y-6">
      {/* Header, Location & Weather */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 dark:border-slate-800/60 flex items-center justify-between transition-colors duration-300">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mb-1">
              <Navigation className="size-4 text-bencana-info" />
              Lokasi Saat Ini
            </p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{locationName}</h2>
          </div>
          <div className="flex h-10 px-3 items-center gap-2 bg-white/30 dark:bg-slate-800/50 text-bencana-safe rounded-full border border-white/50 dark:border-slate-600/50 shadow-sm backdrop-blur-md transition-colors duration-200">
            <CheckCircle className="size-4" />
            <span className="text-sm font-semibold">Kondisi Aman</span>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="bg-gradient-to-br from-blue-400/80 to-blue-600/80 dark:from-blue-600/60 dark:to-blue-800/60 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(59,130,246,0.15)] border border-white/40 dark:border-white/10 flex items-center justify-between text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <div className="relative z-10">
             <p className="text-blue-50 text-xs font-medium mb-1 uppercase tracking-wider flex items-center gap-1">
               <Clock className="size-3" /> Realtime
             </p>
             <h3 className="text-3xl font-display font-bold text-white drop-shadow-sm">28°C</h3>
             <p className="text-white/90 text-sm mt-0.5 font-medium drop-shadow-sm">Hujan Ringan</p>
           </div>
           <div className="relative z-10 size-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-sm">
              <CloudRain className="size-8 text-white drop-shadow-sm" />
           </div>
        </div>
      </div>

      {/* Active Warnings */}
      {loading ? (
        <div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl transition-colors duration-200" />
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-2xl border border-red-100 dark:border-red-900/50 flex items-center gap-3 transition-colors duration-200">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : gempa ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
               <AlertCircle className="size-5 text-bencana-siaga" />
               Informasi Bencana Terkini
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
              <Clock className="size-3" />
              Diperbarui otomatis
            </span>
          </div>

          <div className={cn(
            "rounded-3xl p-5 border relative overflow-hidden transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl",
            isDanger ? "bg-red-50/80 dark:bg-red-950/40 border-red-200/60 dark:border-red-800/60 animate-urgent-pulse"
            : isWarning ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/60 dark:border-amber-800/60"
            : "bg-white/60 dark:bg-slate-900/60 border-white/60 dark:border-slate-800/60"
          )}>
            {/* Status Banner inside card for urgent threat */}
            {isDanger && (
               <div className="bg-red-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 absolute top-0 right-0 left-0 text-center tracking-wider uppercase border-b border-red-400">
                  Peringatan Tsunami / Potensi Merusak
               </div>
            )}
            
            <div className={cn("flex flex-col sm:flex-row gap-4", isDanger && "mt-5")}>
              <div className={cn(
                "size-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border shadow-sm transition-colors duration-200",
                isDanger ? "bg-red-100/80 dark:bg-red-900/50 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-800/60" 
                : isWarning ? "bg-amber-100/80 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60" 
                : "bg-blue-50/80 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-blue-100/60 dark:border-blue-800/60"
              )}>
                <span className="text-[10px] font-semibold uppercase leading-none mb-0.5">Mag</span>
                <span className="text-xl font-bold leading-none">{gempa.Magnitude}</span>
              </div>
              
              <div className="flex-1 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">Gempa Bumi di {gempa.Wilayah}</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 flex flex-col gap-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {gempa.Tanggal}, {gempa.Jam}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" /> Kedalaman: {gempa.Kedalaman}
                  </span>
                </div>
                
                {/* Visual Risk Bar */}
                <div className="mt-4 relative pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                     <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tingkat Bahaya</span>
                     <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", isDanger ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" : isWarning ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400")}>
                        {isDanger ? "Awas" : isWarning ? "Siaga" : "Waspada"}
                     </span>
                  </div>
                  <div className="flex h-2 overflow-hidden bg-white/50 dark:bg-slate-800 shadow-inner rounded-full transition-colors duration-200">
                     <div 
                        className={cn("transition-all duration-1000 ease-out shadow-sm rounded-full", isDanger ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-blue-500")}
                        style={{ width: `${Math.min((magnitude / 8) * 100, 100)}%` }} // Normalized up to Mag 8 for UI scale
                     />
                  </div>
                </div>

                <div className={cn(
                  "mt-4 text-sm font-medium py-2 px-3 rounded-xl inline-flex items-center gap-2 border shadow-sm transition-colors duration-200 backdrop-blur-sm",
                  gempa.Potensi.toLowerCase().includes('tsunami') && !gempa.Potensi.toLowerCase().includes('tidak')
                    ? "bg-red-50/80 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-800/60"
                    : "bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-white/60 dark:border-slate-700/60"
                )}>
                  {gempa.Potensi.toLowerCase().includes('tsunami') && !gempa.Potensi.toLowerCase().includes('tidak') 
                    ? <AlertTriangle className="size-4 text-red-500" /> 
                    : <Info className="size-4 text-bencana-info" />
                  }
                  {gempa.Potensi}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200/30 dark:border-slate-700/30 flex items-center justify-between transition-colors duration-200">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sumber: BMKG Indonesia</span>
              <Link to="/map" className="text-sm font-semibold text-bencana-info flex items-center gap-1 hover:underline group">
                Lihat di Peta <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Actions Shortcuts */}
      <div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
           <Activity className="size-5 text-bencana-info" />
           Langkah Penyelamatan
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-2xl">
          Siapkan diri Anda dan keluarga sebelum darurat terjadi. Pelajari cara bertahan hidup dan siapkan kebutuhan dasar.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { path: '/education', label: 'Panduan Keselamatan', icon: BookOpen, iconColor: 'text-[#C8B6FF]', bgColor: 'bg-[#C8B6FF]/10 dark:bg-[#C8B6FF]/20', hoverBorder: 'hover:border-[#C8B6FF]/40' },
            { path: '/siaga', label: 'Cek Tas Siaga', icon: Briefcase, iconColor: 'text-[#BFD8C2]', bgColor: 'bg-[#BFD8C2]/10 dark:bg-[#BFD8C2]/20', hoverBorder: 'hover:border-[#BFD8C2]/40' },
            { path: '/evacuation', label: 'Rencana Evakuasi', icon: Navigation, iconColor: 'text-[#AFC7E8]', bgColor: 'bg-[#AFC7E8]/10 dark:bg-[#AFC7E8]/20', hoverBorder: 'hover:border-[#AFC7E8]/40' },
            { path: '/contacts', label: 'Kontak Darurat', icon: PhoneCall, iconColor: 'text-[#F4CDE2]', bgColor: 'bg-[#F4CDE2]/10 dark:bg-[#F4CDE2]/20', hoverBorder: 'hover:border-[#F4CDE2]/40' },
          ].map(action => (
            <Link 
              key={action.path}
              to={action.path}
              className={cn("group flex flex-col p-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/60 dark:border-slate-800/60 transition-all hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] relative overflow-hidden", action.hoverBorder)}
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                 <ChevronRight className="size-4 text-slate-400 dark:text-slate-500" />
              </div>
              <div className={cn("size-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm border border-white/50", action.bgColor, action.iconColor)}>
                <action.icon className="size-6" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm mt-1">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Emergency Report */}
      <div className="bg-gradient-to-br from-rose-50/90 to-red-50/90 dark:from-rose-950/40 dark:to-red-950/40 backdrop-blur-xl rounded-3xl p-6 border border-rose-200/50 dark:border-rose-900/30 mt-8 relative overflow-hidden transition-colors duration-300 shadow-[0_8px_32px_rgba(244,63,94,0.08)]">
        <div className="absolute -right-10 -top-10 size-40 bg-rose-200/30 dark:bg-rose-900/20 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
           <div className="size-16 rounded-2xl bg-white/50 dark:bg-red-900/50 backdrop-blur-sm border border-white/60 dark:border-red-800/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
             <Send className="size-8" />
           </div>
           <div className="flex-1">
             <h3 className="font-bold text-slate-900 dark:text-red-300 text-lg">Lapor Kondisi Darurat</h3>
             <p className="text-sm text-slate-600 dark:text-red-200/80 mt-1 max-w-md font-medium">Dalam bahaya dan butuh bantuan segera? Kirim lokasi presisi Anda ke respons darurat.</p>
           </div>
           <button 
              onClick={handleReportCondition}
              disabled={isReporting}
              className={cn(
                 "bg-red-500/90 hover:bg-red-600 active:bg-red-700 backdrop-blur-md text-white font-bold py-3.5 px-6 rounded-2xl shadow-[0_4px_16px_rgba(239,68,68,0.3)] transition-all whitespace-nowrap self-stretch md:self-auto flex items-center justify-center min-w-[160px] border border-red-400/50",
                 isReporting && "opacity-70 cursor-not-allowed"
              )}
           >
              {isReporting ? 'Mengirim...' : 'Kirim Lokasi Sekarang'}
           </button>
        </div>

        {reportStatus && (
           <div className={cn(
              "mt-4 p-3 rounded-xl text-sm font-medium flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 transition-colors duration-200",
              reportStatus.type === 'success' ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400"
           )}>
              {reportStatus.type === 'success' ? <CheckCircle className="size-5 shrink-0" /> : <AlertTriangle className="size-5 shrink-0" />}
              <p>{reportStatus.message}</p>
           </div>
        )}
      </div>
    </div>
  );
}
