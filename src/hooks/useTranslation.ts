import { useLanguageStore } from "@/stores/languageStore";
import { getDictionary, type Dictionary } from "@/lib/i18n";

export function useTranslation(): Dictionary {
  const language = useLanguageStore((s) => s.language);
  return getDictionary(language);
}
