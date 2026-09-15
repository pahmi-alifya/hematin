export const scan = {
  id: {
    pageTitle: "Scan Struk",
    receiptAlt: "Struk",

    // Restricted access (viewer role)
    restrictedTitle: "Akses Terbatas",
    restrictedDescription:
      "Kamu hanya bisa melihat dompet ini (viewer) - tidak bisa menambah transaksi lewat scan struk.",

    // AI not configured banner
    aiNotActiveTitle: "AI Belum Aktif",
    aiNotActiveDescription: "Buka Pengaturan dan hubungkan API key untuk menggunakan fitur ini.",

    // Upload area
    uploadTitle: "Foto atau Upload Struk",
    uploadDescription: "AI akan membaca detail transaksi secara otomatis",
    cameraButton: "Kamera",
    uploadButton: "Upload",

    // Scanning state
    scanningText: "Membaca struk...",

    // Result
    scanSuccessText: "Struk berhasil dibaca",
    confidenceHigh: "Akurat",
    confidenceMedium: "Cukup akurat",
    confidenceLow: "Perlu cek ulang",
    fieldMerchant: "Merchant",
    fieldTotal: "Total",
    retryButton: "Ulangi",
    saveTransactionButton: "Simpan Transaksi",

    // Error state
    scanErrorText: "Gagal membaca struk. Coba foto yang lebih jelas.",
    tryAgainButton: "Coba Lagi",

    // Tips
    tipsTitle: "Tips foto struk yang baik:",
    tips: [
      "Pastikan pencahayaan cukup",
      "Foto seluruh struk, termasuk total",
      "Hindari bayangan atau lipatan",
      "Foto tegak lurus, tidak miring",
    ],

    // Toasts / validation
    successToast: "Transaksi berhasil disimpan",
    errorNotImage: "File harus berupa gambar",
    errorAIRequired: "Aktifkan AI di Pengaturan terlebih dahulu",
    errorScanFailed: "Scan gagal",
  },
  en: {
    pageTitle: "Scan Receipt",
    receiptAlt: "Receipt",

    // Restricted access (viewer role)
    restrictedTitle: "Restricted Access",
    restrictedDescription:
      "You can only view this wallet (viewer) - you can't add transactions via receipt scan.",

    // AI not configured banner
    aiNotActiveTitle: "AI Not Active",
    aiNotActiveDescription: "Open Settings and connect an API key to use this feature.",

    // Upload area
    uploadTitle: "Photo or Upload Receipt",
    uploadDescription: "AI will automatically read the transaction details",
    cameraButton: "Camera",
    uploadButton: "Upload",

    // Scanning state
    scanningText: "Reading receipt...",

    // Result
    scanSuccessText: "Receipt read successfully",
    confidenceHigh: "Accurate",
    confidenceMedium: "Fairly accurate",
    confidenceLow: "Needs review",
    fieldMerchant: "Merchant",
    fieldTotal: "Total",
    retryButton: "Retry",
    saveTransactionButton: "Save Transaction",

    // Error state
    scanErrorText: "Failed to read receipt. Try a clearer photo.",
    tryAgainButton: "Try Again",

    // Tips
    tipsTitle: "Tips for a good receipt photo:",
    tips: [
      "Make sure there's enough light",
      "Capture the whole receipt, including the total",
      "Avoid shadows or folds",
      "Keep the photo straight, not tilted",
    ],

    // Toasts / validation
    successToast: "Transaction saved successfully",
    errorNotImage: "File must be an image",
    errorAIRequired: "Activate AI in Settings first",
    errorScanFailed: "Scan failed",
  },
};
