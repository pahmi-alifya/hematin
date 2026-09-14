'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { BottomNav } from '@/components/layout/BottomNav'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDebtStore } from '@/stores/debtStore'
import { toast } from '@/components/ui/Toast'
import { useDebtTabs } from '@/hooks/useDebtTabs'
import { useDebtSheets } from '@/hooks/useDebtSheets'
import { useCicilanPayments } from '@/hooks/useCicilanPayments'
import { useCanEditActiveWallet } from '@/hooks/useCanEditActiveWallet'
import { CicilanReminderBanner } from '@/components/debts/CicilanReminderBanner'
import { DebtCard } from '@/components/debts/DebtCard'
import { DebtForm } from '@/components/debts/DebtForm'
import { MarkPaidSheet } from '@/components/debts/MarkPaidSheet'
import { PaymentSheet } from '@/components/debts/PaymentSheet'
import { PaymentHistory } from '@/components/debts/PaymentHistory'
import { formatRupiah } from '@/lib/utils'
import { useTranslation } from '@/hooks/useTranslation'
import { useDateLocale } from '@/hooks/useDateLocale'
import type { Debt } from '@/types'

export default function DebtsPage() {
  const {
    debts,
    isLoading,
    loadDebts,
    markAsPaid,
    deleteDebt,
    getPaymentsByDebt,
    getTotalPaid,
    getRemaining,
    getPendingCicilanToday,
  } = useDebtStore()

  const [mounted, setMounted] = useState(false)
  const canEdit = useCanEditActiveWallet()
  const tabs = useDebtTabs(debts)
  const sheets = useDebtSheets()
  const cicilan = useCicilanPayments(sheets.closePaymentSheet)
  const t = useTranslation()
  const dateLocale = useDateLocale()

  useEffect(() => {
    setMounted(true)
    loadDebts()
  }, [loadDebts])

  const pendingCicilan = useMemo(() => getPendingCicilanToday(), [debts])

  async function handleMarkPaid(notes: string) {
    if (!sheets.showPaidSheet) return
    try {
      await markAsPaid(sheets.showPaidSheet.id, notes)
      toast(t.debts.toast.markPaidSuccess, 'success')
      sheets.closePaidSheet()
    } catch {
      toast(t.debts.toast.markPaidError, 'error')
    }
  }

  async function handleDelete(debt: Debt) {
    try {
      await deleteDebt(debt.id)
      toast(t.debts.toast.deleteSuccess, 'success')
      sheets.closeDetail()
    } catch {
      toast(t.debts.toast.deleteError, 'error')
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title={t.debts.pageTitle} />

      <PageWrapper>
        <div className="space-y-4 pb-28">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-red-100 dark:border-red-900/40 shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t.debts.summary.totalHutang}</p>
              <p className="text-xl font-bold text-red-500 dark:text-red-400">{formatRupiah(tabs.totalHutang)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.debts.summary.activeCount(tabs.activeHutang.length)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t.debts.summary.totalPiutang}</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(tabs.totalPiutang)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.debts.summary.activeCount(tabs.activePiutang.length)}</p>
            </div>
          </div>

          {/* Cicilan reminder banner */}
          <AnimatePresence>
            {pendingCicilan.length > 0 && (
              <CicilanReminderBanner
                debts={pendingCicilan}
                onPayNow={(d) => sheets.openPaymentSheet(d)}
              />
            )}
          </AnimatePresence>

          {/* Overdue warning */}
          <AnimatePresence>
            {tabs.overdueCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 rounded-2xl px-4 py-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  {t.debts.overdueWarning(tabs.overdueCount)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab toggle */}
          <div data-tour="debt-tabs" className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            {(['hutang', 'piutang'] as const).map((tabType) => (
              <motion.button
                key={tabType}
                whileTap={{ scale: 0.97 }}
                onClick={() => tabs.setActiveTab(tabType)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tabs.activeTab === tabType
                    ? 'bg-white dark:bg-slate-700 shadow-sm ' + (tabType === 'hutang' ? 'text-red-500' : 'text-emerald-600')
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.debts.tabs.label(tabType, tabType === 'hutang' ? tabs.activeHutang.length : tabs.activePiutang.length)}
              </motion.button>
            ))}
          </div>

          {/* Active list */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ))}
            </div>
          ) : tabs.sortedActive.length === 0 ? (
            <EmptyState
              icon={tabs.activeTab === 'hutang' ? '🎉' : '💸'}
              title={t.debts.empty.title(tabs.activeTab)}
              description={t.debts.empty.description(tabs.activeTab)}
              action={canEdit ? { label: t.debts.empty.action(tabs.activeTab), onClick: sheets.openAdd } : undefined}
            />
          ) : (
            <div className="space-y-3">
              {tabs.sortedActive.map((debt, i) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  index={i}
                  totalPaid={getTotalPaid(debt.id)}
                  onMarkPaid={() => sheets.openPaidSheet(debt)}
                  onDelete={() => handleDelete(debt)}
                  onTap={() => sheets.openDetail(debt)}
                  onPayCicilan={() => sheets.openPaymentSheet(debt)}
                  onShowHistory={() => sheets.openHistory(debt)}
                />
              ))}
            </div>
          )}

          {/* Paid list (collapsible) */}
          {tabs.paidList.length > 0 && (
            <div>
              <button
                onClick={sheets.togglePaidList}
                className="w-full flex items-center justify-between px-1 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400"
              >
                <span>{t.debts.paidSection.label(tabs.paidList.length)}</span>
                {sheets.showPaidList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence>
                {sheets.showPaidList && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {tabs.paidList.map((debt, i) => (
                      <DebtCard
                        key={debt.id}
                        debt={debt}
                        index={i}
                        totalPaid={getTotalPaid(debt.id)}
                        onMarkPaid={() => {}}
                        onDelete={() => handleDelete(debt)}
                        onTap={() => sheets.openDetail(debt)}
                        onPayCicilan={() => {}}
                        onShowHistory={() => sheets.openHistory(debt)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Add button (when list not empty) */}
          {canEdit && tabs.sortedActive.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={sheets.openAdd}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> {t.debts.addButton(tabs.activeTab)}
            </motion.button>
          )}
        </div>
      </PageWrapper>

      <BottomNav />

      {/* Add Debt Sheet */}
      <BottomSheet
        open={sheets.showAdd}
        onClose={sheets.closeAdd}
        title={t.debts.sheets.addTitle(tabs.activeTab)}
      >
        <DebtForm defaultType={tabs.activeTab} onSuccess={sheets.closeAdd} />
      </BottomSheet>

      {/* Mark as Paid Sheet */}
      <BottomSheet
        open={!!sheets.showPaidSheet}
        onClose={sheets.closePaidSheet}
        title={t.debts.sheets.markPaidTitle}
      >
        {sheets.showPaidSheet && (
          <MarkPaidSheet
            debt={sheets.showPaidSheet}
            onConfirm={handleMarkPaid}
            onClose={sheets.closePaidSheet}
          />
        )}
      </BottomSheet>

      {/* Payment (Cicilan) Sheet */}
      <BottomSheet
        open={!!sheets.showPaymentSheet}
        onClose={sheets.closePaymentSheet}
        title={t.debts.sheets.paymentTitle}
      >
        {sheets.showPaymentSheet && (
          <PaymentSheet
            debt={sheets.showPaymentSheet}
            remaining={getRemaining(sheets.showPaymentSheet.id)}
            paidDate={cicilan.cicilanPaidDate}
            onPaidDateChange={cicilan.setCicilanPaidDate}
            onConfirm={(amount, notes) => cicilan.handlePayCicilan(sheets.showPaymentSheet!, amount, notes)}
            onClose={sheets.closePaymentSheet}
          />
        )}
      </BottomSheet>

      {/* History Sheet */}
      <BottomSheet
        open={!!sheets.showHistory}
        onClose={sheets.closeHistory}
        title={t.debts.sheets.historyTitle(sheets.showHistory?.person ?? '')}
      >
        {sheets.showHistory && (
          <PaymentHistory
            payments={getPaymentsByDebt(sheets.showHistory.id)}
            totalPaid={getTotalPaid(sheets.showHistory.id)}
            remaining={getRemaining(sheets.showHistory.id)}
            onDeletePayment={cicilan.handleDeletePayment}
          />
        )}
      </BottomSheet>

      {/* Detail Sheet */}
      <BottomSheet
        open={!!sheets.showDetail}
        onClose={sheets.closeDetail}
        title={t.debts.sheets.detailTitle}
      >
        {sheets.showDetail && (
          <div className="px-5 pb-6 space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                {t.debts.detail.owedTo(sheets.showDetail.type, sheets.showDetail.person)}
              </p>
              <p className={`text-3xl font-bold ${sheets.showDetail.type === 'hutang' ? 'text-red-500' : 'text-emerald-600'}`}>
                {formatRupiah(sheets.showDetail.amount)}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl divide-y divide-slate-200 dark:divide-slate-700">
              {[
                { label: t.debts.detail.fieldType, value: t.debts.detail.typeValue(sheets.showDetail.type) },
                { label: t.debts.detail.fieldMode, value: sheets.showDetail.isCicilan ? t.debts.detail.modeCicilan(formatRupiah(sheets.showDetail.cicilanAmount ?? 0), sheets.showDetail.cicilanDay ?? 1) : t.debts.detail.modeLumpSum },
                { label: t.debts.detail.fieldDescription, value: sheets.showDetail.description || t.debts.detail.noValue },
                ...(!sheets.showDetail.isCicilan ? [{ label: t.debts.detail.fieldDueDate, value: sheets.showDetail.dueDate ? format(parseISO(sheets.showDetail.dueDate), 'd MMMM yyyy', { locale: dateLocale }) : t.debts.detail.noDueDate }] : []),
                { label: t.debts.detail.fieldStatus, value: sheets.showDetail.status === 'paid' ? t.debts.detail.statusPaid : sheets.showDetail.status === 'overdue' ? t.debts.detail.statusOverdue : sheets.showDetail.status === 'partial' ? t.debts.detail.statusPartial : t.debts.detail.statusActive },
                ...(sheets.showDetail.notes ? [{ label: t.debts.detail.fieldPaidNotes, value: sheets.showDetail.notes }] : []),
                { label: t.debts.detail.fieldCreatedAt, value: format(new Date(sheets.showDetail.createdAt), 'd MMM yyyy', { locale: dateLocale }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start px-4 py-3 gap-4">
                  <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 text-right">{value}</span>
                </div>
              ))}
            </div>
            {canEdit && sheets.showDetail.status !== 'paid' && (
              sheets.showDetail.isCicilan ? (
                <Button
                  fullWidth
                  onClick={() => { sheets.openPaymentSheet(sheets.showDetail); sheets.closeDetail() }}
                >
                  <CreditCard className="w-4 h-4 mr-1.5" /> {t.debts.actions.payCicilan}
                </Button>
              ) : (
                <Button
                  fullWidth
                  onClick={() => { sheets.openPaidSheet(sheets.showDetail); sheets.closeDetail() }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> {t.debts.actions.markPaid}
                </Button>
              )
            )}
            {canEdit && (
              <Button variant="danger" fullWidth onClick={() => handleDelete(sheets.showDetail!)}>
                <Trash2 className="w-4 h-4 mr-1.5" /> {t.debts.actions.deleteRecord}
              </Button>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
