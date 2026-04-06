'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, SAVING_CATEGORIES } from '@/lib/categories'
import type { Category } from '@/types'

interface CategoryPickerProps {
  type: 'income' | 'expense' | 'saving'
  selected: string
  onSelect: (categoryId: string) => void
}

export function CategoryPicker({ type, selected, onSelect }: CategoryPickerProps) {
  const categories: Category[] =
    type === 'income' ? INCOME_CATEGORIES :
    type === 'saving' ? SAVING_CATEGORIES :
    EXPENSE_CATEGORIES

  return (
    <div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Kategori</p>
      <div className="grid grid-cols-4 gap-2">
        {categories.map((cat) => {
          const isSelected = selected === cat.id
          return (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => onSelect(cat.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border-2 transition-all duration-150',
                isSelected
                  ? 'border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-900/40'
                  : 'border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
              )}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: cat.bgColor }}
              >
                {cat.icon}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-tight text-center',
                  isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {cat.name}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
