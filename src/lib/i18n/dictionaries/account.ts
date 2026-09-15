export const account = {
  id: {
    dangerZone: {
      title: "Zona Berbahaya",
      deleteAccountButton: "Hapus Akun",
      deleteAccountSubtitle: "Hapus akun secara permanen",
    },
    transferSheet: {
      title: "Transfer Kepemilikan Dompet",
      intro:
        "Dompet berikut kamu bagikan ke orang lain. Pilih siapa yang akan jadi pemilik baru sebelum akun ini dihapus — dompet & datanya tidak akan hilang, cuma pindah kepemilikan.",
      selectPlaceholder: "Pilih pemilik baru...",
      roleEditor: "Editor",
      roleViewer: "Viewer",
      continueButton: "Lanjut",
      cancelButton: "Batal",
      incompleteToast: "Pilih pemilik baru untuk semua dompet yang terdaftar",
    },
    confirmSheet: {
      title: "Konfirmasi Hapus Akun",
      warning:
        "Akun & semua dompet cloud yang tidak ditransfer akan hilang permanen dan tidak bisa dikembalikan. Data di perangkat ini tetap ada — kamu akan jadi pengguna Guest lagi.",
      confirmPhrase: "HAPUS AKUN",
      inputLabel: 'Ketik "HAPUS AKUN" untuk konfirmasi',
      inputPlaceholder: "HAPUS AKUN",
      cancelButton: "Batal",
      confirmButton: "Hapus Akun Permanen",
      deletingButton: "Menghapus...",
    },
    toast: {
      success: "Akun berhasil dihapus. Sampai jumpa!",
      genericError: "Gagal menghapus akun, coba lagi",
      loadMembersError: "Gagal memuat data anggota dompet",
    },
  },
  en: {
    dangerZone: {
      title: "Danger Zone",
      deleteAccountButton: "Delete Account",
      deleteAccountSubtitle: "Permanently delete your account",
    },
    transferSheet: {
      title: "Transfer Wallet Ownership",
      intro:
        "You've shared the wallets below with others. Choose who becomes the new owner before this account is deleted — the wallet and its data won't be lost, only the ownership changes.",
      selectPlaceholder: "Choose a new owner...",
      roleEditor: "Editor",
      roleViewer: "Viewer",
      continueButton: "Continue",
      cancelButton: "Cancel",
      incompleteToast: "Choose a new owner for every listed wallet",
    },
    confirmSheet: {
      title: "Confirm Account Deletion",
      warning:
        "Your account and any cloud wallets that weren't transferred will be permanently and irreversibly deleted. Data on this device stays put — you'll become a Guest user again.",
      confirmPhrase: "DELETE ACCOUNT",
      inputLabel: 'Type "DELETE ACCOUNT" to confirm',
      inputPlaceholder: "DELETE ACCOUNT",
      cancelButton: "Cancel",
      confirmButton: "Permanently Delete Account",
      deletingButton: "Deleting...",
    },
    toast: {
      success: "Account deleted successfully. Goodbye!",
      genericError: "Failed to delete account, please try again",
      loadMembersError: "Failed to load wallet member data",
    },
  },
};
