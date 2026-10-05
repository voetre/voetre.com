#!/usr/bin/env node
/**
 * Scans gallery/files/ and writes gallery/manifest.json.
 *
 * Run this after adding or removing photos:
 *   node tools/generate-manifest.mjs
 *
 * Replicates the ordering of the original Free PHP Gallery app:
 *   - categories sorted by name, ascending (ksort)
 *   - photos within a category sorted by mtime, newest first (krsort)
 *
 * Naming convention produced by that app:
 *   <name>.jpg          original
 *   <name>_small.jpg    ~1200x650 display size
 *   <name>_thumb.jpg    cropped thumbnail
 *   thumbnail.jpg       the category's cover image
 */

import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const filesDir = join(root, 'gallery', 'files');
const outFile = join(root, 'gallery', 'manifest.json');

// Category and file names contain spaces, which must be percent-encoded in URLs.
const enc = encodeURIComponent;

const isDerived = (name) =>
  name === 'thumbnail.jpg' || name.endsWith('_thumb.jpg') || name.endsWith('_small.jpg');

const categories = [];
const warnings = [];

for (const dirName of readdirSync(filesDir).sort()) {
  const dir = join(filesDir, dirName);
  let entries;
  try {
    if (!statSync(dir).isDirectory()) continue;
    entries = readdirSync(dir);
  } catch {
    continue;
  }

  // Collect originals keyed by mtime so we can reproduce the PHP sort order.
  const photos = [];
  for (const file of entries) {
    if (isDerived(file) || !/\.(jpe?g|png|gif)$/i.test(file)) continue;
    const base = file.replace(/\.[^.]+$/, '');
    let mtime = 0;
    try {
      mtime = statSync(join(dir, file)).mtimeMs;
    } catch {
      /* unreadable file, sort it last */
    }
    photos.push({ base, file, mtime });
  }

  photos.sort((a, b) => b.mtime - a.mtime || a.base.localeCompare(b.base));

  const items = photos.map(({ base, file }) => {
    const small = `${base}_small.jpg`;
    const thumb = `${base}_thumb.jpg`;

    if (!existsSync(join(dir, thumb))) warnings.push(`${dirName}/${base}: no _thumb.jpg, falling back to _small`);
    if (!existsSync(join(dir, small))) warnings.push(`${dirName}/${base}: no _small.jpg, falling back to original`);

    return {
      name: base.replace(/-/g, ' '),
      full: `files/${enc(dirName)}/${enc(file)}`,
      display: existsSync(join(dir, small)) ? `files/${enc(dirName)}/${enc(small)}` : `files/${enc(dirName)}/${enc(file)}`,
      thumb: existsSync(join(dir, thumb))
        ? `files/${enc(dirName)}/${enc(thumb)}`
        : existsSync(join(dir, small))
          ? `files/${enc(dirName)}/${enc(small)}`
          : `files/${enc(dirName)}/${enc(file)}`,
    };
  });

  if (items.length === 0) {
    warnings.push(`${dirName}: no photos, skipped`);
    continue;
  }

  const cover = `files/${enc(dirName)}/thumbnail.jpg`;
  categories.push({
    name: dirName,
    title: dirName.replace(/-/g, ' '),
    count: items.length,
    cover: existsSync(join(dir, 'thumbnail.jpg')) ? cover : items[0].thumb,
    photos: items,
  });
}

const manifest = {
  generated: new Date().toISOString(),
  categories,
};

writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n');

const total = categories.reduce((n, c) => n + c.count, 0);
console.log(`Wrote ${outFile}`);
console.log(`${categories.length} categories, ${total} photos`);
for (const c of categories) console.log(`  ${c.title} (${c.count})`);
if (warnings.length) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log(`  ! ${w}`);
}
