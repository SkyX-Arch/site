# crDroid landing page (Xiaomi 12T / plato)

A static, dark-themed, Material You–styled landing page for a custom Android
firmware. Plain HTML/CSS/JS — no build step, no framework. Release info and
changelog are fetched live, in the visitor's browser, from the ROM's own
release feed — no server, database, or scheduled job required.

## Project structure

```
.
├── index.html                     # Page structure (all sections)
├── data.json                      # Editorial content + the live-data source URLs
├── assets/
│   ├── css/style.css              # Theme tokens, layout, animations
│   ├── js/main.js                 # Renders data.json, then overlays live data
│   └── img/
│       ├── logo.svg               # REPLACE: your logo
│       ├── screenshot-placeholder.svg  # REPLACE: real device screenshot
│       └── favicon.svg
├── .github/workflows/
│   └── deploy.yml                 # Publishes the site to GitHub Pages
└── .nojekyll                      # Tells GitHub Pages not to run Jekyll
```

## How the data flows

1. On page load, `main.js` fetches **`data.json`** and renders the page
   immediately (ROM name, tagline, device specs, install steps, links) so the
   page is never empty, even offline.
2. It then fetches, directly from the browser:
   - **`remote.releaseJsonUrl`** — the crDroid OTA `response: [...]` JSON
     (version, download link, build type, maintainer, file size, telegram,
     gapps/firmware links, etc.)
   - **`remote.changelogUrl`** — the plain-text changelog, parsed into dated
     entries.
3. Whatever it gets back overlays the matching fields and the page re-renders.
   If either fetch fails (offline, source down), the page silently keeps the
   fallback content from `data.json`.

Both source URLs are configured at the top of `data.json`:

```json
"remote": {
  "releaseJsonUrl": "https://skyx-arch.github.io/crdroid-ota/plato.json",
  "changelogUrl": "https://skyx-arch.github.io/crdroid-ota/plato_changelog.txt"
}
```

To point this page at a different device or maintainer's feed, change these
two URLs — everything else adapts automatically (version, date, download
link, changelog, telegram, gapps/firmware links, device codename and Android
base are all parsed out of the feed).

This works with no proxy or backend because GitHub Pages serves all public
files with `Access-Control-Allow-Origin: *`, so a page hosted on any origin
can `fetch()` these two files directly.

### What's parsed out of each source

From the release JSON's first `response[]` entry:
`version`, `device`, `timestamp` → date, `download`, `buildtype`, `maintainer`,
`size`, `telegram`, `gapps`, `firmware`. The device codename and Android base
version are parsed out of the build `filename`
(`crDroidAndroid-16.0-20260705-plato-v12.11.zip` → Android 16, codename
`plato`). The GitHub source/releases links are derived from the `download`
URL's owner/repo.

From the changelog text: each date line (`YYYY-MM-DD`) starts a new entry;
every following `- ` line up to the next date becomes one changelog bullet.
The newest entry's own bullets are also used as the release summary, so the
hero/release panel never says something the changelog doesn't back up.

If the upstream feed changes its format, only `assets/js/main.js`'s
`applyRemoteRelease` / `parseChangelogText` functions need updating — nothing
else in the page depends on the parsing details.

## Editing content

Everything that ISN'T pulled live — the ROM name, tagline, device spec cards,
install guide, links, and the logo — lives in `data.json`. Field-by-field
notes are inline under `_comment` keys.

**The Downloads link (`links.downloads`) is never overwritten by the live
release feed** — it stays whatever you set it to in `data.json` (by default,
the ROM's `.../releases/latest` page). This is deliberate: the release feed's
`download` field points at one specific build's `.zip`, which would go stale;
a `releases/latest` page always redirects to whatever is newest.

### Install guide

`installGuide` in `data.json` drives the whole "Installing…" section and is
built to be reusable for any ROM/device, not just this one:

- `warning` — a red/tertiary callout at the top (liability disclaimer, etc).
- `requirements` — a checklist of files to grab before starting. Each item is
  either `{ "label", "url" }` for a one-off link, or `{ "label", "linkRef" }`
  where `linkRef` is a key from `links` (e.g. `"downloads"`, `"gapps"`) so the
  requirement always points at the same URL as the rest of the page — no
  duplicate links to keep in sync. Add `"optional": true` to tag an item as
  optional. Requirements whose link isn't configured (empty string) are
  skipped automatically.
- `prerequisites` — a plain checklist under Requirements (bootloader unlocked,
  etc.) with no links.
- `importantNote` — a second (primary-colored) callout, typically placed
  after the requirements.
- `steps` — an ordered array; each step can mix and match:
  - `title` (required), `description` (plain text)
  - `list` — a numbered sub-list (e.g. "Select Wipe all data")
  - `code` — a string or array of strings rendered as a copyable command
    block (a copy button is added automatically)
  - `alternative` — a nested `{ note, code }` block for "if that fails, try
    this instead" cases
  - `important` / `note` — a short callout or muted footnote under the step

To reuse this page for a different ROM, only `installGuide` and `links` need
new values — nothing in `main.js` or the CSS is specific to any one device.

Images:
- `assets/img/logo.svg` — the logo, used in both the header and hero. Replace
  the file (any format works — update `rom.logoImage` in `data.json` if you
  rename it).
- `assets/img/screenshot-placeholder.svg` — shown inside the phone mockup.
  Replace with a real screenshot (`device.screenshotImage` in `data.json`).

## Theme / colors

All colors, radii and motion timing are CSS variables at the top of
`assets/css/style.css` (`:root { ... }`). To re-theme the whole site, change
`--color-primary`, `--color-tertiary` and the surface colors — everything
else derives from them.

## Running locally

No build step is required. Because the page fetches JSON with `fetch()`,
open it through a local server rather than a `file://` URL:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**, set the source to **GitHub Actions**.
3. Push to `main` — `.github/workflows/deploy.yml` builds and publishes the
   site automatically. Because release data is fetched live in the browser,
   there's nothing further to rebuild or schedule when a new build ships
   upstream — visitors just see it on their next page load.

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses `fetch`,
`IntersectionObserver` and CSS custom properties — all widely supported.
