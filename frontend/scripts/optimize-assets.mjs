#!/usr/bin/env node
/**
 * Optimizuje static asset slike u src/assets/images/.
 *
 * Trenutno radi:
 *  - logo.png:     resize na max 512x512, optimizovan PNG (transparency zadržana)
 *  - furniture.png: resize na max 1920x1080, konvertovan u JPEG q=80 (mozjpeg)
 *
 * Pokreni iz frontend/ direktorija:
 *   npm run optimize:assets
 *
 * Sharp je u devDependencies — neće biti u production bundlu.
 */
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'src', 'assets', 'images');

const tasks = [
  {
    label: 'logo.png   → logo.png   (512x512 PNG, palette+compression)',
    input: 'logo.png',
    output: 'logo.png',
    process: (img) =>
      img
        .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true, quality: 90 }),
  },
  {
    label: 'furniture.png → furniture.jpg (1920x1080 JPEG q=80 mozjpeg)',
    input: 'furniture.png',
    output: 'furniture.jpg',
    process: (img) =>
      img
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true }),
    deleteOriginal: true,
  },
];

console.log('\nOptimizacija slika u', assetsDir, '\n');

let totalBefore = 0;
let totalAfter = 0;

for (const task of tasks) {
  const inputPath = path.join(assetsDir, task.input);
  const outputPath = path.join(assetsDir, task.output);

  try {
    const before = (await fs.stat(inputPath)).size;
    totalBefore += before;

    // Buffer-based da se može pisati nazad u isti fajl
    const buf = await fs.readFile(inputPath);
    const result = await task.process(sharp(buf)).toBuffer();
    await fs.writeFile(outputPath, result);

    // Obriši original ako mu se mijenja extenzija
    if (task.deleteOriginal && task.input !== task.output) {
      await fs.unlink(inputPath).catch(() => {});
    }

    const after = (await fs.stat(outputPath)).size;
    totalAfter += after;
    const ratio = ((1 - after / before) * 100).toFixed(1);
    console.log(`  ✓ ${task.label}`);
    console.log(`    ${formatKB(before)} → ${formatKB(after)}  (-${ratio}%)\n`);
  } catch (err) {
    console.error(`  ✗ ${task.label}\n    ${err.message}\n`);
  }
}

if (totalBefore > 0) {
  const totalRatio = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
  console.log(`Ukupno: ${formatKB(totalBefore)} → ${formatKB(totalAfter)}  (-${totalRatio}%)\n`);
}

function formatKB(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
