'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
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

  useEffect(() => {
    setMounted(true)
    loadDebts()
  }, [loadDebts])

  const pendingCicilan = useMemo(() => getPendingCicilanToday(), [debts])

  async function handleMarkPaid(notes: string) {
    if (!sheets.showPaidSheet) return
    try {
      await markAsPaid(sheets.showPaidSheet.id, notes)
      toast('Alhamdulillah, hutang lunas! 🎉', 'success')
      sheets.closePaidSheet()
    } catch {
      toast('Gagal memperbarui', 'error')
    }
  }

  async function handleDelete(debt: Debt) {
    try {
      await deleteDebt(debt.id)
      toast('Catatan dihapus', 'success')
      sheets.closeDetail()
    } catch {
      toast('Gagal menghapus', 'error')
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-[#0B1120]">
      <Header title="Utang & Piutang" />

      <PageWrapper>
        <div className="space-y-4 pb-28">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-red-100 dark:border-red-900/40 shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Hutangku</p>
              <p className="text-xl font-bold text-red-500 dark:text-red-400">{formatRupiah(tabs.totalHutang)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{tabs.activeHutang.length} catatan aktif</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/40 shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Piutangku</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(tabs.totalPiutang)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{tabs.activePiutang.length} catatan aktif</p>
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
                  {tabs.overdueCount} hutang sudah melewati jatuh tempo!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
            {(['hutang', 'piutang'] as const).map((t) => (
              <motion.button
                key={t}
                whileTap={{ scale: 0.97 }}
                onClick={() => tabs.setActiveTab(t)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tabs.activeTab === t
                    ? 'bg-white dark:bg-slate-700 shadow-sm ' + (t === 'hutang' ? 'text-red-500' : 'text-emerald-600')
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t === 'hutang' ? `🔴 Hutangku (${tabs.activeHutang.length})` : `🟢 Piutangku (${tabs.activePiutang.length})`}
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
              title={tabs.activeTab === 'hutang' ? 'Tidak ada hutang' : 'Tidak ada piutang'}
              description={
                tabs.activeTab === 'hutang'
                  ? 'Kamu tidak punya hutang aktif saat ini'
                  : 'Tidak ada orang yang hutang ke kamu saat ini'
              }
              action={canEdit ? { label: `+ Tambah ${tabs.activeTab === 'hutang' ? 'Hutang' : 'Piutang'}`, onClick: sheets.openAdd } : undefined}
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
                <span>Sudah Lunas ({tabs.paidList.length})</span>
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
              <Plus className="w-4 h-4" /> Tambah {tabs.activeTab === 'hutang' ? 'Hutang' : 'Piutang'}
            </motion.button>
          )}
        </div>
      </PageWrapper>

      <BottomNav />

      {/* Add Debt Sheet */}
      <BottomSheet
        open={sheets.showAdd}
        onClose={sheets.closeAdd}
        title={`Catat ${tabs.activeTab === 'hutang' ? 'Hutang' : 'Piutang'}`}
      >
        <DebtForm defaultType={tabs.activeTab} onSuccess={sheets.closeAdd} />
      </BottomSheet>

      {/* Mark as Paid Sheet */}
      <BottomSheet
        open={!!sheets.showPaidSheet}
        onClose={sheets.closePaidSheet}
        title="Tandai Lunas"
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
        title="Catat Pembayaran"
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
        title={`Riwayat Pembayaran — ${sheets.showHistory?.person ?? ''}`}
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
        title="Detail Catatan"
      >
        {sheets.showDetail && (
          <div className="px-5 pb-6 space-y-4">
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                {sheets.showDetail.type === 'hutang' ? 'Hutang ke' : 'Piutang dari'} {sheets.showDetail.person}
              </p>
              <p className={`text-3xl font-bold ${sheets.showDetail.type === 'hutang' ? 'text-red-500' : 'text-emerald-600'}`}>
                {formatRupiah(sheets.showDetail.amount)}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl divide-y divide-slate-200 dark:divide-slate-700">
              {[
                { label: 'Jenis', value: sheets.showDetail.type === 'hutang' ? '🔴 Hutang' : '🟢 Piutang' },
                { label: 'Mode', value: sheets.showDetail.isCicilan ? `📅 Cicilan ${formatRupiah(sheets.showDetail.cicilanAmount ?? 0)}/bln (tgl ${sheets.showDetail.cicilanDay})` : '💵 Lunas Sekaligus' },
                { label: 'Keterangan', value: sheets.showDetail.description || '-' },
                ...(!sheets.showDetail.isCicilan ? [{ label: 'Jatuh Tempo', value: sheets.showDetail.dueDate ? format(parseISO(sheets.showDetail.dueDate), 'd MMMM yyyy', { locale: id }) : 'Tidak ditentukan' }] : []),
                { label: 'Status', value: sheets.showDetail.status === 'paid' ? '✅ Lunas' : sheets.showDetail.status === 'overdue' ? '⚠️ Terlambat' : sheets.showDetail.status === 'partial' ? '📊 Dicicil' : '🕐 Aktif' },
                ...(sheets.showDetail.notes ? [{ label: 'Catatan Lunas', value: sheets.showDetail.notes }] : []),
                { label: 'Dicatat', value: format(new Date(sheets.showDetail.createdAt), 'd MMM yyyy', { locale: id }) },
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
                  <CreditCard className="w-4 h-4 mr-1.5" /> Bayar Cicilan
                </Button>
              ) : (
                <Button
                  fullWidth
                  onClick={() => { sheets.openPaidSheet(sheets.showDetail); sheets.closeDetail() }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Tandai Lunas
                </Button>
              )
            )}
            {canEdit && (
              <Button variant="danger" fullWidth onClick={() => handleDelete(sheets.showDetail!)}>
                <Trash2 className="w-4 h-4 mr-1.5" /> Hapus Catatan
              </Button>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
