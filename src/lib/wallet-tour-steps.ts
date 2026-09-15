import { Wallet, Layers, Plus, Share2, Users, KeyRound } from "lucide-react";
import { getDictionary, type Language } from "@/lib/i18n";
import type { TourStepConfig } from "@/lib/tour-steps";

export function getWalletTourSteps(
  language: Language,
  isGuest: boolean,
  ownedWalletId: string | null,
): TourStepConfig[] {
  const { walletTour } = getDictionary(language);

  const steps: TourStepConfig[] = [
    {
      route: "/wallets",
      target: "body",
      placement: "center",
      icon: Wallet,
      title: walletTour.welcome.title,
      content: walletTour.welcome.content,
    },
    {
      route: "/wallets",
      target: '[data-tour="wallet-list"]',
      icon: Layers,
      title: walletTour.list.title,
      content: walletTour.list.content,
    },
    {
      route: "/wallets",
      target: '[data-tour="wallet-add-button"]',
      icon: Plus,
      title: walletTour.addButton.title,
      content: walletTour.addButton.content,
    },
  ];

  if (!isGuest && ownedWalletId) {
    steps.push(
      {
        route: "/wallets",
        target: '[data-tour="wallet-manage-access-button"]',
        icon: Share2,
        title: walletTour.manageAccess.title,
        content: walletTour.manageAccess.content,
      },
      {
        route: `/wallets/${ownedWalletId}/kelola-akses`,
        target: '[data-tour="kelola-akses-tabs"]',
        icon: Users,
        title: walletTour.kelolaAksesTabs.title,
        content: walletTour.kelolaAksesTabs.content,
      },
      {
        route: `/wallets/${ownedWalletId}/kelola-akses`,
        target: '[data-tour="kelola-akses-key-section"]',
        icon: KeyRound,
        title: walletTour.kelolaAksesKeySection.title,
        content: walletTour.kelolaAksesKeySection.content,
      },
    );
  }

  return steps;
}
