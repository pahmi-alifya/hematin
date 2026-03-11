/**
 * HEMATIN PWA Icon Generator
 * Pure Node.js — no external dependencies required.
 * Generates: icon-192.png, icon-512.png, icon-maskable-512.png
 *
 * Run: node scripts/generate-icons.mjs
 */

import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons')

// ─── CRC32 ────────────────────────────────────────────────────────────────────
const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[i] = c
}
function crc32(buf) {
  let crc = 0xffffffff
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

// ─── PNG chunk builder ────────────────────────────────────────────────────────
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const tb = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([tb, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([len, tb, data, crcBuf])
}

// ─── PNG encoder (RGB, no alpha) ──────────────────────────────────────────────
function encodePNG(pixels, width, height) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 2   // color type: RGB
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace

  // scanlines: 1 filter byte + RGB per pixel
  const rowLen = 1 + width * 3
  const raw = Buffer.alloc(height * rowLen)
  for (let y = 0; y < height; y++) {
    raw[y * rowLen] = 0 // filter: None
    for (let x = 0; x < width; x++) {
      const pi = (y * width + x) * 3
      const ri = y * rowLen + 1 + x * 3
      raw[ri]     = pixels[pi]
      raw[ri + 1] = pixels[pi + 1]
      raw[ri + 2] = pixels[pi + 2]
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 })

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ─── Drawing primitives ───────────────────────────────────────────────────────
function lerp(a, b, t) { return Math.round(a + (b - a) * t) }

/** Draw into a flat RGB pixel array */
function drawIcon(size, maskable = false) {
  // Sky blue gradient: top-left #0EA5E9 → bottom-right #0284C7
  const BG1 = [14, 165, 233]
  const BG2 = [2, 132, 199]
  const WHITE = [255, 255, 255]

  const pixels = new Uint8Array(size * size * 3)

  // Corner radius for the rounded square
  const radius = maskable ? 0 : Math.round(size * 0.22)

  function inRoundedRect(x, y, r) {
    const cx = Math.min(Math.max(x, r), size - 1 - r)
    const cy = Math.min(Math.max(y, r), size - 1 - r)
    const dx = x - cx
    const dy = y - cy
    return dx * dx + dy * dy <= r * r
  }

  // H letter proportions (relative to size)
  const pad     = Math.round(size * 0.20)   // outer padding
  const stroke  = Math.round(size * 0.17)   // bar width
  const crossY1 = Math.round(size * 0.42)   // cross bar top
  const crossY2 = Math.round(size * 0.58)   // cross bar bottom
  const hTop    = pad
  const hBot    = size - pad
  const lx1     = pad                        // left bar left
  const lx2     = pad + stroke               // left bar right
  const rx1     = size - pad - stroke        // right bar left
  const rx2     = size - pad                 // right bar right

  function inH(x, y) {
    const inLeft  = x >= lx1 && x < lx2 && y >= hTop && y < hBot
    const inRight = x >= rx1 && x < rx2 && y >= hTop && y < hBot
    const inCross = x >= lx1 && x < rx2 && y >= crossY1 && y < crossY2
    return inLeft || inRight || inCross
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 3
      const inBg = maskable ? true : inRoundedRect(x, y, radius)

      if (!inBg) {
        // transparent → sky-50 (#F0F9FF) as background
        pixels[idx]     = 240
        pixels[idx + 1] = 249
        pixels[idx + 2] = 255
        continue
      }

      // Gradient diagonal
      const t = (x + y) / (size * 2)
      const bg = [lerp(BG1[0], BG2[0], t), lerp(BG1[1], BG2[1], t), lerp(BG1[2], BG2[2], t)]

      const color = inH(x, y) ? WHITE : bg
      pixels[idx]     = color[0]
      pixels[idx + 1] = color[1]
      pixels[idx + 2] = color[2]
    }
  }
  return pixels
}

// ─── Generate ─────────────────────────────────────────────────────────────────
const icons = [
  { file: 'icon-192.png',         size: 192, maskable: false },
  { file: 'icon-512.png',         size: 512, maskable: false },
  { file: 'icon-maskable-512.png', size: 512, maskable: true  },
]

console.log('Generating HEMATIN PWA icons...\n')

for (const { file, size, maskable } of icons) {
  const pixels = drawIcon(size, maskable)
  const png    = encodePNG(pixels, size, size)
  const dest   = path.join(ICONS_DIR, file)
  fs.writeFileSync(dest, png)
  console.log(`  ✅ ${file} (${size}×${size}${maskable ? ', maskable' : ''}) — ${(png.length / 1024).toFixed(1)} KB`)
}

console.log('\nDone! Icons saved to public/icons/')
