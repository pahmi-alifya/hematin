'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RefreshCw, Pencil, Trash2, Power } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { CategoryPicker } from '@/components/transactions/CategoryPicker'
import { useRecurringStore } from '@/stores/recurringStore'
import { toast } from '@/components/ui/Toast'
import { formatRupiah, formatRupiahInput, parseRupiahInput } from '@/lib/utils'
import { getCategoryById } from '@/lib/categories'
import { cn } from '@/lib/utils'
import type { RecurringTemplate } from '@/types'

// Pills 1–28 untuk pilih tanggal berulang
function DayPicker({ value, onChange }: { value: number; onChange: (day: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
        <motion.button
          key={day}
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onChange(day)}
          className={cn(
            'w-9 h-9 rounded-xl text-sm font-semibold transition-all',
            value === day
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600',
          )}
        >
          {day}
        </motion.button>
      ))}
    </div>
  )
}

interface TemplateFormData {
  type: 'income' | 'expense' | 'saving'
  amount: string
  amountRaw: number
  category: string
  merchant: string
  notes: string
  recurringDay: number
  isActive: boolean
}

function getInitialForm(template?: RecurringTemplate): TemplateFormData {
  return {
    type: (template?.type ?? 'expense') as 'income' | 'expense' | 'saving',
    amount: template?.amount ? formatRupiahInput(template.amount) : '',
    amountRaw: template?.amount ?? 0,
    category: template?.category ?? '',
    merchant: template?.merchant ?? '',
    notes: template?.notes ?? '',
    recurringDay: template?.recurringDay ?? new Date().getDate() <= 28 ? new Date().getDate() : 1,
    isActive: template?.isActive ?? true,
  }
}

function TemplateCard({
  template,
  onEdit,
  onDelete,
  onToggle,
}: {
  template: RecurringTemplate
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const cat = getCategoryById(template.category, template.type)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white dark:bg-slate-800/60 rounded-2xl border overflow-hidden',
        template.isActive
          ? 'border-sky-100 dark:border-slate-700/60'
          : 'border-slate-200 dark:border-slate-700/40 opacity-60',
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: cat?.bgColor ?? '#F1F5F9' }}
        >
          {cat?.icon ?? '📦'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {template.merchant || cat?.name || template.category}
            </p>
            <span className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
              tgl {template.recurringDay}
            </span>
          </div>
          <p
            className={cn(
              'text-sm font-bold mt-0.5',
              template.type === 'income' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300',
            )}
          >
            {template.type === 'income' ? '+' : '-'}{formatRupiah(template.amount)}
          </p>
          {template.notes && (
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{template.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            title={template.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
              template.isActive
                ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400',
            )}
          >
            <Power className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center"
          >
            <Pencil className="w-3.5 h-3.5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function RecurringPage() {
  const { templates, isLoading, loadTemplates, addTemplate, updateTemplate, deleteTemplate, toggleActive } =
    useRecurringStore()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TemplateFormData>(getInitialForm())
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const activeTemplates = templates.filter((t) => t.isActive)
  const inactiveTemplates = templates.filter((t) => !t.isActive)

  function openAdd() {
    setEditingId(null)
    setForm(getInitialForm())
    setShowForm(true)
  }

  function openEdit(template: RecurringTemplate) {
    setEditingId(template.id)
    setForm(getInitialForm(template))
    setShowForm(true)
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseRupiahInput(e.target.value)
    setForm((f) => ({ ...f, amountRaw: raw, amount: formatRupiahInput(raw) }))
  }

  function handleTypeChange(type: 'income' | 'expense' | 'saving') {
    setForm((f) => ({ ...f, type, category: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amountRaw || form.amountRaw <= 0) {
      toast('Masukkan nominal yang valid', 'error')
      return
    }

    const activeCategory = form.category || (form.type === 'income' ? 'gaji' : form.type === 'saving' ? 'tabungan' : 'makanan')

    setSubmitting(true)
    try {
      const data = {
        type: form.type,
        amount: form.amountRaw,
        category: activeCategory,
        merchant: form.merchant.trim() || undefined,
        notes: form.notes.trim() || undefined,
        recurringDay: form.recurringDay,
        isActive: form.isActive,
      }

      if (editingId) {
        await updateTemplate(editingId, data)
        toast('Template berhasil diperbarui', 'success')
      } else {
        await addTemplate(data)
        toast('Transaksi rutin berhasil ditambahkan', 'success')
      }
      setShowForm(false)
    } catch {
      toast('Gagal menyimpan template', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTemplate(id)
      toast('Template dihapus', 'success')
    } catch {
      toast('Gagal menghapus template', 'error')
    }
  }

  async function handleToggle(id: string) {
    await toggleActive(id)
  }

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title="Transaksi Rutin" />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          {/* Info card */}
          <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/40 rounded-2xl px-4 py-3">
            <div className="flex items-start gap-2.5">
              <RefreshCw className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
              <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
                Transaksi rutin akan muncul sebagai pengingat di dashboard setiap bulan pada
                tanggal yang ditentukan. Kamu tetap konfirmasi sebelum data dicatat.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white dark:bg-slate-800/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <EmptyState
              icon="🔁"
              title="Belum ada transaksi rutin"
              description="Tambahkan tagihan atau pemasukan yang terjadi setiap bulan agar tidak lupa mencatat."
              action={{ label: 'Tambah Sekarang', onClick: openAdd }}
            />
          ) : (
            <div className="space-y-4">
              {/* Aktif */}
              {activeTemplates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">
                    Aktif · {activeTemplates.length} template
                  </p>
                  <AnimatePresence>
                    {activeTemplates.map((t) => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        onEdit={() => openEdit(t)}
                        onDelete={() => handleDelete(t.id)}
                        onToggle={() => handleToggle(t.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Tidak Aktif */}
              {inactiveTemplates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-1">
                    Nonaktif
                  </p>
                  <AnimatePresence>
                    {inactiveTemplates.map((t) => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        onEdit={() => openEdit(t)}
                        onDelete={() => handleDelete(t.id)}
                        onToggle={() => handleToggle(t.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Tombol tambah */}
          {templates.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={openAdd}
              className="w-full h-12 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Transaksi Rutin
            </motion.button>
          )}
        </div>
      </PageWrapper>

      {/* FAB */}
      {templates.length === 0 && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={openAdd}
          className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center z-20"
          style={{
            background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
            boxShadow: '0 4px 20px rgba(14,165,233,0.4)',
          }}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      )}

      <BottomNav />

      {/* Form Bottom Sheet */}
      <BottomSheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Edit Transaksi Rutin' : 'Tambah Transaksi Rutin'}
      >
        <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-5">
          {/* Type Toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            {([
              { value: 'expense', label: '💸 Keluar',   activeClass: 'text-red-500' },
              { value: 'income',  label: '💰 Masuk',    activeClass: 'text-emerald-500' },
              { value: 'saving',  label: '🏦 Tabungan', activeClass: 'text-teal-600 dark:text-teal-400' },
            ] as const).map((t) => (
              <motion.button
                key={t.value}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTypeChange(t.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  form.type === t.value
                    ? `bg-white dark:bg-slate-700 ${t.activeClass} shadow-sm`
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.label}
              </motion.button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              Nominal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={form.amount}
                onChange={handleAmountChange}
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-2xl font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <CategoryPicker
            type={form.type}
            selected={form.category || (form.type === 'income' ? 'gaji' : form.type === 'saving' ? 'tabungan' : 'makanan')}
            onSelect={(cat) => setForm((f) => ({ ...f, category: cat }))}
          />

          {/* Merchant */}
          <Input
            label="Nama toko / keterangan"
            placeholder={form.type === 'income' ? 'misal: PT. Maju Jaya' : 'misal: Kost, Spotify, Listrik'}
            value={form.merchant}
            onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
          />

          {/* Tanggal berulang */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              Ulangi setiap tanggal
            </label>
            <DayPicker
              value={form.recurringDay}
              onChange={(day) => setForm((f) => ({ ...f, recurringDay: day }))}
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Gunakan tanggal 1–28 agar aman di semua bulan
            </p>
          </div>

          {/* Notes */}
          <Textarea
            label="Catatan (opsional)"
            placeholder="Tambahkan catatan..."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={2}
          />

          <Button type="submit" fullWidth loading={submitting} size="lg">
            {editingId ? 'Simpan Perubahan' : 'Tambah Transaksi Rutin'}
          </Button>
        </form>
      </BottomSheet>
    </div>
  )
}
