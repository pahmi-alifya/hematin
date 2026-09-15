export const settings = {
  id: {
    pageTitle: "Pengaturan AI",
    support: {
      title: "Dukung Pengembangan",
      description:
        "HEMATIN gratis selamanya. Jika aplikasi ini membantu keuanganmu, kamu bisa support pengembang lewat Trakteer - secara sukarela 🙏",
      cta: "Support di Trakteer",
    },
    status: {
      active: "AI Aktif",
    },
    provider: {
      title: "Pilih Provider AI",
    },
    apiKey: {
      title: "API Key",
      getKey: "Dapatkan key",
      hint: "Key disimpan hanya di perangkat kamu, tidak dikirim ke server kami.",
      save: "Simpan API Key",
      change: "Ubah",
    },
    model: {
      title: "Pilih Model",
      live: "Live",
      refresh: "Perbarui model",
      loadingModels: "Memuat...",
      loadingList: "Memuat daftar model...",
      save: "Simpan Pengaturan",
    },
    connectionTest: {
      sectionTitle: "Test Koneksi",
      sectionDescription:
        "Pastikan API key dan model yang dipilih bisa terhubung ke provider.",
      button: "Test Koneksi",
      testingButton: "Menguji koneksi...",
      messages: {
        success: "Koneksi berhasil! API key valid dan model aktif.",
        invalidKey: "API key tidak valid atau tidak memiliki akses.",
        rateLimited: "Rate limit tercapai, tapi API key valid.",
        genericError: (status: number) =>
          `Error ${status}: gagal terhubung ke provider.`,
        networkError: "Tidak bisa terhubung. Periksa koneksi internet kamu.",
      },
      status: {
        success: "Koneksi berhasil",
        rateLimited: "Rate limit (key valid)",
        invalidKey: "API key tidak valid",
        error: "Koneksi gagal",
      },
    },
    dangerZone: {
      title: "Hapus Konfigurasi",
      description: "API key akan dihapus dari perangkat ini.",
      button: "Hapus API Key",
    },
    securityNote: {
      label: "Keamanan:",
      text: "API key disimpan secara lokal di perangkat menggunakan IndexedDB dan",
      bold: "tidak pernah dikirim ke server HEMATIN",
      suffix:
        ". Key hanya digunakan untuk komunikasi langsung ke provider AI pilihanmu.",
    },
    createdBy: {
      label: "Dibuat oleh",
    },
    backup: {
      title: "Data & Backup",
      description:
        "Export semua data ke file JSON untuk backup atau pindah perangkat. Import file backup untuk memulihkan data.",
      export: "Export Data",
      import: "Import Data",
      confirmTitle: "Konfirmasi Import",
      recordsFound: (count: number) => `Data ditemukan: ${count} record`,
      transactions: "Transaksi",
      goals: "Goals",
      debts: "Hutang",
      recurring: "Berulang",
      modeLabel: "Mode import",
      modeMerge: "Gabung",
      modeReplace: "Timpa",
      modeMergeHint: "Tambah data baru saja, data lama tetap aman.",
      modeReplaceHint:
        "Hapus semua data lama, ganti dengan data dari file.",
      replaceWarning:
        "Semua data yang ada sekarang akan dihapus permanen dan tidak bisa dikembalikan.",
      confirmReplace: "Timpa Data",
      confirmImport: "Import",
      exportSuccess: "Data berhasil diexport",
      exportError: "Gagal export data",
      invalidFile: "File tidak valid",
      importSuccess: "Data berhasil diimport",
      importError: "Gagal import data",
    },
    toast: {
      enterApiKeyFirst: "Masukkan API key terlebih dahulu",
      modelsFound: (count: number) => `${count} model ditemukan`,
      fetchModelsError: "Gagal mengambil model",
      fetchModelsListError: "Gagal mengambil daftar model",
      invalidKeyFormat: (providerName: string) =>
        `Format API key tidak valid untuk ${providerName}`,
      keySaved: "API key tersimpan, pilih model yang ingin digunakan",
      keySaveError: "Gagal menyimpan API key",
      settingsSaved: "Pengaturan AI berhasil disimpan",
      settingsSaveError: "Gagal menyimpan pengaturan",
      settingsCleared: "Pengaturan AI dihapus",
      settingsClearError: "Gagal menghapus pengaturan",
    },
  },
  en: {
    pageTitle: "AI Settings",
    support: {
      title: "Support Development",
      description:
        "HEMATIN is free forever. If this app helps your finances, you can support the developer via Trakteer - totally optional 🙏",
      cta: "Support on Trakteer",
    },
    status: {
      active: "AI Active",
    },
    provider: {
      title: "Choose AI Provider",
    },
    apiKey: {
      title: "API Key",
      getKey: "Get a key",
      hint: "Your key is stored only on this device and never sent to our servers.",
      save: "Save API Key",
      change: "Change",
    },
    model: {
      title: "Choose Model",
      live: "Live",
      refresh: "Refresh models",
      loadingModels: "Loading...",
      loadingList: "Loading model list...",
      save: "Save Settings",
    },
    connectionTest: {
      sectionTitle: "Test Connection",
      sectionDescription:
        "Make sure your API key and selected model can connect to the provider.",
      button: "Test Connection",
      testingButton: "Testing connection...",
      messages: {
        success: "Connection successful! API key is valid and the model is active.",
        invalidKey: "API key is invalid or does not have access.",
        rateLimited: "Rate limit reached, but the API key is valid.",
        genericError: (status: number) =>
          `Error ${status}: failed to connect to the provider.`,
        networkError: "Could not connect. Check your internet connection.",
      },
      status: {
        success: "Connection successful",
        rateLimited: "Rate limited (key valid)",
        invalidKey: "API key invalid",
        error: "Connection failed",
      },
    },
    dangerZone: {
      title: "Delete Configuration",
      description: "The API key will be removed from this device.",
      button: "Delete API Key",
    },
    securityNote: {
      label: "Security:",
      text: "Your API key is stored locally on this device using IndexedDB and is",
      bold: "never sent to HEMATIN's servers",
      suffix:
        ". The key is only used to communicate directly with your chosen AI provider.",
    },
    createdBy: {
      label: "Created by",
    },
    backup: {
      title: "Data & Backup",
      description:
        "Export all your data to a JSON file for backup or moving devices. Import a backup file to restore your data.",
      export: "Export Data",
      import: "Import Data",
      confirmTitle: "Confirm Import",
      recordsFound: (count: number) => `Data found: ${count} records`,
      transactions: "Transactions",
      goals: "Goals",
      debts: "Debts",
      recurring: "Recurring",
      modeLabel: "Import mode",
      modeMerge: "Merge",
      modeReplace: "Replace",
      modeMergeHint: "Only adds new data, your existing data stays safe.",
      modeReplaceHint:
        "Deletes all existing data and replaces it with the data from the file.",
      replaceWarning:
        "All existing data will be permanently deleted and cannot be recovered.",
      confirmReplace: "Replace Data",
      confirmImport: "Import",
      exportSuccess: "Data exported successfully",
      exportError: "Failed to export data",
      invalidFile: "Invalid file",
      importSuccess: "Data imported successfully",
      importError: "Failed to import data",
    },
    toast: {
      enterApiKeyFirst: "Enter an API key first",
      modelsFound: (count: number) => `${count} models found`,
      fetchModelsError: "Failed to fetch models",
      fetchModelsListError: "Failed to fetch model list",
      invalidKeyFormat: (providerName: string) =>
        `Invalid API key format for ${providerName}`,
      keySaved: "API key saved, choose the model you want to use",
      keySaveError: "Failed to save API key",
      settingsSaved: "AI settings saved successfully",
      settingsSaveError: "Failed to save settings",
      settingsCleared: "AI settings deleted",
      settingsClearError: "Failed to delete settings",
    },
  },
};
