"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OwnerSelect } from "@/components/wallet/OwnerSelect";
import { useAccountDeletion } from "@/hooks/useAccountDeletion";
import { useTranslation } from "@/hooks/useTranslation";

export function DangerZoneSection() {
  const t = useTranslation();
  const {
    step,
    sharedOwnedWallets,
    selections,
    confirmText,
    setConfirmText,
    deleting,
    canConfirm,
    open,
    close,
    selectOwner,
    proceedFromTransfer,
    confirmDelete,
  } = useAccountDeletion();

  return (
    <>
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            {t.account.dangerZone.title}
          </p>
        </div>
        <button
          type="button"
          onClick={open}
          disabled={step === "checking"}
          className="w-full flex items-center gap-3 rounded-xl border border-red-100 dark:border-red-900/40 p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
        >
          <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 shrink-0">
            <Trash2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              {t.account.dangerZone.deleteAccountButton}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t.account.dangerZone.deleteAccountSubtitle}
            </p>
          </div>
        </button>
      </div>

      {/* Sheet: Transfer Kepemilikan */}
      <BottomSheet
        open={step === "transfer"}
        onClose={close}
        title={t.account.transferSheet.title}
      >
        <div className="px-5 pb-8 pt-1 space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.account.transferSheet.intro}
          </p>

          <div className="space-y-4">
            {sharedOwnedWallets.map(({ wallet, members }) => (
              <div key={wallet.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: `${wallet.color}22` }}
                  >
                    {wallet.icon}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {wallet.name}
                  </p>
                </div>
                <OwnerSelect
                  placeholder={t.account.transferSheet.selectPlaceholder}
                  value={selections[wallet.id]}
                  onChange={(newOwnerId) => selectOwner(wallet.id, newOwnerId)}
                  options={members.map((m) => ({
                    id: m.user_id,
                    label: m.profiles?.name ?? "-",
                    roleLabel:
                      m.role === "editor"
                        ? t.account.transferSheet.roleEditor
                        : t.account.transferSheet.roleViewer,
                  }))}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" fullWidth onClick={close}>
              {t.account.transferSheet.cancelButton}
            </Button>
            <Button variant="primary" fullWidth onClick={proceedFromTransfer}>
              {t.account.transferSheet.continueButton}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Sheet: Konfirmasi Hapus Akun */}
      <BottomSheet
        open={step === "confirm"}
        onClose={close}
        title={t.account.confirmSheet.title}
      >
        <div className="px-5 pb-8 pt-1 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl p-3">
            {t.account.confirmSheet.warning}
          </p>

          <Input
            label={t.account.confirmSheet.inputLabel}
            placeholder={t.account.confirmSheet.inputPlaceholder}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoFocus
          />

          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={close}
              disabled={deleting}
            >
              {t.account.confirmSheet.cancelButton}
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={confirmDelete}
              disabled={!canConfirm}
              loading={deleting}
            >
              {deleting
                ? t.account.confirmSheet.deletingButton
                : t.account.confirmSheet.confirmButton}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
