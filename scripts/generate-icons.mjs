import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'public', 'icons', 'source-icon.png')

const BG = { r: 9, g: 9, b: 11, alpha: 1 } // #09090b

const icons = [
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'maskable-icon.png',    size: 512 },
]

for (const icon of icons) {
  const logo = await sharp(src).resize(icon.size, icon.size, { fit: 'fill' }).png().toBuffer()
  await sharp({ create: { width: icon.size, height: icon.size, channels: 4, background: BG } })
    .composite([{ input: logo }])
    .png()
    .toFile(join(root, 'public', 'icons', icon.name))
  console.log(`✓ ${icon.name} (${icon.size}×${icon.size})`)
}

// Aussi copier en icon.svg remplacé par PNG dans Logo.tsx
console.log('\n✅ Toutes les icônes générées dans public/icons/')
