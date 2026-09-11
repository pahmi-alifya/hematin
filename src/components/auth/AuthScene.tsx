'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { Sparkles, Target } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

interface FloatCardProps {
  className?: string
  depth?: number // seberapa jauh card ikut geser saat pointer bergerak (parallax)
  floatDuration?: number
  floatDelay?: number
  rotate?: number
  pointerX: MotionValue<number>
  reducedMotion: boolean
  children: React.ReactNode
}

function FloatCard({ className, depth = 10, floatDuration = 6, floatDelay = 0, rotate = 0, pointerX, reducedMotion, children }: FloatCardProps) {
  const x = useTransform(pointerX, (v) => v * depth)

  return (
    <motion.div
      className={cn(
        'absolute rounded-2xl border border-white/25 bg-white/15 backdrop-blur-xl shadow-2xl shadow-sky-900/20',
        className,
      )}
      style={{ rotate, x: reducedMotion ? 0 : x }}
      animate={reducedMotion ? undefined : { y: [0, -14, 0] }}
      transition={reducedMotion ? undefined : { duration: floatDuration, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Background dekoratif halaman login/register — pakai gradient hero HEMATIN yang sama
 * dengan Dashboard (bukan dark navy generik), dan card mengambang yang menonjolkan fitur
 * pembeda HEMATIN (AI Insight, Goals) bukan sekadar "transaksi generik ala fintech apapun".
 * Estetika fixed (tidak ikut light/dark toggle) — identitas visual tersendiri untuk auth.
 *
 * Parallax pointer pakai motion value (bukan React state) supaya update posisi mouse
 * TIDAK memicu re-render — kalau lewat state, re-render akan bentrok dengan animasi
 * float loop (`animate` di-diff ulang tiap gerakan mouse, bikin loop-nya kepotong/restart).
 */
export function AuthScene() {
  const reducedMotion = usePrefersReducedMotion()
  const pointerXRaw = useMotionValue(0)
  const pointerX = useSpring(pointerXRaw, { stiffness: 60, damping: 20 })

  useEffect(() => {
    if (reducedMotion) return
    function handlePointerMove(e: PointerEvent) {
      pointerXRaw.set((e.clientX / window.innerWidth) * 2 - 1)
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [reducedMotion, pointerXRaw])

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #075985 0%, #0284C7 45%, #38BDF8 100%)' }}
    >
      {/* Soft glow — aksen terang, senada gradient, bukan warna asing */}
      <div
        className="absolute -top-20 -left-16 w-80 h-80 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #E0F2FE, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 -right-20 w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #7DD3FC, transparent 70%)' }}
      />

      {/* Dot grid — putih tipis di atas gradient */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* AI Insight — fitur pembeda utama HEMATIN */}
      <FloatCard
        className="right-[10%] top-[16%] w-60 p-4"
        depth={12}
        floatDuration={7}
        rotate={3}
        pointerX={pointerX}
        reducedMotion={reducedMotion}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wide">Insight Hari Ini</span>
        </div>
        <p className="text-sm text-white leading-snug">
          Pengeluaran makan di luar naik <span className="font-bold">18%</span> minggu ini — mau atur ulang batasnya?
        </p>
      </FloatCard>

      {/* Goals — fitur limit per kategori, persisten */}
      <FloatCard
        className="left-[9%] top-[46%] w-52 p-4"
        depth={-10}
        floatDuration={6.5}
        floatDelay={0.5}
        rotate={-3}
        pointerX={pointerX}
        reducedMotion={reducedMotion}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Target className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-white">Target Menabung</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/20 overflow-hidden mb-1.5">
          <div className="h-full w-[68%] rounded-full bg-white" />
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-white/70">Rp 3,4jt</span>
          <span className="text-white font-semibold">68%</span>
        </div>
      </FloatCard>

      {/* Transaksi terbaru — konteks pemakaian sehari-hari */}
      <FloatCard
        className="right-[14%] bottom-[14%] w-48 p-3.5"
        depth={8}
        floatDuration={8}
        floatDelay={1.1}
        rotate={2}
        pointerX={pointerX}
        reducedMotion={reducedMotion}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-white/90">🍜 Makan Siang</span>
          <span className="text-xs font-bold text-white">-Rp 25rb</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/90">🏦 Nabung Otomatis</span>
          <span className="text-xs font-bold text-white">-Rp 100rb</span>
        </div>
      </FloatCard>
    </div>
  )
}
