import type { Step } from "react-joyride";
import {
  Sparkles,
  Wallet,
  PlusCircle,
  Zap,
  CalendarDays,
  Target,
  CreditCard,
  RefreshCw,
  BarChart2,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { getDictionary, type Language } from "@/lib/i18n";

export interface TourStepConfig extends Step {
  /** Halaman yang harus aktif saat step ini ditampilkan — TourController akan navigasi ke sini dulu kalau perlu. */
  route: string;
  icon: LucideIcon;
}

export function getTourSteps(language: Language): TourStepConfig[] {
  const { tour } = getDictionary(language);

  return [
    {
      route: "/",
      target: "body",
      placement: "center",
      icon: Sparkles,
      title: tour.welcome.title,
      content: tour.welcome.content,
    },
    {
      route: "/",
      target: '[data-tour="wallet-switcher"]',
      icon: Wallet,
      title: tour.walletSwitcher.title,
      content: tour.walletSwitcher.content,
    },
    {
      route: "/",
      target: '[data-tour="quick-add-transaction"]',
      icon: PlusCircle,
      title: tour.quickAdd.title,
      content: tour.quickAdd.content,
    },
    {
      route: "/",
      target: '[data-tour="fab-toggle"]',
      icon: Zap,
      title: tour.fabToggle.title,
      content: tour.fabToggle.content,
    },
    {
      route: "/transactions",
      target: '[data-tour="month-navigator"]',
      icon: CalendarDays,
      title: tour.monthNavigator.title,
      content: tour.monthNavigator.content,
    },
    {
      route: "/goals",
      target: '[data-tour="goal-add-button"]',
      icon: Target,
      title: tour.goalAdd.title,
      content: tour.goalAdd.content,
    },
    {
      route: "/debts",
      target: '[data-tour="debt-tabs"]',
      icon: CreditCard,
      title: tour.debtTabs.title,
      content: tour.debtTabs.content,
    },
    {
      route: "/recurring",
      target: '[data-tour="recurring-info"]',
      icon: RefreshCw,
      title: tour.recurringInfo.title,
      content: tour.recurringInfo.content,
    },
    {
      route: "/reports",
      target: '[data-tour="cashflow-chart"]',
      icon: BarChart2,
      title: tour.cashflowChart.title,
      content: tour.cashflowChart.content,
    },
    {
      route: "/profile",
      target: '[data-tour="manage-wallet-link"]',
      icon: Wallet,
      title: tour.manageWallet.title,
      content: tour.manageWallet.content,
    },
    {
      route: "/profile",
      target: '[data-tour="tour-replay-button"]',
      placement: "top",
      icon: PartyPopper,
      title: tour.tourReplay.title,
      content: tour.tourReplay.content,
    },
  ];
}
