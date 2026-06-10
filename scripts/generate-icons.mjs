import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const src = join(root, 'public', 'icons', 'source-icon.png')

const icons = [
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const icon of icons) {
  await sharp(src)
    .resize(icon.size, icon.size)
    .png()
    .toFile(join(root, 'public', 'icons', icon.name))
  console.log(`✓ ${icon.name} (${icon.size}×${icon.size})`)
}

// Maskable : fond #0c0c1e + logo centré à 80%
const inner = Math.round(512 * 0.8)
const pad   = Math.round(512 * 0.1)
const resized = await sharp(src).resize(inner, inner).png().toBuffer()
await sharp(resized)
  .extend({ top: pad, bottom: pad, left: pad, right: pad,
            background: { r: 12, g: 12, b: 30, alpha: 1 } })
  .png()
  .toFile(join(root, 'public', 'icons', 'maskable-icon.png'))
console.log('✓ maskable-icon.png (512×512)')

// Aussi copier en icon.svg remplacé par PNG dans Logo.tsx
console.log('\n✅ Toutes les icônes générées dans public/icons/')
