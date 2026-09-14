export const reports = {
  id: {
    // Header
    pageTitle: "Laporan",

    // Month navigator
    allTimeToggle: "Semua",
    allDataLabel: "Semua Data",

    // Summary cards
    incomeCardLabel: "Masuk",
    expenseCardLabel: "Keluar",
    summarySavingRateSuffix: (pct: number) => `${pct}% income`,

    // Cash flow chart empty state
    emptyTitle: "Belum ada data",
    emptyDescription: "Mulai catat transaksi untuk melihat laporan",

    // Category donuts
    expenseDistribution: "Distribusi Pengeluaran",
    incomeDistribution: "Distribusi Pemasukan",
    savingDistribution: "Distribusi Tabungan & Investasi",
    percentOfIncomeBadge: (pct: number) => `${pct}% dari income`,
    moreCategories: (n: number) => `+${n} kategori lainnya`,

    // Debt summary
    debtSummaryTitle: "Hutang & Piutang",

    // Net cash flow
    netCashFlowLabel: "Net Cash Flow",
    financeHealthyAll: "Keuangan keseluruhan sehat",
    financeHealthyMonth: "Keuangan bulan ini sehat",
    financeDeficitWarning: "Pengeluaran melebihi pemasukan",
    surplusBadge: "✓ Surplus",
    deficitBadge: "✗ Defisit",
    outUsage: (pct: number) => `Keluar ${pct}%`,
    savingUsage: (pct: number) => `Tabungan ${pct}%`,
    usedPercent: (pct: number) => `Terpakai ${pct}%`,
    savingRateLabel: "Saving Rate",
    transactionsLabel: "Transaksi",
    transactionCount: (n: number) => `${n}x`,
    remainingLabel: "Sisa",

    // Daily stats
    dailySummaryTitle: "Ringkasan Harian",
    avgPerDay: "Avg/hari",
    expenseLower: "pengeluaran",
    incomeLower: "pemasukan",
    savingLower: "tabungan",
    busiestDayLabel: "Hari paling boros",
    activeDaysLabel: "Hari aktif transaksi",
    daysOutOf: (total: number) => `dari ${total} hari`,
    projectionEndOfMonth: "Proyeksi akhir bulan",
    projectionRealized: "Realisasi pengeluaran",

    // DebtSummaryChart
    debtSummary: {
      hutangLabel: "Hutang",
      piutangLabel: "Piutang",
      netPosition: "Posisi Bersih",
      noData: "Belum ada data hutang/piutang",
      overdue: "Terlambat",
      active: "Aktif",
      paid: "Lunas",
    },
  },
  en: {
    // Header
    pageTitle: "Reports",

    // Month navigator
    allTimeToggle: "All",
    allDataLabel: "All Data",

    // Summary cards
    incomeCardLabel: "In",
    expenseCardLabel: "Out",
    summarySavingRateSuffix: (pct: number) => `${pct}% of income`,

    // Cash flow chart empty state
    emptyTitle: "No data yet",
    emptyDescription: "Start recording transactions to see reports",

    // Category donuts
    expenseDistribution: "Expense Distribution",
    incomeDistribution: "Income Distribution",
    savingDistribution: "Saving & Investment Distribution",
    percentOfIncomeBadge: (pct: number) => `${pct}% of income`,
    moreCategories: (n: number) => `+${n} more categories`,

    // Debt summary
    debtSummaryTitle: "Debts & Receivables",

    // Net cash flow
    netCashFlowLabel: "Net Cash Flow",
    financeHealthyAll: "Overall finances are healthy",
    financeHealthyMonth: "This month's finances are healthy",
    financeDeficitWarning: "Expenses exceed income",
    surplusBadge: "✓ Surplus",
    deficitBadge: "✗ Deficit",
    outUsage: (pct: number) => `Out ${pct}%`,
    savingUsage: (pct: number) => `Saving ${pct}%`,
    usedPercent: (pct: number) => `${pct}% used`,
    savingRateLabel: "Saving Rate",
    transactionsLabel: "Transactions",
    transactionCount: (n: number) => `${n}x`,
    remainingLabel: "Remaining",

    // Daily stats
    dailySummaryTitle: "Daily Summary",
    avgPerDay: "Avg/day",
    expenseLower: "expenses",
    incomeLower: "income",
    savingLower: "saving",
    busiestDayLabel: "Highest spending day",
    activeDaysLabel: "Active transaction days",
    daysOutOf: (total: number) => `of ${total} days`,
    projectionEndOfMonth: "End of month projection",
    projectionRealized: "Expense realization",

    // DebtSummaryChart
    debtSummary: {
      hutangLabel: "Debt",
      piutangLabel: "Credit",
      netPosition: "Net Position",
      noData: "No debt/credit data yet",
      overdue: "Overdue",
      active: "Active",
      paid: "Paid",
    },
  },
};
