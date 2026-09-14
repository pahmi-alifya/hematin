export const transactions = {
  id: {
    // Halaman Transaksi — menu lainnya
    moreMenuTooltip: "Menu lainnya",
    moreMenuTitle: "Menu Lainnya",
    recurringTransactions: "Transaksi Rutin",
    manageRecurringDesc: "Kelola template transaksi bulanan",
    exportCSV: "Export CSV",
    noTransactionsToExport: "Tidak ada transaksi untuk diexport",
    exportCount: (n: number) => `Export ${n} transaksi bulan ini`,

    // Search & filter bar
    searchPlaceholder: "Cari transaksi...",
    filterButton: "Filter",

    // Label singkat tipe transaksi (dipakai di filter pill, toggle form, ringkasan stat)
    typeShortAll: "Semua",
    typeShortIncome: "Masuk",
    typeShortExpense: "Keluar",
    typeShortSaving: "Tabungan",

    // Urutan (sort)
    sortNewest: "Terbaru",
    sortOldest: "Terlama",
    sortLargest: "Terbesar",
    sortSmallest: "Terkecil",

    // Form tambah/edit transaksi
    addTransactionSheetTitle: "Catat Transaksi",
    amountFieldLabel: "Nominal",
    merchantLabel: "Nama toko / keterangan",
    merchantPlaceholderIncome: "misal: PT. Maju Jaya",
    merchantPlaceholderSaving: "misal: BCA, Bibit, Pluang",
    merchantPlaceholderExpense: "misal: Indomaret, Warteg Bu Sari",
    repeatMonthly: "Ulangi setiap bulan",
    repeatOnDate: "Ulangi setiap tanggal",
    recurringTemplateNote: "Template akan ditambahkan ke daftar Transaksi Rutin",
    saveTransaction: "Simpan Transaksi",

    // Toast form
    invalidAmountToast: "Masukkan nominal yang valid",
    updatedToast: "Transaksi berhasil diperbarui",
    savedToast: "Transaksi berhasil disimpan",
    saveFailedToast: "Gagal menyimpan transaksi",

    // List & detail transaksi
    deletedToast: "Transaksi dihapus",
    deleteFailedToast: "Gagal menghapus transaksi",
    emptyTitle: "Belum ada transaksi",
    emptyDescMonth: "Belum ada transaksi bulan ini",
    emptyDescAll: "Mulai catat transaksi pertamamu",
    addTransactionCta: "+ Tambah Transaksi",
    detailTitle: "Detail Transaksi",
    typeLabelSaving: "Tabungan / Investasi",
    merchantDetailLabel: "Toko/Keterangan",
    inputMethodLabel: "Cara input",
    scanMethod: "📷 Scan struk",
    manualMethod: "✏️ Manual",
    editTitle: "Edit Transaksi",

    // Filter sheet
    filterSheetTitle: "Filter Transaksi",
    sectionType: "Tipe",
    allCategories: "Semua Kategori",
    sectionSort: "Urutkan",
    resetFilter: "Reset Filter",
  },
  en: {
    // Transactions page — more menu
    moreMenuTooltip: "More options",
    moreMenuTitle: "More Options",
    recurringTransactions: "Recurring Transactions",
    manageRecurringDesc: "Manage monthly recurring templates",
    exportCSV: "Export CSV",
    noTransactionsToExport: "No transactions to export",
    exportCount: (n: number) => `Export ${n} transactions this month`,

    // Search & filter bar
    searchPlaceholder: "Search transactions...",
    filterButton: "Filter",

    // Short type labels (filter pills, form toggle, stat summary)
    typeShortAll: "All",
    typeShortIncome: "In",
    typeShortExpense: "Out",
    typeShortSaving: "Saving",

    // Sort
    sortNewest: "Newest",
    sortOldest: "Oldest",
    sortLargest: "Largest",
    sortSmallest: "Smallest",

    // Add/edit transaction form
    addTransactionSheetTitle: "Record Transaction",
    amountFieldLabel: "Amount",
    merchantLabel: "Store name / description",
    merchantPlaceholderIncome: "e.g. PT. Maju Jaya",
    merchantPlaceholderSaving: "e.g. BCA, Bibit, Pluang",
    merchantPlaceholderExpense: "e.g. Indomaret, Warteg Bu Sari",
    repeatMonthly: "Repeat every month",
    repeatOnDate: "Repeat on date",
    recurringTemplateNote: "A template will be added to the Recurring Transactions list",
    saveTransaction: "Save Transaction",

    // Form toasts
    invalidAmountToast: "Enter a valid amount",
    updatedToast: "Transaction updated successfully",
    savedToast: "Transaction saved successfully",
    saveFailedToast: "Failed to save transaction",

    // Transaction list & detail
    deletedToast: "Transaction deleted",
    deleteFailedToast: "Failed to delete transaction",
    emptyTitle: "No transactions yet",
    emptyDescMonth: "No transactions this month",
    emptyDescAll: "Start recording your first transaction",
    addTransactionCta: "+ Add Transaction",
    detailTitle: "Transaction Detail",
    typeLabelSaving: "Saving / Investment",
    merchantDetailLabel: "Store/Description",
    inputMethodLabel: "Input method",
    scanMethod: "📷 Receipt scan",
    manualMethod: "✏️ Manual",
    editTitle: "Edit Transaction",

    // Filter sheet
    filterSheetTitle: "Filter Transactions",
    sectionType: "Type",
    allCategories: "All Categories",
    sectionSort: "Sort by",
    resetFilter: "Reset Filter",
  },
};
