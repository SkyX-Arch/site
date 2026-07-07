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

Field names are NOT hardcoded — `remote.releaseJsonMap` in `data.json` maps
this ROM's JSON field names onto the page's internal fields, so pointing
this page at a different ROM's differently-named OTA JSON is a `data.json`
edit, not a code edit. See `releaseJsonMap` for the full list of fields
(`version`, `device`, `filename`, `download`, `date`, `buildType`,
`maintainer`, `size`, `telegram`, `gapps`, `firmware`) and:
- `listPath` / `entryIndex` — where the release list lives in the JSON and
  which entry is "latest" (dot-path, e.g. `"data.builds"`; leave `listPath`
  empty if the JSON root itself is the array).
- `dateFormat` — `"unix_seconds"`, `"unix_millis"`, `"iso"`, or `"text"`,
  depending on how the feed represents the release date.
- `filenamePattern` — optional named-group regex (`(?<codename>...)`,
  `(?<androidBase>...)`) to pull the device codename / Android version out
  of the build filename. Leave unset to keep `device.codename` /
  `latestRelease.androidBase` exactly as configured in `data.json`.

The GitHub source/releases links are derived from the `download` URL's
owner/repo automatically (harmless no-op if downloads aren't hosted on
GitHub Releases).

From the changelog text: `remote.changelogMap` configures the date-line
regex (`dateLinePattern`) and which characters count as bullets
(`bulletPrefixes`, e.g. `["-", "*"]`) so different ROMs' changelog
formatting (dash vs asterisk bullets, `----` vs `====` vs `****`
underlines) can be supported without editing `main.js`. The newest entry's
own bullets are also used as the release summary, so the hero/release panel
never says something the changelog doesn't back up.

If a ROM's feed needs something genuinely different from field-remapping
(e.g. a non-JSON format), only `assets/js/main.js`'s `applyRemoteRelease` /
`parseChangelogText` functions need updating — nothing else in the page
depends on the parsing details.

## Theme colors

`theme` in `data.json` lets you match the site's Material You accent
palette to a specific ROM's branding without touching any CSS:

```json
"theme": {
  "primary": "#D0BCFF",
  "secondary": "#CCC2DC",
  "tertiary": "#EFB8C8",
  "onPrimary": null,
  "primaryContainer": null
}
```

Every gradient, badge, hover state and button background on the page
derives from `primary`/`secondary`/`tertiary` (via CSS custom properties and
`color-mix()`), so changing these three values re-themes the whole site.
`onPrimary` (the text color on filled buttons) is auto-computed for
readable contrast against `primary` if left `null`; set it explicitly only
if the automatic choice looks wrong. `primaryContainer` similarly
auto-derives from `primary`; override it only for fine-tuning.

## The "already installed?" note

`installGuide.otaNote` in `data.json` renders as a callout above the
install guide's warning, reminding visitors who already have a previous
build that a normal OTA update (download + install through the updater +
reboot) is enough — the full flash-from-scratch steps below it are only
for a clean install. Edit or remove it like any other `installGuide` field.

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
- `assets/img/screenshot-placeholder.svg` (and `-2`, `-3`) — shown inside the
  phone mockup and in the click-to-open lightbox gallery. Replace with real
  screenshots and list them under `device.screenshots` in `data.json` (each
  entry is `{ "src", "caption" }` — add or remove entries freely, the first
  one is what shows in the phone mockup itself).

## Screenshot gallery

Clicking (or pressing Enter/Space on) the phone mockup opens a lightbox that
lets visitors browse every image in `device.screenshots`, with prev/next
buttons, arrow-key and Escape support, and a click-outside-to-close backdrop.
Add or remove screenshots by editing that array — no other code changes
needed.

## Logo / icon sizing

The header logo, hero logo and favicon are sized with a fixed box plus
`object-fit: contain`, so swapping in a replacement image of a different
pixel size or aspect ratio won't stretch or distort it — it'll just be
letterboxed inside the same box. For best results keep replacement art
roughly square. The favicon link also sets `sizes="any"`, which is the
standard fix for SVG favicons rendering at the wrong size in some browsers.

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

### Troubleshooting: "Deployment failed, try again later."

If the `actions/deploy-pages` step fails with exactly this message (after
the artifact uploads and the deployment is *created* successfully), it's
almost always one of:

- **Pages source isn't set to "GitHub Actions" yet.** Go to
  **Settings → Pages → Build and deployment → Source** and select
  **GitHub Actions** (not "Deploy from a branch"). This is the most common
  cause on a brand-new repo.
- **A stuck/pending deployment from a previous run.** Open
  **Settings → Pages**, or the repo's **Environments → github-pages** tab,
  cancel anything stuck "in progress", then re-run the workflow.
- **A transient GitHub Pages backend issue.** This exact message is a known,
  generic error from GitHub's Pages service itself (see
  [actions/deploy-pages issues](https://github.com/actions/deploy-pages/issues)
  for ongoing reports) and usually clears up by simply re-running the
  workflow a few minutes later.

The unrelated `Node 20 actions are deprecated…` warning in the same log is
just an informational notice from GitHub's Actions runners — this workflow
already pins `actions/checkout@v5`, `actions/upload-pages-artifact@v4` and
`actions/deploy-pages@v5`, which run on Node 24, so it shouldn't reappear.

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). Uses `fetch`,
`IntersectionObserver` and CSS custom properties — all widely supported.
