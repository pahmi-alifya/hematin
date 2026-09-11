'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { getCurrentDate } from '@/lib/utils'
import { PAYMENT_MODE_OPTIONS, CICILAN_DAY_PRESETS } from '@/lib/debts'
import { useDebtForm } from '@/hooks/useDebtForm'

export function DebtForm({
  defaultType,
  onSuccess,
}: {
  defaultType: 'hutang' | 'piutang'
  onSuccess: () => void
}) {
  const {
    type,
    setType,
    person,
    setPerson,
    amount,
    description,
    setDescription,
    dueDate,
    setDueDate,
    isCicilan,
    setIsCicilan,
    cicilanAmount,
    cicilanDay,
    setCicilanDay,
    cicilanStartMonth,
    setCicilanStartMonth,
    loading,
    handleSubmit,
  } = useDebtForm(defaultType, onSuccess)

  return (
    <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
        {(['hutang', 'piutang'] as const).map((t) => (
          <motion.button
            key={t}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              type === t
                ? t === 'hutang'
                  ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t === 'hutang' ? '🔴 Hutang' : '🟢 Piutang'}
          </motion.button>
        ))}
      </div>

      {/* Nama */}
      <Input
        label={type === 'hutang' ? 'Nama orang yang kamu hutangi' : 'Nama orang yang berhutang ke kamu'}
        placeholder="misal: Budi, Mama, Kantor"
        value={person}
        onChange={(e) => setPerson(e.target.value)}
      />

      {/* Nominal total */}
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
          Total {isCicilan ? '(keseluruhan)' : 'Nominal'}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount.display}
            onChange={amount.onChange}
            className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-2xl font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Keterangan */}
      <Textarea
        label="Keterangan (opsional)"
        placeholder="misal: bayar makan bareng, titip belanja"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />

      {/* Mode pembayaran */}
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mode Pembayaran</p>
        <div className="flex gap-2">
          {PAYMENT_MODE_OPTIONS.map(({ value, label }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setIsCicilan(value)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isCicilan === value
                  ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cicilan fields */}
      <AnimatePresence>
        {isCicilan && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Nominal per cicilan */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Nominal per Cicilan
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={cicilanAmount.display}
                  onChange={cicilanAmount.onChange}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Tanggal tiap bulan */}
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Jatuh Tempo Tiap Bulan (tanggal)
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {CICILAN_DAY_PRESETS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setCicilanDay(d)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      cicilanDay === d
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {/* Custom tanggal */}
              <div className="mt-2">
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={cicilanDay}
                  onChange={(e) => {
                    const v = Math.min(28, Math.max(1, Number(e.target.value)))
                    setCicilanDay(v)
                  }}
                  className="w-24 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="tgl lain"
                />
                <span className="text-xs text-slate-400 ml-2">angka 1–28</span>
              </div>
            </div>

            {/* Mulai bulan */}
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Mulai Bulan
              </label>
              <input
                type="month"
                value={cicilanStartMonth}
                onChange={(e) => setCicilanStartMonth(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Jatuh tempo (hanya untuk lunas sekaligus) */}
      {!isCicilan && (
        <Input
          label="Jatuh tempo (opsional)"
          type="date"
          value={dueDate}
          min={getCurrentDate()}
          onChange={(e) => setDueDate(e.target.value)}
        />
      )}

      <Button type="submit" fullWidth loading={loading} size="lg">
        Simpan Catatan
      </Button>
    </form>
  )
}
