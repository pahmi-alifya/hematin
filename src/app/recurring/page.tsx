'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, RefreshCw, Pencil, Trash2, Power } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { DayPicker } from '@/components/ui/DayPicker'
import { CategoryPicker } from '@/components/transactions/CategoryPicker'
import { useRecurringStore } from '@/stores/recurringStore'
import { useRecurringTemplateForm } from '@/hooks/useRecurringTemplateForm'
import { useCanEditActiveWallet } from '@/hooks/useCanEditActiveWallet'
import { useTranslation } from '@/hooks/useTranslation'
import { useLanguageStore } from '@/stores/languageStore'
import { toast } from '@/components/ui/Toast'
import { formatRupiah } from '@/lib/utils'
import { getCategoryById, getCategoryLabel } from '@/lib/categories'
import { TRANSACTION_TYPE_TOGGLE } from '@/lib/transactions'
import { cn } from '@/lib/utils'
import type { RecurringTemplate } from '@/types'

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
  const t = useTranslation()
  const language = useLanguageStore((s) => s.language)
  const cat = getCategoryById(template.category, template.type)
  const canEdit = useCanEditActiveWallet()

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
              {template.merchant || getCategoryLabel(cat, language) || template.category}
            </p>
            <span className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
              {t.recurring.dayLabel(template.recurringDay)}
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
        {canEdit && (
          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggle}
              title={template.isActive ? t.recurring.deactivate : t.recurring.activate}
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
        )}
      </div>
    </motion.div>
  )
}

export default function RecurringPage() {
  const t = useTranslation()
  const { templates, isLoading, loadTemplates, deleteTemplate, toggleActive } = useRecurringStore()
  const {
    showForm,
    openAdd,
    openEdit,
    closeForm,
    editingId,
    form,
    setField,
    activeCategory,
    amount,
    handleTypeChange,
    handleSubmit,
    submitting,
  } = useRecurringTemplateForm()
  const canEdit = useCanEditActiveWallet()

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const activeTemplates = templates.filter((t) => t.isActive)
  const inactiveTemplates = templates.filter((t) => !t.isActive)

  async function handleDelete(id: string) {
    try {
      await deleteTemplate(id)
      toast(t.recurring.templateDeletedToast, 'success')
    } catch {
      toast(t.recurring.templateDeleteFailedToast, 'error')
    }
  }

  async function handleToggle(id: string) {
    await toggleActive(id)
  }

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title={t.recurring.pageTitle} />

      <PageWrapper>
        <div className="pb-28 space-y-4">
          {/* Info card */}
          <div
            data-tour="recurring-info"
            className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/40 rounded-2xl px-4 py-3"
          >
            <div className="flex items-start gap-2.5">
              <RefreshCw className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
              <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
                {t.recurring.infoBanner}
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
              title={t.recurring.emptyTitle}
              description={t.recurring.emptyDescription}
              action={canEdit ? { label: t.recurring.emptyAction, onClick: openAdd } : undefined}
            />
          ) : (
            <div className="space-y-4">
              {/* Aktif */}
              {activeTemplates.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">
                    {t.recurring.activeCount(activeTemplates.length)}
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
                    {t.recurring.inactive}
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
          {canEdit && templates.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={openAdd}
              className="w-full h-12 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t.recurring.addTemplate}
            </motion.button>
          )}
        </div>
      </PageWrapper>

      {/* FAB */}
      {canEdit && templates.length === 0 && (
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
        onClose={closeForm}
        title={editingId ? t.recurring.editTemplate : t.recurring.addTemplate}
      >
        <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-5">
          {/* Type Toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            {TRANSACTION_TYPE_TOGGLE.map((opt) => (
              <motion.button
                key={opt.value}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleTypeChange(opt.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  form.type === opt.value
                    ? `bg-white dark:bg-slate-700 ${opt.activeClass} shadow-sm`
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.transactions[opt.labelKey]}
              </motion.button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              {t.common.amount}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amount.display}
                onChange={amount.onChange}
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-2xl font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <CategoryPicker
            type={form.type}
            selected={activeCategory}
            onSelect={(cat) => setField('category', cat)}
          />

          {/* Merchant */}
          <Input
            label={t.recurring.merchantLabel}
            placeholder={form.type === 'income' ? t.recurring.merchantPlaceholderIncome : t.recurring.merchantPlaceholderExpense}
            value={form.merchant}
            onChange={(e) => setField('merchant', e.target.value)}
          />

          {/* Tanggal berulang */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
              {t.recurring.repeatsOnLabel}
            </label>
            <DayPicker value={form.recurringDay} onChange={(day) => setField('recurringDay', day)} />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {t.recurring.dayHelperText}
            </p>
          </div>

          {/* Notes */}
          <Textarea
            label={`${t.common.notes} (${t.common.optional})`}
            placeholder={t.common.notesPlaceholder}
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            rows={2}
          />

          <Button type="submit" fullWidth loading={submitting} size="lg">
            {editingId ? t.common.saveChanges : t.recurring.addTemplate}
          </Button>
        </form>
      </BottomSheet>
    </div>
  )
}
