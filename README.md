# CEDIREKO Films

Portfolio site for CEDIREKO Films, a one-person video studio in Manila. Static HTML, CSS and JS on GitHub Pages: https://eysiarw.github.io/Cedireko-Films/

No build step, no framework, no backend. It shows work and links out to email and socials. That's all it's meant to do.

## Films on the reel

| SC | Title | Type | Frame | Runtime | File |
| :-- | :-- | :-- | :-- | :-- | :-- |
| 01 | Veronikka rebranding | Commercial | 4:3, 1440×1080 | 01:29 | `VERONIKKA_REVISED_3.mp4` |
| 02 | EA performance | Music video | 16:9, 1920×1080 | 04:41 | `EA_FINALCUT.mp4` |
| 03 | Fico Mana: Cyra | Fashion reel | 9:16, 1080×1920 | 00:27 | `FICOMANA_CYRA_2_1.mp4` |
| 04 | Fico Mana: Breanna | Fashion reel | 9:16, 1080×1920 | 00:34 | `BREANNA_1.mp4` |
| 05 | Fico Mana: Leigh | Fashion reel | 9:16, 1080×1920 | 00:45 | `FICOMANA_LEIGH_web.mp4` |

Runtimes were read off the files with `ffprobe`. The old hand-typed values (03:42, 01:58, and 00:47 on all three Fico Mana reels) were wrong.

## Adding a film

Everything comes from the `FILMS` array at the top of `script.js`. Add one object:

```js
{
  id: 'brand-x',
  title: 'BRAND X LAUNCH',
  type: 'Commercial',
  client: 'Brand X',
  role: 'Direction, camera, edit',
  brief: 'Launch spot for Brand X. 16:9 at 1080p.',
  src: 'projects/BRAND_X.mp4',
  poster: 'assets/posters/brand_x.jpg',
  orientation: 'landscape',      // or 'portrait'
  duration: '00:45',             // MM:SS, get it with the ffprobe line below
  captions: ''                   // 'captions/brand_x.vtt' once you have one
}
```

The grid card, player, PREV/NEXT order and scene number (SC.06, ...) follow automatically. If two films share a runtime, or a listed runtime doesn't match the file when it loads in the player, the console warns you.

```bash
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 projects/BRAND_X.mp4
```

## Encoding

Not run as part of the site. Do these locally, then commit the output.

**Hero loop** (12 s, 720p, no audio). Change `-ss` to wherever the best 12 seconds start.

```bash
ffmpeg -ss 00:00:30 -t 12 -i projects/EA_FINALCUT.mp4 -an -vf "scale=-2:720,fps=24" -c:v libx264 -preset slow -crf 26 -maxrate 3M -bufsize 6M -pix_fmt yuv420p -movflags +faststart projects/hero-loop.mp4
```

```bash
ffmpeg -ss 00:00:30 -t 12 -i projects/EA_FINALCUT.mp4 -an -vf "scale=-2:720,fps=24" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -deadline good -cpu-used 2 projects/hero-loop.webm
```

Both should land well under 5 MB. If one doesn't, raise the CRF by 2 and run it again. Once both exist, delete the `EA_FINALCUT.mp4` fallback `<source>` in the hero of `index.html`.

**Poster frames**, one per video, taken 2 s in. Written to a separate folder so the current posters aren't overwritten:

```bash
mkdir -p assets/posters/new && for f in projects/*.mp4; do ffmpeg -y -ss 2 -i "$f" -frames:v 1 -vf "scale='min(1280,iw)':-2" -q:v 3 "assets/posters/new/$(basename "$f" .mp4).jpg"; done
```

## Contrast

Checked against WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text and UI).

| Pairing | Ratio | Result |
| :-- | :-- | :-- |
| `--bone` #F4E9DE on `--void` #3C0008 | 14.68:1 | Pass |
| `--bone-dim` #D9C6BA on `--void` | 10.65:1 | Pass |
| `--ember` #CDA05A on `--void` | 7.34:1 | Pass |
| `--ash-rose` #B08187 on `--void` | 5.30:1 | Pass |
| `--ash-rose` on `--wine-deep` #2A0509 | 5.64:1 | Pass |
| `--ash-rose` on `--frame` #180307 | 6.01:1 | Pass |
| `--wine-deep` on `--ember` (CTA, active filter) | 7.80:1 | Pass |
| Hero timecode, `--bone-dim` at 80% on letterbox | 7.86:1 | Pass |
| `--ember` label on tile scrim, worst case (white frame) | 4.80:1 | Pass |
| REC dot #E53935 on `--void` | 4.16:1 | Pass as a non-text graphic (3:1); hidden from screen readers |

## Tests

Headless Chrome over CDP, no dependencies beyond Node and a local Chrome.

```bash
node tests/run_tests.js && node tests/m1_empirical_stress.test.js
```

The "zero 404s" check fails until `projects/hero-loop.webm` and `projects/hero-loop.mp4` exist.

## Layout

```text
index.html        page markup; the reel grid is filled in by script.js
404.html
style.css
script.js         FILMS data, rendering, player, header, motion
assets/           logo, portrait, OG image, posters/
projects/         video files
tests/
```

> *"Maging mabait lang palagi."*

&copy; 2026 CEDIREKO FILMS
