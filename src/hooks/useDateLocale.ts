import { id as idLocale, enUS } from "date-fns/locale";
import { useLanguageStore } from "@/stores/languageStore";

/** Locale date-fns (untuk dipakai langsung di `format(date, fmt, { locale })`). */
export function useDateLocale() {
  const language = useLanguageStore((s) => s.language);
  return language === "en" ? enUS : idLocale;
}
