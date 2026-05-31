import { BookOpen, Wind, Droplets, Mountain, Flame, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

const EDU_CATEGORIES = [
  { id: 'gempa', name: 'Gempa Bumi', icon: Mountain, color: 'bg-amber-100 text-amber-700', desc: 'Panduan keselamatan saat terjadi guncangan hebat.' },
  { id: 'tsunami', name: 'Tsunami', icon: Droplets, color: 'bg-blue-100 text-blue-700', desc: 'Cara evakuasi cepat menjauhi pesisir pantai.' },
  { id: 'banjir', name: 'Banjir', icon: Droplets, color: 'bg-cyan-100 text-cyan-700', desc: 'Langkah mengamankan keluarga dan rumah tangga.' },
  { id: 'angin', name: 'Angin Puting Beliung', icon: Wind, color: 'bg-slate-200 text-slate-700', desc: 'Amankan diri dari cuaca dan angin ekstrem.' },
  { id: 'erupsi', name: 'Erupsi Gunung Api', icon: Flame, color: 'bg-orange-100 text-orange-700', desc: 'Proteksi udara dan jalur evakuasi zona aman.' },
];

export default function Education() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Edukasi Bencana</h2>
        <p className="text-sm text-slate-500">
          Pelajari apa yang harus dilakukan sebelum, saat, dan sesudah bencana alam untuk melindungi keluarga Anda.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EDU_CATEGORIES.map((cat) => (
          <button 
            key={cat.id}
            className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all text-left group"
          >
            <div className={cn("size-12 rounded-xl flex items-center justify-center shrink-0", cat.color)}>
              <cat.icon className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{cat.name}</h3>
              <p className="text-xs text-slate-500 leading-snug mt-1">{cat.desc}</p>
            </div>
            <div className="mt-2 text-slate-300 group-hover:text-bencana-info transition-colors">
              <ArrowRight className="size-5" />
            </div>
          </button>
        ))}
      </div>
      
      <div className="bg-slate-900 rounded-2xl p-6 text-white mt-8 relative overflow-hidden">
        <div className="relative z-10">
          <BookOpen className="size-8 text-bencana-info mb-4" />
          <h3 className="text-lg font-bold mb-2">Unduh Panduan Lengkap</h3>
          <p className="text-sm text-slate-400 mb-4">Simpan seluruh modul edukasi untuk diakses secara offline saat darurat.</p>
          <button className="bg-bencana-info hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors">
            Unduh Mode Offline
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 size-40 bg-bencana-info/20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}
