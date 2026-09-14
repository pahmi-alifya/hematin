"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Bagaimana cara mencatat transaksi baru?",
    answer:
      "Tekan tombol tambah (FAB) di halaman Dashboard atau Riwayat Transaksi, lalu isi jumlah, kategori, dan tanggal. Transaksi langsung tersimpan dan tampil di Riwayat serta grafik terkait.",
  },
  {
    question: "Bagaimana cara pakai fitur scan struk?",
    answer:
      "Buka menu Scan, lalu foto atau upload gambar struk belanja. AI akan otomatis membaca jumlah, kategori, dan tanggal transaksi — kamu tetap bisa mengedit hasilnya sebelum disimpan sebagai transaksi.",
  },
  {
    question: "Bagaimana cara mengatur Goals (batas pengeluaran)?",
    answer:
      "Buka menu Goals, pilih kategori, lalu atur nominal batas bulanannya. Batas ini berlaku otomatis setiap bulan (tidak perlu diatur ulang), sementara progres pengeluaran (spent) selalu dihitung berdasarkan bulan yang sedang berjalan.",
  },
  {
    question: "Bagaimana cara mencatat utang atau piutang?",
    answer:
      "Buka menu Utang & Piutang, tekan tambah, lalu pilih jenis (utang/piutang), nominal, dan orang terkait. Untuk cicilan, kamu bisa mencatat pembayaran bertahap dan melihat riwayat pembayarannya di kartu utang tersebut.",
  },
  {
    question: "Bagaimana cara membuat transaksi berulang (recurring)?",
    answer:
      "Buka menu Recurring, tambah template baru dengan kategori, nominal, dan tanggal berulang tiap bulan. Template bisa diaktifkan/nonaktifkan kapan saja, dan transaksi akan otomatis dibuat sesuai tanggal yang diatur.",
  },
  {
    question: "Di mana saya bisa melihat laporan keuangan bulanan?",
    answer:
      "Buka menu Laporan untuk melihat ringkasan cash flow, grafik kategori, dan perbandingan beberapa bulan terakhir.",
  },
  {
    question: "Bagaimana cara mengaktifkan fitur AI insight?",
    answer:
      "Buka Profil > Pengaturan AI, pilih provider AI, masukkan API key kamu sendiri, lalu pilih model. Setelah tersimpan, fitur insight dan scan struk berbasis AI akan aktif.",
  },
  {
    question: "Bagaimana cara membuat atau berpindah dompet (wallet)?",
    answer:
      "Buka Profil > Kelola Dompet untuk membuat dompet baru, berpindah antar dompet, atau mengatur dompet yang sudah ada. Nama dompet aktif juga bisa dipilih lewat pengalih dompet di bagian atas halaman.",
  },
  {
    question: "Bagaimana cara mengganti tampilan gelap/terang?",
    answer:
      "Tekan ikon tema di pojok kanan atas Header untuk beralih antara mode terang dan gelap. Pilihan ini otomatis tersimpan untuk kunjungan berikutnya.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className="w-4 h-4 text-sky-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Pertanyaan Umum
        </p>
      </div>

      <div className="space-y-2">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className="rounded-xl border border-slate-100 dark:border-slate-700/60 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-3 text-left bg-slate-50 dark:bg-slate-800"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-slate-400 dark:text-slate-500"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-3.5 py-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
