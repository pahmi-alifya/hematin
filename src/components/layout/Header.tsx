import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightElement?: React.ReactNode;
  showSettings?: boolean;
  className?: string;
}

export function Header({
  title,
  showBack,
  backHref = "/",
  rightElement,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-sky-100 dark:border-slate-800 mb-5",
        className,
      )}
    >
      <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-3">
        {showBack && (
          <Link
            href={backHref}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}

        {title && (
          <h1 className="flex-1 text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
            {title}
          </h1>
        )}

        {!title && !showBack && (
          <div className="flex-1 flex items-center gap-1.5">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
              }}
            >
              H
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              HEMATIN
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {rightElement}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
