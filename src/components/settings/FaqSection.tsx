"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = useTranslation();
  const faqItems = t.faq.items;

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-sky-100 dark:border-slate-700/60 p-4">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className="w-4 h-4 text-sky-500" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t.faq.title}
        </p>
      </div>

      <div className="space-y-2">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className="rounded-xl border border-slate-100 dark:border-slate-700/60 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-3 text-left bg-slate-50 dark:bg-slate-800"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-slate-400 dark:text-slate-500"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-3.5 py-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
