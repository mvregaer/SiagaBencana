import { Phone, Users, Siren, Building2, Flame } from 'lucide-react';

const CONTACTS = [
  { id: 'bpbd', name: 'BPBD Jakarta Selatan', number: '112', icon: Building2, color: 'bg-blue-100 text-blue-600' },
  { id: 'basarnas', name: 'BASARNAS', number: '115', icon: Users, color: 'bg-orange-100 text-orange-600' },
  { id: 'ambulance', name: 'Ambulans Darurat', number: '118', icon: Siren, color: 'bg-red-100 text-red-600' },
  { id: 'police', name: 'Kepolisian RI', number: '110', icon: Building2, color: 'bg-slate-200 text-slate-700' },
  { id: 'fire', name: 'Pemadam Kebakaran', number: '113', icon: Flame, color: 'bg-rose-100 text-rose-600' },
];

export default function Contacts() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-red-50 rounded-2xl p-6 shadow-sm border border-red-100 text-center">
        <h2 className="text-xl font-display font-bold text-red-900 mb-2">Panggilan Darurat</h2>
        <p className="text-sm text-red-700 mb-4">
          Hanya gunakan nomor ini untuk kondisi darurat yang mengancam nyawa. Panggilan bebas pulsa.
        </p>
      </div>

      <div className="grid gap-3">
        {CONTACTS.map((contact) => (
          <a
            key={contact.id}
            href={`tel:${contact.number}`}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-bencana-info hover:shadow-md transition-all active:scale-[0.99] group"
          >
            <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${contact.color}`}>
              <contact.icon className="size-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{contact.name}</h3>
              <p className="text-sm text-slate-500 font-medium tracking-wider">{contact.number}</p>
            </div>
            
            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-bencana-safe group-hover:text-white transition-colors">
              <Phone className="size-5" />
            </div>
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-8">
         <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
               <Users className="size-5 text-bencana-info" />
               Kontak Keluarga
            </h3>
         </div>
         <div className="p-6 text-center text-slate-500 text-sm">
            Tentukan titik kumpul keluarga dan simpan kontak yang bisa dihubungi di luar wilayah bencana.
            <button className="mt-4 w-full bg-slate-900 text-white font-medium py-2.5 rounded-xl block">
               + Tambah Kontak Keluarga
            </button>
         </div>
      </div>
    </div>
  );
}
