'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, X } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import { useTranslation } from '@/hooks/useTranslation'

// BarcodeDetector belum ada di lib.dom.d.ts TypeScript bawaan — deklarasi minimal di sini.
interface BarcodeDetectorResult {
  rawValue: string
}
interface BarcodeDetectorInstance {
  detect(source: CanvasImageSource): Promise<BarcodeDetectorResult[]>
}
type BarcodeDetectorCtor = new (options: { formats: string[] }) => BarcodeDetectorInstance

export function QrScanButton({ onScan }: { onScan: (value: string) => void }) {
  const t = useTranslation()
  const [supported, setSupported] = useState(false)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window)
  }, [])

  async function startScan() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      setScanning(true)
    } catch {
      toast(t.wallets.qr.cameraErrorToast, 'error')
    }
  }

  function stopScan() {
    setScanning(false)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }

  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return
    const video = videoRef.current
    video.srcObject = streamRef.current
    video.play().catch(() => {})

    const DetectorCtor = (window as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector
    const detector = new DetectorCtor({ formats: ['qr_code'] })

    let cancelled = false
    async function tick() {
      if (cancelled || !video) return
      try {
        const results = await detector.detect(video)
        if (results.length > 0) {
          onScan(results[0].rawValue)
          stopScan()
          return
        }
      } catch {
        // frame belum siap / decode gagal — lanjut coba frame berikutnya
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning])

  useEffect(() => () => stopScan(), [])

  if (!supported) return null

  return (
    <>
      <button
        type="button"
        onClick={startScan}
        className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300"
      >
        <QrCode className="w-4 h-4" /> {t.wallets.qr.scanButton}
      </button>

      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
          >
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white/80 rounded-2xl" />
            </div>
            <button
              onClick={stopScan}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <p className="absolute bottom-10 text-white/80 text-sm">{t.wallets.qr.instruction}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
