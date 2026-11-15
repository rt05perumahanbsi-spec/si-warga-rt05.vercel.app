import React from 'react';
import {
  ShieldCheck,
  Users,
  Award,
  Home,
  CheckCircle2,
  Phone,
  UserCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { STRUKTUR_ORGANISASI_RT05 } from '../data/strukturOrganisasi';

export const StrukturOrganisasiSection: React.FC = () => {
  return (
    <section id="struktur-organisasi" className="py-10 sm:py-14 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-amber-700" />
            <span>Struktur Kepengurusan Resmi RT 05</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Pengurus RT 05 Blok E Perumahan Bumi Setia Insani
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
            Masa Bakti Kepengurusan Rukun Tetangga 05 Blok E, Desa Pahlawan Setia, Kecamatan Tarumajaya, Kabupaten Bekasi. Siap melayani warga dengan transparan, tertib, dan guyub rukun.
          </p>
        </div>

        {/* 1. DEWAN PENASEHAT RT */}
        <div className="mb-8">
          <div className="text-center mb-3">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
              Dewan Penasehat RT 05
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {STRUKTUR_ORGANISASI_RT05.penasehat.map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 border border-stone-200 text-center shadow-xs flex items-center justify-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-amber-800 font-semibold">{p.jabatan}</div>
                  <div className="text-sm font-extrabold text-stone-900">{p.nama}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. PIMPINAN INTI (Ketua, Wakil, Sekretaris & Bendahara) */}
        <div className="mb-10">
          <div className="text-center mb-4">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-widest">
              Pimpinan Inti Kepengurusan RT 05
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Ketua RT (Highlighted) */}
            <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md flex flex-col justify-between relative overflow-hidden md:scale-105 z-10">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Pimpinan Utama
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xs">
                    01
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 border-amber-400/70 bg-stone-800 shadow-md shrink-0">
                      <img
                        src={STRUKTUR_ORGANISASI_RT05.pimpinan[0].foto}
                        alt="Foto Ketua RT 05 Blok E - Arif Wahyudi"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-amber-400 font-semibold">Ketua RT 05</div>
                      <h3 className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight leading-snug">
                        Arif Wahyudi
                      </h3>
                      <div className="text-[11px] text-stone-400 mt-1">
                        RT 05 Blok E · RW 12
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-stone-300 mt-3 leading-relaxed">
                    Penanggung jawab utama seluruh pelayanan masyarakat, legalitas persuratan, musyawarah warga, dan perwakilan resmi RT 05 ke pihak RW dan Desa Pahlawan Setia.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Pelayanan surat pengantar & aspirasi warga</span>
              </div>
            </div>

            {/* Wakil Ketua RT */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Wakil Pimpinan
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-black text-xs">
                    02
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-amber-800 font-semibold">Wakil Ketua RT</div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-0.5 tracking-tight">
                    Abdul Rokhim
                  </h3>
                  <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                    Mendampingi tugas Ketua RT, mengoordinasikan operasional harian di lingkungan, serta menjadi penghubung antar-bidang dan koordinator gang.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Operasional lingkungan & koordinasi pengurus</span>
              </div>
            </div>

            {/* Sekretaris & Bendahara */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Administrasi & Keuangan
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-black text-xs">
                    03
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-amber-800 font-semibold">Sekretaris & Bendahara</div>
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-0.5 tracking-tight">
                    Handrian Prahdana
                  </h3>
                  <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
                    Bertanggung jawab penuh atas pemutakhiran data warga/KK, kearsipan persuratan, pencatatan kas, transparansi iuran bulanan, dan laporan keuangan terbuka RT 05.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pemutakhiran data KK & pembukuan kas RT</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SEKSI BIDANG PELAYANAN */}
        <div className="mb-10">
          <div className="text-center mb-4">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
              Seksi Bidang Operasional Lingkungan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {STRUKTUR_ORGANISASI_RT05.seksiBidang.map((seksi, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    {seksi.jabatan}
                  </div>
                  <h4 className="text-base sm:text-lg font-extrabold text-stone-900 mt-0.5">
                    {seksi.nama}
                  </h4>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                    {seksi.tugas}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Siaga pelayanan warga RT 05 Blok E</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. KORDINATOR GANG RESMI */}
        <div>
          <div className="text-center mb-4">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-widest">
              Koordinator Gang Resmi RT 05 Blok E
            </span>
            <p className="text-xs text-stone-500 mt-0.5">
              Penghubung komunikasi langsung untuk warga di masing-masing gang
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STRUKTUR_ORGANISASI_RT05.kordinatorGang.map((kor, idx) => (
              <div
                key={idx}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 pb-2 border-b border-stone-100">
                    <Home className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{kor.gang}</span>
                  </div>

                  <div className="mt-3">
                    <div className="text-[10px] text-stone-400 font-medium uppercase">
                      Koordinator Gang
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-stone-900 mt-0.5">
                      {kor.nama}
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                      {kor.tugas}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="font-semibold text-amber-800">RT 05 Blok E</span>
                  <span className="text-stone-400">Siap koordinasi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
