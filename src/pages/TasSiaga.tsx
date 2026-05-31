import { useState, useEffect, FormEvent } from 'react';
import { Briefcase, Check, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

const DEFAULT_ITEMS = [
  { id: '1', label: 'Air mineral (untuk 3 hari)', checked: false },
  { id: '2', label: 'Makanan tahan lama (biskuit, kaleng)', checked: false },
  { id: '3', label: 'Obat-obatan pribadi & P3K', checked: false },
  { id: '4', label: 'Senter & baterai cadangan', checked: false },
  { id: '5', label: 'Peluit untuk sinyal darurat', checked: false },
  { id: '6', label: 'Dokumen penting (dalam plastik kedap air)', checked: false },
  { id: '7', label: 'Pakaian ganti & jaket', checked: false },
  { id: '8', label: 'Uang tunai secukupnya', checked: false },
  { id: '9', label: 'Power bank & kabel pengisi daya', checked: false },
];

export default function TasSiaga() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('siagabencana_tassiaga');
    if (saved) return JSON.parse(saved);
    return DEFAULT_ITEMS;
  });
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    localStorage.setItem('siagabencana_tassiaga', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(items.map((it: any) => it.id === id ? { ...it, checked: !it.checked } : it));
  };

  const addItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems([...items, { id: Date.now().toString(), label: newItem.trim(), checked: false }]);
    setNewItem('');
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((it: any) => it.id !== id));
  };

  const checkedCount = items.filter((it: any) => it.checked).length;
  const progress = items.length === 0 ? 0 : Math.round((checkedCount / items.length) * 100);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
        <div className="size-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="size-8" />
        </div>
        <h2 className="text-xl font-display font-bold text-slate-900 mb-2">Tas Siaga Bencana</h2>
        <p className="text-sm text-slate-500 mb-6">
          Persiapkan perlengkapan darurat dalam satu tas untuk kebutuhan bertahan hidup 72 jam pertama.
        </p>

        <div className="relative pt-4">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 rounded-full text-emerald-600 bg-emerald-50">
                Kesiapan: {progress}%
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-slate-500">
                {checkedCount} / {items.length} item
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100">
            <div style={{ width: `${progress}%` }} className={cn(
               "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500",
               progress < 30 ? "bg-red-500" : progress < 70 ? "bg-amber-500" : "bg-emerald-500"
            )}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <ul className="divide-y divide-slate-100">
          {items.map((item: any) => (
            <li key={item.id} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-slate-50 transition-colors">
              <button 
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "size-6 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                  item.checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white"
                )}
              >
                {item.checked && <Check className="size-4" />}
              </button>
              <span className={cn("flex-1 text-sm font-medium", item.checked ? "text-slate-400 line-through" : "text-slate-700")}>
                {item.label}
              </span>
              <button onClick={() => deleteItem(item.id)} className="text-slate-400 hover:text-red-500 p-2">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form onSubmit={addItem} className="flex gap-2">
            <input 
              type="text" 
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Tambah barang keperluan khusus..." 
              className="flex-1 bg-white border border-slate-300 text-sm rounded-xl px-4 py-2 outline-none focus:border-bencana-info focus:ring-2 focus:ring-bencana-info/20"
            />
            <button type="submit" className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
               <Plus className="size-5" />
            </button>
          </form>
        </div>
      </div>
      
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3 text-amber-800">
        <ShieldAlert className="size-5 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed font-medium">
          Letakkan Tas Siaga di tempat yang mudah dijangkau saat darurat (misal: dekat pintu keluar). Periksa tanggal kedaluwarsa makanan dan obat setiap 6 bulan sekali.
        </p>
      </div>
    </div>
  );
}
