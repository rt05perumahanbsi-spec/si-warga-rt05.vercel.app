import React from 'react';
import { ShieldCheck, MapPin, Users, FileText } from 'lucide-react';
import { GANG_LIST } from '../data/gangList';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 py-10 sm:py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-stone-800 text-xs">
          {/* Col 1 */}
          <div>
            <div className="text-white font-bold text-base tracking-tight mb-1.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center">
                05
              </div>
              <span>RT 05 BLOK E PERUMAHAN BUMI SETIA INSANI</span>
            </div>
            <p className="text-stone-400 leading-relaxed max-w-md">
              Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi, Jawa Barat 17215.
            </p>
            <p className="text-stone-400 leading-relaxed mt-2 max-w-md text-[11px]">
              Sistem aplikasi resmi pemutakhiran data warga dan keluarga, pendataan warga tetap & domisili, statistik demografi, serta pembuatan surat pengantar RT secara mandiri dan cepat.
            </p>
            <div className="flex items-center gap-1.5 text-stone-300 mt-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Transparan · Akurat · Tertib Lingkungan</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2 text-stone-400">
            <div className="text-white font-bold text-xs uppercase tracking-wider mb-2">
              Daftar 6 Gang Resmi di RT 05 Blok E
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {GANG_LIST.map((g) => (
                <span
                  key={g}
                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${
                    g === 'Gg Cendrawasih'
                      ? 'bg-amber-950/40 text-amber-300 border-amber-600/50'
                      : 'bg-stone-800 text-stone-300 border-stone-700/80'
                  }`}
                >
                  {g} {g === 'Gg Cendrawasih' ? '★' : ''}
                </span>
              ))}
            </div>
            <div className="flex items-start gap-2 text-stone-400 text-xs pt-3">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Perumahan Bumi Setia Insani, Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 text-center sm:text-left">
          <div>
            © 2026 Pemutakhiran Data Warga RT 05 Blok E Perumahan Bumi Setia Insani.
          </div>
          <div>
            Untuk ketertiban, keamanan, dan kemudahan pelayanan warga bersama.
          </div>
        </div>
      </div>
    </footer>
  );
};
