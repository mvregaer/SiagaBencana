import { MapPin, Route, Users, Navigation, UserPlus } from 'lucide-react';

export default function EvacuationPlan() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
        <div className="size-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Route className="size-8" />
        </div>
        <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Rencana Evakuasi</h2>
        <p className="text-sm text-slate-500 mb-4">
          Buat dan bagikan rencana kumpul keluarga jika terjadi bencana alam dan jaringan terputus.
        </p>
      </div>

      <div className="space-y-4">
        {/* Titik Kumpul */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="size-5 text-bencana-siaga" />
              Titik Kumpul Utama
            </h3>
            <button className="text-bencana-info text-sm font-semibold hover:underline">Edit</button>
          </div>
          <div className="p-4 flex gap-3 items-start">
             <div className="flex-1">
                <p className="font-semibold text-slate-800">Taman Kota Lapangan Tembak</p>
                <p className="text-sm text-slate-500 mt-1">Jl. Lapangan Tembak No. 1, Jakarta</p>
             </div>
             <button className="size-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600 hover:bg-bencana-info hover:text-white transition-colors">
                <Navigation className="size-5" />
             </button>
          </div>
        </div>

        {/* Titik Cadangan */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="size-5 text-slate-400" />
              Titik Kumpul Cadangan
            </h3>
            <button className="text-bencana-info text-sm font-semibold hover:underline">Tambah</button>
          </div>
          <div className="p-4 text-center">
             <p className="text-sm text-slate-400">Belum ada titik kumpul cadangan yang diatur.</p>
          </div>
        </div>

        {/* Anggota Keluarga */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
             <h3 className="font-bold text-slate-900 flex items-center gap-2">
               <Users className="size-5 text-emerald-600" />
               Anggota Keluarga
             </h3>
             <button className="text-bencana-info text-sm font-semibold flex items-center gap-1 hover:underline">
               <UserPlus className="size-4" /> Tambah
             </button>
          </div>
          <div className="divide-y divide-slate-100">
             <div className="p-4 flex justify-between items-center bg-emerald-50/30">
                <div>
                   <p className="font-bold text-slate-800 text-sm">Budi (Ayah)</p>
                   <p className="text-xs text-slate-500 mt-0.5">Admin Rencana</p>
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-medium">Anda</span>
             </div>
             <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                <div>
                   <p className="font-bold text-slate-800 text-sm">Siti (Ibu)</p>
                   <p className="text-xs text-slate-500 mt-0.5">Prioritas: Bawa Obat Jantung</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
