# Deploying

This folder is a self-contained static build of **voetre.com**, ready for
GitHub Pages. The original site lived on a cPanel host with PHP; nothing here
needs a server beyond static file hosting.

## Publish

```bash
cd voetre-gh
git init
git add -A
git commit -m "Static rebuild for GitHub Pages"
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: Deploy from a branch →
`main` / `/ (root)`**.

The site will be at `https://<you>.github.io/<repo>/`. All paths in the HTML
are relative, so it works unchanged at a domain root or a sub-path.

## What's here

```
index.html            main page
style.css             main page styles
script.js             video cycling, sound, draggable windows
UI/  images/  sounds/  videos/
gallery/              static replacement for the PHP gallery
  index.html
  gallery.js          hash router + lightbox
  manifest.json       generated photo index — do not hand-edit
  style.css
  files/              photos (original / _small / _thumb)
  layout/             button + overlay sprites
tools/
  generate-manifest.mjs
.nojekyll             tells Pages to skip Jekyll (it would drop _notes dirs)
```

## Adding photos

The gallery has **no upload UI** — GitHub Pages is read-only. To add photos,
copy them into a folder under `gallery/files/<Category>/` using the original
naming convention, then regenerate the manifest:

```
gallery/files/Kyushu/temple.jpg           original
gallery/files/Kyushu/temple_small.jpg     ~1200px display size
gallery/files/Kyushu/temple_thumb.jpg     thumbnail
gallery/files/Kyushu/thumbnail.jpg        the category cover
```

Then:

```bash
node tools/generate-manifest.mjs
```

It sorts categories by name and photos newest-first (by file mtime), matching
the old PHP gallery. If a `_thumb.jpg` or `_small.jpg` is missing it falls back
to the next larger version and prints a warning.

Resize images with ImageMagick if you need to generate the derivatives:

```bash
magick temple.jpg            -resize 1200x650\> -quality 82 temple_small.jpg
magick temple.jpg -resize 160x100^ -gravity center -extent 160x100 -quality 82 temple_thumb.jpg
cp temple_thumb.jpg thumbnail.jpg   # first photo only
```

## Local preview

`fetch()` of the manifest needs an HTTP origin, so open it through a server
rather than double-clicking the file:

```bash
python3 -m http.server 8765
# http://localhost:8765/
```

## Notes

- **Guestbook** is still the third-party iframe at `clue.oomfie.club`; it is not
  part of this repo.
- **Video**: 11 `.webm` with `.mp4` fallbacks. The webm set is 17MB, the mp4 set
  42MB — both are committed. If you want to trim the repo, drop the `.mp4`
  files; the fallback just stops firing.
- **Photos**: `gallery/files/` is 76MB, of which 67MB is originals. Those are
  only fetched if a visitor clicks "Full size". Removing originals entirely
  would save 67MB and cost nothing visually — the lightbox loads `_small.jpg`.
- Photo counts follow the old gallery, including the `Test Images` category.
