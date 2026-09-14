export const dashboard = {
  id: {
    // Cash flow status chip
    cashFlowSafe: "Aman",
    cashFlowCareful: "Perlu Hati-hati",
    cashFlowWarning: "Waspada",

    // Hero / summary
    totalBalance: "Total Saldo",
    thisMonthSuffix: "Bulan ini",
    incomeShort: "Masuk",
    expenseShort: "Keluar",

    // Quick actions
    recordTransaction: "Catat Transaksi",
    scanReceipt: "Scan Struk",
    thisMonthTransactions: "Transaksi Bulan Ini",
    topExpensesThisMonth: "Top Pengeluaran Bulan Ini",

    // AI Insight card
    insightLoadError: "Gagal memuat insight",
    enableAiInsight: "Aktifkan AI Insight",
    connectApiKeySubtitle: "Hubungkan API key untuk analisis keuangan harian",
    setup: "Setup",
    hematinSays: "HEMATIN bilang:",
    refreshInsight: "Segarkan insight",
    readMore: "Baca Selengkapnya",
    dailyInsightTitle: "AI Insight Harian",

    // Debt reminder banner
    debtReminder: "Pengingat Hutang",
    alreadyOverdue: "Sudah jatuh tempo",
    overdueDaysAgo: (n: number) => `${n} hari lalu`,
    dueToday: "Hari ini!",
    dueTomorrow: "Besok",
    dueInDays: (n: number) => `${n} hari lagi`,
    debtTo: (person: string) => `Hutang ke ${person}`,

    // Recurring reminder banner
    recurringTodayCount: (n: number) => `${n} transaksi rutin hari ini`,
    andMore: (n: number) => `+${n} lainnya`,
    recurringRecordedSuccess: (n: number) =>
      `${n} transaksi rutin berhasil dicatat`,
    recurringRecordError: "Gagal mencatat transaksi rutin",
    recording: "Mencatat...",
    recordNow: "Catat Sekarang",
    later: "Nanti",

    // Goal alert banner
    limitExceeded: "Batas Terlampaui",
    manage: "Kelola",
    categoryFallback: "Kategori",
    overLimitBy: (formattedAmount: string) => `Lebih ${formattedAmount} dari limit`,
    limitLabel: "limit",

    // Monthly chart
    noTransactionsThisMonth: "Belum ada transaksi bulan ini",
    balanceLabel: "Saldo",

    // Net worth chart
    runningBalance: "Saldo Berjalan",
    total: "Total",

    // Category spending chart
    noExpensesThisMonth: "Belum ada pengeluaran bulan ini",

    // Mini chart
    last7Days: "7 Hari Terakhir",
    incomeToday: "Masuk hari ini",
    expenseToday: "Keluar hari ini",
    sevenDaysShort: "7 hari",
  },
  en: {
    // Cash flow status chip
    cashFlowSafe: "Safe",
    cashFlowCareful: "Be Careful",
    cashFlowWarning: "Caution",

    // Hero / summary
    totalBalance: "Total Balance",
    thisMonthSuffix: "This month",
    incomeShort: "In",
    expenseShort: "Out",

    // Quick actions
    recordTransaction: "Record Transaction",
    scanReceipt: "Scan Receipt",
    thisMonthTransactions: "This Month's Transactions",
    topExpensesThisMonth: "Top Expenses This Month",

    // AI Insight card
    insightLoadError: "Failed to load insight",
    enableAiInsight: "Enable AI Insight",
    connectApiKeySubtitle: "Connect an API key for daily financial analysis",
    setup: "Setup",
    hematinSays: "HEMATIN says:",
    refreshInsight: "Refresh insight",
    readMore: "Read More",
    dailyInsightTitle: "Daily AI Insight",

    // Debt reminder banner
    debtReminder: "Debt Reminders",
    alreadyOverdue: "Already overdue",
    overdueDaysAgo: (n: number) => `${n} days ago`,
    dueToday: "Due today!",
    dueTomorrow: "Tomorrow",
    dueInDays: (n: number) => `in ${n} days`,
    debtTo: (person: string) => `Debt to ${person}`,

    // Recurring reminder banner
    recurringTodayCount: (n: number) => `${n} recurring transactions today`,
    andMore: (n: number) => `+${n} more`,
    recurringRecordedSuccess: (n: number) =>
      `${n} recurring transactions recorded successfully`,
    recurringRecordError: "Failed to record recurring transactions",
    recording: "Recording...",
    recordNow: "Record Now",
    later: "Later",

    // Goal alert banner
    limitExceeded: "Limit Exceeded",
    manage: "Manage",
    categoryFallback: "Category",
    overLimitBy: (formattedAmount: string) => `${formattedAmount} over limit`,
    limitLabel: "limit",

    // Monthly chart
    noTransactionsThisMonth: "No transactions this month yet",
    balanceLabel: "Balance",

    // Net worth chart
    runningBalance: "Running Balance",
    total: "Total",

    // Category spending chart
    noExpensesThisMonth: "No expenses this month yet",

    // Mini chart
    last7Days: "Last 7 Days",
    incomeToday: "Income today",
    expenseToday: "Expense today",
    sevenDaysShort: "7 days",
  },
};
