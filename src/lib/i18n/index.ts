import { common } from "./dictionaries/common";
import { nav } from "./dictionaries/nav";
import { dashboard } from "./dictionaries/dashboard";
import { profile } from "./dictionaries/profile";
import { faq } from "./dictionaries/faq";
import { tour } from "./dictionaries/tour";
import { walletTour } from "./dictionaries/walletTour";
import { settings } from "./dictionaries/settings";
import { goals } from "./dictionaries/goals";
import { recurring } from "./dictionaries/recurring";
import { transactions } from "./dictionaries/transactions";
import { debts } from "./dictionaries/debts";
import { reports } from "./dictionaries/reports";
import { scan } from "./dictionaries/scan";
import { wallets } from "./dictionaries/wallets";
import { auth } from "./dictionaries/auth";
import { account } from "./dictionaries/account";
import type { Language } from "@/stores/languageStore";

export const dictionaries = {
  id: {
    common: common.id,
    nav: nav.id,
    dashboard: dashboard.id,
    profile: profile.id,
    faq: faq.id,
    tour: tour.id,
    walletTour: walletTour.id,
    settings: settings.id,
    goals: goals.id,
    recurring: recurring.id,
    transactions: transactions.id,
    debts: debts.id,
    reports: reports.id,
    scan: scan.id,
    wallets: wallets.id,
    auth: auth.id,
    account: account.id,
  },
  en: {
    common: common.en,
    nav: nav.en,
    dashboard: dashboard.en,
    profile: profile.en,
    faq: faq.en,
    tour: tour.en,
    walletTour: walletTour.en,
    settings: settings.en,
    goals: goals.en,
    recurring: recurring.en,
    transactions: transactions.en,
    debts: debts.en,
    reports: reports.en,
    scan: scan.en,
    wallets: wallets.en,
    auth: auth.en,
    account: account.en,
  },
};

/**
 * Widens literal return/value types (e.g. ternaries of plain string literals infer as
 * `"a" | "b"` instead of `string`) so the `id` and `en` dictionary branches - which contain
 * the same shape but different literal content - unify into one `Dictionary` type instead of
 * being flagged as structurally incompatible.
 */
type Widen<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => Widen<R>
  : T extends string
  ? string
  : T extends number
  ? number
  : T extends readonly (infer U)[]
  ? readonly Widen<U>[]
  : T extends object
  ? { [K in keyof T]: Widen<T[K]> }
  : T;

export type Dictionary = Widen<(typeof dictionaries)["id"]>;
export type { Language };

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language] as Dictionary;
}
