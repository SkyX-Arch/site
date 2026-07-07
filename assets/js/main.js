// =============================================================================
// main.js — renders the page from data.json, then overlays live release data
// fetched directly from the ROM's own release feed (JSON) and changelog (text).
//
// EDIT: to change editorial content (tagline, specs, install steps, logo),
// edit data.json. To point this page at a different device/ROM release feed,
// edit the "remote" block at the top of data.json.
// =============================================================================

// Small inline icon set (no external icon font/library needed).
// EDIT: add more entries here if you add new spec/link types in data.json.
const ICONS = {
  cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
  display: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  battery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10v4"/></svg>',
  memory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  android: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9v6M18 9v6M8 4l1.5 2M16 4l-1.5 2"/><rect x="6" y="6" width="12" height="10" rx="3"/><circle cx="9.5" cy="10.5" r=".6" fill="currentColor"/><circle cx="14.5" cy="10.5" r=".6" fill="currentColor"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.62-3.37-1.22-3.37-1.22-.46-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.11 2.91.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.74 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.9-1.32 2.74-1.05 2.74-1.05.56 1.43.21 2.48.1 2.74.65.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10 12.5 2.5 4 3l-.5 8.5L11 19l9-9z"/><circle cx="8.5" cy="7.5" r="1.2" fill="currentColor"/></svg>',
  telegram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 3.5 2.7 10.9c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.2-2.1 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14c.3-1.2-.5-1.8-1.8-1.8z"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l9-5 9 5-9 5-9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>',
  firmware: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/><path d="M9 9h6v6H9z"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".6" fill="currentColor"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 6"/></svg>',
  tip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>'
};

// Escapes text before it goes inside a code block — shell commands often
// contain characters like < > that would otherwise break the markup.
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function iconMarkup(name) {
  return ICONS[name] || ICONS.tag;
}

// Formats an ISO date (YYYY-MM-DD) into a short, locale-agnostic display date.
function formatDate(isoDate) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Formats a byte count into a human-readable size, e.g. 1929857518 -> "1.80 GB".
function formatSize(bytes) {
  if (!bytes || Number.isNaN(Number(bytes))) return null;
  const gb = Number(bytes) / (1024 ** 3);
  return `${gb.toFixed(2)} GB`;
}

async function loadJson(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);
  return response.json();
}

async function loadText(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);
  return response.text();
}

// -----------------------------------------------------------------------
// Remote release JSON — field NAMES vary between ROMs (some use "download",
// others "url" or "downloadUrl"; some nest the release list under a
// different key, etc). Instead of hardcoding one ROM's field names, every
// lookup below goes through releaseJsonMap (configured in data.json), so
// adapting to a different ROM's OTA JSON is a data.json edit, not a code edit.
// -----------------------------------------------------------------------

// Reads a (possibly nested) value out of an object using a "a.b.c" path.
// Used both to locate the release list inside the JSON and to read
// individual fields, since some ROMs nest fields (e.g. "meta.version").
function getByPath(obj, path) {
  if (!path) return obj;
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

// Looks up one logical field (e.g. "version") on a release entry, using the
// JSON key name configured for it in releaseJsonMap.fields, falling back to
// the field's own name if nothing is configured.
function getMappedField(entry, map, fieldKey) {
  const jsonKey = (map.fields && map.fields[fieldKey]) || fieldKey;
  return getByPath(entry, jsonKey);
}

// Converts whatever date representation the feed uses into a plain
// YYYY-MM-DD string, based on releaseJsonMap.dateFormat.
function normalizeReleaseDate(rawValue, dateFormat) {
  if (rawValue === undefined || rawValue === null || rawValue === '') return null;

  switch (dateFormat) {
    case 'unix_millis':
      return new Date(Number(rawValue)).toISOString().split('T')[0];
    case 'iso':
    case 'text':
      return String(rawValue).split('T')[0];
    case 'unix_seconds':
    default:
      return new Date(Number(rawValue) * 1000).toISOString().split('T')[0];
  }
}

function pickRepoUrlsFromDownloadLink(downloadUrl) {
  // Expected shape: https://github.com/<owner>/<repo>/releases/download/<tag>/<file>
  // Harmless no-op if the ROM hosts downloads somewhere else — it just won't match.
  const match = downloadUrl && downloadUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\//);
  if (!match) return null;
  const [, owner, repo] = match;
  return {
    repoUrl: `https://github.com/${owner}/${repo}`,
    releasesUrl: `https://github.com/${owner}/${repo}/releases`
  };
}

// Optional: pulls the device codename / Android base version out of the
// build filename using a regex configured in releaseJsonMap.filenamePattern,
// which must use named capture groups (?<codename>...) and (?<androidBase>...).
// If no pattern is configured, this is skipped and data.json's own
// device.codename / latestRelease.androidBase are left untouched.
function pickCodenameFromFilename(filename, pattern) {
  if (!filename || !pattern) return null;
  try {
    const match = filename.match(new RegExp(pattern));
    if (!match || !match.groups) return null;
    const { codename, androidBase } = match.groups;
    return {
      codename: codename || null,
      androidBase: androidBase ? `Android ${androidBase.split('.')[0]}` : null
    };
  } catch (err) {
    console.error('Invalid releaseJsonMap.filenamePattern regex:', err);
    return null;
  }
}

// Picks the latest release entry out of the raw JSON feed using
// releaseJsonMap.listPath (dot-path to the array) and .entryIndex.
function extractReleaseEntry(feedJson, map) {
  const list = map.listPath ? getByPath(feedJson, map.listPath) : feedJson;
  const array = Array.isArray(list) ? list : [list].filter(Boolean);
  return array[map.entryIndex ?? 0];
}

// Applies one release entry onto the page data, using releaseJsonMap to
// resolve each ROM-specific field name.
function applyRemoteRelease(pageData, release, map) {
  if (!release) return;

  const version = getMappedField(release, map, 'version');
  const deviceName = getMappedField(release, map, 'device');
  const filename = getMappedField(release, map, 'filename');
  const download = getMappedField(release, map, 'download');
  const rawDate = getMappedField(release, map, 'date');
  const buildType = getMappedField(release, map, 'buildType');
  const maintainer = getMappedField(release, map, 'maintainer');
  const size = getMappedField(release, map, 'size');
  const telegram = getMappedField(release, map, 'telegram');
  const gapps = getMappedField(release, map, 'gapps');
  const firmware = getMappedField(release, map, 'firmware');

  const parsedFilename = pickCodenameFromFilename(filename, map.filenamePattern);
  const repoUrls = pickRepoUrlsFromDownloadLink(download);
  const dateIso = normalizeReleaseDate(rawDate, map.dateFormat) || pageData.latestRelease.date;

  if (deviceName) pageData.device.name = deviceName;
  if (parsedFilename) {
    if (parsedFilename.codename) pageData.device.codename = parsedFilename.codename;
    if (parsedFilename.androidBase) pageData.latestRelease.androidBase = parsedFilename.androidBase;
  }

  pageData.latestRelease.version = version || pageData.latestRelease.version;
  pageData.latestRelease.codename = buildType || pageData.latestRelease.codename;
  pageData.latestRelease.date = dateIso;
  pageData.latestRelease.maintainer = maintainer;
  pageData.latestRelease.size = formatSize(size);

  // NOTE: links.downloads is intentionally NOT overwritten here — it stays
  // fully controlled by data.json (e.g. a stable ".../releases/latest" page)
  // rather than being replaced by this build's direct download URL.
  if (telegram) pageData.links.telegram = telegram;
  if (gapps) pageData.links.gapps = gapps;
  if (firmware) pageData.links.firmware = firmware;
  if (repoUrls) {
    pageData.links.github = repoUrls.repoUrl;
    pageData.links.releases = repoUrls.releasesUrl;
  }
}

// -----------------------------------------------------------------------
// Remote changelog text — formats vary (dash vs asterisk bullets, "----"
// vs "====" underlines, etc), so the date pattern and bullet characters are
// configurable via changelogMap in data.json instead of hardcoded here.
// -----------------------------------------------------------------------
function parseChangelogText(text, map = {}) {
  const dateLinePattern = new RegExp(map.dateLinePattern || '^\\d{4}-\\d{2}-\\d{2}$');
  const bulletChars = (map.bulletPrefixes && map.bulletPrefixes.length > 0)
    ? map.bulletPrefixes
    : ['-', '*'];
  const bulletClass = bulletChars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
  const bulletLineRegex = new RegExp(`^[${bulletClass}]+\\s*`);
  const separatorLineRegex = new RegExp(`^([${bulletClass}=_])\\1+$`); // e.g. "----", "====", "****"

  const lines = text.split('\n');
  const dateLineIndexes = [];

  lines.forEach((line, index) => {
    if (dateLinePattern.test(line.trim())) {
      dateLineIndexes.push(index);
    }
  });

  return dateLineIndexes.map((startIndex, i) => {
    const endIndex = dateLineIndexes[i + 1] ?? lines.length;
    const block = lines.slice(startIndex, endIndex);
    const changes = block
      .map(line => line.trim())
      .filter(line => bulletLineRegex.test(line) && !separatorLineRegex.test(line))
      .map(line => line.replace(bulletLineRegex, ''));

    return {
      date: lines[startIndex].trim(),
      changes
    };
  });
}

function applyRemoteChangelog(pageData, entries) {
  if (!entries || entries.length === 0) return;

  pageData.changelog = entries;

  // Use the newest entry's own bullets as the release summary so it always
  // reflects what actually shipped, instead of a static editorial blurb.
  const [latestEntry] = entries;
  if (latestEntry && latestEntry.changes.length > 0) {
    pageData.latestRelease.summary = latestEntry.changes.slice(0, 3).join('. ') + '.';
  }
}

// -----------------------------------------------------------------------
// Rendering
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// Theme colors — lets data.json override the Material You accent palette to
// match a specific ROM's branding, without touching any CSS. Only the
// accent hues need to be supplied; the "on-primary" text color (used for
// filled-button text) is auto-computed for contrast unless overridden, and
// --color-primary-container derives from --color-primary automatically via
// color-mix() in the stylesheet.
// -----------------------------------------------------------------------
function hexToRgb(hex) {
  const clean = String(hex).trim().replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

// WCAG relative luminance, used to decide whether dark or light text reads
// better on a given accent color.
function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(channel => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastTextFor(hex) {
  return relativeLuminance(hex) > 0.55 ? '#1B1523' : '#FFFFFF';
}

const THEMEABLE_CSS_PROPERTIES = [
  '--color-primary',
  '--color-secondary',
  '--color-tertiary',
  '--color-on-primary',
  '--color-primary-container'
];

// Clears any inline theme overrides from a previously active profile so the
// stylesheet's defaults (or the next profile's own theme) take over cleanly —
// without this, switching from a themed profile to one with no/partial
// theme config would leave the old profile's colors stuck via inline style.
function resetTheme() {
  const root = document.documentElement.style;
  THEMEABLE_CSS_PROPERTIES.forEach(prop => root.removeProperty(prop));
}

function applyTheme(theme) {
  if (!theme) return;
  const root = document.documentElement.style;

  if (theme.primary) {
    root.setProperty('--color-primary', theme.primary);
    root.setProperty('--color-on-primary', theme.onPrimary || contrastTextFor(theme.primary));
  }
  if (theme.secondary) root.setProperty('--color-secondary', theme.secondary);
  if (theme.tertiary) root.setProperty('--color-tertiary', theme.tertiary);
  // Optional manual override; otherwise the stylesheet derives this from
  // --color-primary via color-mix() automatically.
  if (theme.primaryContainer) root.setProperty('--color-primary-container', theme.primaryContainer);
}

function renderHero(data) {
  const { rom, latestRelease } = data;

  document.title = `${rom.name} — Custom Android Firmware`;
  const metaDescription = document.getElementById('meta-description');
  if (metaDescription) metaDescription.setAttribute('content', rom.tagline);

  document.getElementById('hero-title').textContent = rom.name;
  document.getElementById('hero-tagline').textContent = rom.tagline;
  document.getElementById('footer-rom-name').textContent = rom.name;

  // Every other spot the ROM name appears in static markup (nav CTA button,
  // install section heading/subheading) — kept as ROM-name-aware spans in
  // index.html so switching ROMs never requires hand-editing the HTML.
  const navCtaName = document.getElementById('nav-cta-rom-name');
  if (navCtaName) navCtaName.textContent = rom.name;
  const installHeadingName = document.getElementById('install-heading-rom-name');
  if (installHeadingName) installHeadingName.textContent = rom.name;
  const installSubheadingName = document.getElementById('install-subheading-rom-name');
  if (installSubheadingName) installSubheadingName.textContent = rom.name;

  const creditEl = document.getElementById('footer-credit');
  if (rom.author && rom.author.name) {
    const link = rom.author.url
      ? `<a href="${rom.author.url}" target="_blank" rel="noopener">${rom.author.name}</a>`
      : rom.author.name;
    creditEl.innerHTML = `Site &amp; ROM maintained by ${link}`;
  } else {
    creditEl.innerHTML = '';
  }

  document.getElementById('hero-meta-version').textContent = latestRelease.version;
  document.getElementById('hero-meta-base').textContent = latestRelease.androidBase;
  document.getElementById('hero-meta-date').textContent = formatDate(latestRelease.date);

  document.getElementById('hero-download-btn').href = data.links.downloads;

  // Logo images (nav + hero) are set from data so both stay in sync
  const logoSrc = rom.logoImage;
  if (logoSrc) {
    document.querySelectorAll('.hero-logo, .nav-brand img').forEach(img => {
      img.src = logoSrc;
    });
  }
}

// Gallery state for the screenshot lightbox — populated by renderDevice,
// read by the lightbox open/next/prev functions below.
let galleryImages = [];
let galleryIndex = 0;

function renderDevice(data) {
  const { device } = data;

  document.getElementById('device-name').textContent = device.name;
  document.getElementById('device-codename').textContent = `Codename: ${device.codename}`;

  galleryImages = (device.screenshots && device.screenshots.length > 0)
    ? device.screenshots
    : [{ src: 'assets/img/screenshot-placeholder.svg', caption: '' }];

  const screenshotImg = document.getElementById('device-screenshot');
  screenshotImg.src = galleryImages[0].src;
  screenshotImg.alt = `${device.name} running ${data.rom.name}`;

  const grid = document.getElementById('specs-grid');
  grid.innerHTML = device.specs.map(spec => `
    <div class="spec-card reveal">
      <div class="spec-icon">${iconMarkup(spec.icon)}</div>
      <div class="spec-label">${spec.label}</div>
      <div class="spec-value">${spec.value}</div>
    </div>
  `).join('');
}

function renderRelease(data) {
  const { latestRelease, links } = data;

  document.getElementById('release-version').textContent = latestRelease.version;
  document.getElementById('release-codename').textContent = latestRelease.codename;
  document.getElementById('release-date').textContent = formatDate(latestRelease.date);
  document.getElementById('release-summary').textContent = latestRelease.summary;
  document.getElementById('release-download-btn').href = links.downloads;
  document.getElementById('release-notes-btn').href = links.releases;

  const metaParts = [];
  if (latestRelease.maintainer) metaParts.push(`Maintainer: ${latestRelease.maintainer}`);
  if (latestRelease.size) metaParts.push(`Size: ${latestRelease.size}`);
  document.getElementById('release-meta').textContent = metaParts.join(' · ');
}

function renderChangelog(data) {
  const list = document.getElementById('changelog-list');
  list.innerHTML = data.changelog.map(entry => `
    <div class="changelog-item reveal">
      <span class="changelog-dot"></span>
      <div class="changelog-meta">
        ${entry.version ? `<span class="changelog-version">${entry.version}</span>` : ''}
        <span class="changelog-date">${formatDate(entry.date)}</span>
      </div>
      <ul class="changelog-changes">
        ${entry.changes.map(change => `<li>${change}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

// Renders a single command block (array of lines or one string) with a copy button.
function renderCodeBlock(lines) {
  if (!lines) return '';
  const text = Array.isArray(lines) ? lines.join('\n') : lines;
  return `
    <div class="code-block">
      <pre><code>${escapeHtml(text)}</code></pre>
      <button type="button" class="code-copy-btn" data-copy-text="${encodeURIComponent(text)}" aria-label="Copy command">
        ${iconMarkup('copy')}
      </button>
    </div>
  `;
}

function renderCallout(type, text) {
  if (!text) return '';
  const icon = type === 'warning' ? 'warning' : type === 'tip' ? 'tip' : 'info';
  return `
    <div class="install-callout install-callout-${type} reveal">
      <span class="install-callout-icon">${iconMarkup(icon)}</span>
      <span>${text}</span>
    </div>
  `;
}

// Warning banner, requirements checklist and prerequisites — all optional,
// all sourced from data.installGuide so any ROM's guide can be dropped in.
function renderInstallIntro(data) {
  const container = document.getElementById('install-intro');
  const guide = data.installGuide;

  if (!guide) {
    container.innerHTML = '';
    return;
  }

  const requirementItems = (guide.requirements || [])
    .map(req => {
      // linkRef pulls the URL from data.links so it always matches the
      // Downloads button; url is for one-off links that don't belong there.
      const url = req.linkRef ? data.links[req.linkRef] : req.url;
      if (!url) return ''; // skip requirements whose link isn't configured
      const optionalTag = req.optional ? '<span class="requirement-optional-tag">optional</span>' : '';
      return `<li><a href="${url}" target="_blank" rel="noopener">${req.label}</a>${optionalTag}</li>`;
    })
    .filter(Boolean)
    .join('');

  const prereqItems = (guide.prerequisites || [])
    .map(item => `<li>${item}</li>`)
    .join('');

  const requirementsBlock = requirementItems ? `
    <div class="install-requirements reveal">
      <div class="install-requirements-title">Requirements</div>
      <ul class="install-requirements-list">${requirementItems}</ul>
      ${prereqItems ? `
        <div class="install-prereqs-title">Also required</div>
        <ul class="install-prereqs-list">${prereqItems}</ul>
      ` : ''}
    </div>
  ` : '';

  container.innerHTML = [
    renderCallout('tip', guide.otaNote),
    renderCallout('warning', guide.warning),
    requirementsBlock,
    renderCallout('important', guide.importantNote)
  ].join('');
}

// Numbered steps — each one can mix and match description / ordered list /
// code block / a nested "if that fails" alternative / a closing note.
function renderInstallSteps(data) {
  const container = document.getElementById('install-steps');
  const guide = data.installGuide;

  if (!guide || !guide.steps) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = guide.steps.map(step => `
    <div class="install-step reveal">
      <div class="install-step-number"></div>
      <div class="install-step-body">
        <div class="install-step-title">${step.title}</div>
        ${step.description ? `<div class="install-step-desc">${step.description}</div>` : ''}
        ${step.list ? `<ol class="step-list">${step.list.map(item => `<li>${item}</li>`).join('')}</ol>` : ''}
        ${renderCodeBlock(step.code)}
        ${step.alternative ? `
          <div class="step-alternative">
            ${step.alternative.note ? `<div class="step-alternative-note">${step.alternative.note}</div>` : ''}
            ${renderCodeBlock(step.alternative.code)}
          </div>
        ` : ''}
        ${step.important ? `<div class="step-important">${step.important}</div>` : ''}
        ${step.note ? `<div class="step-note">${step.note}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// Copy-to-clipboard for code blocks. Delegated on document so it keeps
// working after install-intro/install-steps are re-rendered with live data.
function initCodeCopyButtons() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('.code-copy-btn');
    if (!button) return;

    const text = decodeURIComponent(button.dataset.copyText || '');
    navigator.clipboard.writeText(text).then(() => {
      const original = button.innerHTML;
      button.innerHTML = iconMarkup('check');
      button.classList.add('copied');
      setTimeout(() => {
        button.innerHTML = original;
        button.classList.remove('copied');
      }, 1500);
    }).catch(err => console.error('Clipboard copy failed:', err));
  });
}

function renderLinks(data) {
  const { links } = data;
  const linkDefs = [
    { key: 'github', icon: 'github', title: 'Source code', desc: 'Browse the repository on GitHub' },
    { key: 'downloads', icon: 'download', title: 'Downloads', desc: 'Grab the latest build' },
    { key: 'releases', icon: 'tag', title: 'Release history', desc: 'All versions and changelogs' },
    { key: 'gapps', icon: 'box', title: 'GApps', desc: 'Google apps package for this build' },
    { key: 'firmware', icon: 'firmware', title: 'Firmware', desc: 'Matching vendor firmware package' },
    { key: 'telegram', icon: 'telegram', title: 'Community chat', desc: 'Ask questions, get support' }
  ];

  const grid = document.getElementById('links-grid');
  grid.innerHTML = linkDefs
    .filter(def => links[def.key]) // skip links that aren't set
    .map(def => `
      <a class="link-card reveal" href="${links[def.key]}" target="_blank" rel="noopener">
        <div class="link-icon">${iconMarkup(def.icon)}</div>
        <div>
          <div class="link-title">${def.title}</div>
          <div class="link-desc">${def.desc}</div>
        </div>
      </a>
    `).join('');
}

// Fades / slides sections into view as they cross into the viewport.
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

// Adds a subtle background/border once the page has scrolled past the hero.
function initHeaderScrollState() {
  const header = document.getElementById('site-header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// -----------------------------------------------------------------------
// Screenshot lightbox — opens on clicking the phone mockup, browses through
// device.screenshots from data.json (populated into galleryImages above).
// -----------------------------------------------------------------------
function updateLightboxImage() {
  const item = galleryImages[galleryIndex];
  const image = document.getElementById('lightbox-image');
  image.src = item.src;
  image.alt = item.caption || 'Screenshot';
  document.getElementById('lightbox-caption').textContent = item.caption || '';
  document.getElementById('lightbox-counter').textContent = `${galleryIndex + 1} / ${galleryImages.length}`;

  const hasMultiple = galleryImages.length > 1;
  document.getElementById('lightbox-prev').style.display = hasMultiple ? '' : 'none';
  document.getElementById('lightbox-next').style.display = hasMultiple ? '' : 'none';
  document.getElementById('lightbox-counter').style.display = hasMultiple ? '' : 'none';
}

function openLightbox(startIndex) {
  galleryIndex = ((startIndex % galleryImages.length) + galleryImages.length) % galleryImages.length;
  updateLightboxImage();
  document.getElementById('screenshot-lightbox').classList.add('open');
  document.body.style.overflow = 'hidden'; // prevent background scroll while open
}

function closeLightbox() {
  document.getElementById('screenshot-lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function stepLightbox(delta) {
  galleryIndex = ((galleryIndex + delta) % galleryImages.length + galleryImages.length) % galleryImages.length;
  updateLightboxImage();
}

function initLightbox() {
  const phoneScreen = document.getElementById('phone-screen');
  const lightbox = document.getElementById('screenshot-lightbox');

  const openFromPhone = () => openLightbox(0);
  phoneScreen.addEventListener('click', openFromPhone);
  phoneScreen.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFromPhone();
    }
  });

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => stepLightbox(-1));
  document.getElementById('lightbox-next').addEventListener('click', () => stepLightbox(1));

  // Click on the dark backdrop (not the image itself) closes the lightbox.
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') stepLightbox(-1);
    if (event.key === 'ArrowRight') stepLightbox(1);
  });
}

function renderAll(data) {
  renderHero(data);
  renderDevice(data);
  renderRelease(data);
  renderChangelog(data);
  renderInstallIntro(data);
  renderInstallSteps(data);
  renderLinks(data);
}

// -----------------------------------------------------------------------
// Hub / detail navigation — lets one page host multiple ROM/device profiles
// (e.g. crDroid on one device and AxionOS on another), presented as a grid
// of tiles on a "hub" home view. Picking a tile opens that profile's full
// page (the existing hero/device/release/changelog/install/links sections);
// a back link returns to the grid. Each profile is a full data.json-shaped
// object — see data.json's "profiles" array. The open profile is reflected
// in a ?rom=<id> URL param so a specific ROM's page is shareable/bookmarkable
// and the browser's back/forward buttons work as expected.
// -----------------------------------------------------------------------
let currentSwitchToken = 0; // guards against a slow/stale fetch overwriting a newer render

// Accepts either the new { profiles: [...] } shape or a legacy single-profile
// data.json (everything at the top level, no "profiles" array) for backward
// compatibility with sites that haven't migrated yet.
function normalizeProfiles(data) {
  if (Array.isArray(data.profiles) && data.profiles.length > 0) {
    return { profiles: data.profiles, defaultProfileId: data.defaultProfileId, hub: data.hub };
  }
  const fallbackProfile = { id: 'default', label: (data.rom && data.rom.name) || 'ROM', ...data };
  return { profiles: [fallbackProfile], defaultProfileId: 'default', hub: data.hub };
}

function getProfileById(profiles, id) {
  return profiles.find(profile => profile.id === id);
}

function renderHub(profiles, hub = {}) {
  document.getElementById('hub-heading').textContent = hub.title || 'All builds';
  document.getElementById('hub-subheading').textContent = hub.subtitle || '';

  document.getElementById('nav-brand-title').textContent = hub.title || 'All builds';
  if (hub.logoImage) document.getElementById('nav-brand-logo').src = hub.logoImage;

  const grid = document.getElementById('hub-grid');
  grid.innerHTML = profiles.map(profile => {
    const rom = profile.rom || {};
    const device = profile.device || {};
    const release = profile.latestRelease || {};
    const accentStyle = (profile.theme && profile.theme.primary)
      ? `--hub-card-accent: ${profile.theme.primary};${profile.theme.primaryContainer ? ` --hub-card-accent-container: ${profile.theme.primaryContainer};` : ''}`
      : '';

    return `
      <div class="hub-card reveal" role="button" tabindex="0" data-profile-id="${profile.id}" style="${accentStyle}">
        <div class="hub-card-logo"><img src="${rom.logoImage || 'assets/img/logo.svg'}" alt=""></div>
        <div>
          <div class="hub-card-name">${rom.name || profile.label || profile.id}</div>
          <div class="hub-card-device">${device.name || ''}${device.codename ? ` (${device.codename})` : ''}</div>
        </div>
        <div class="hub-card-meta">
          ${release.version ? `<span>v${release.version}</span>` : ''}
          ${release.androidBase ? `<span>${release.androidBase}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function showHubView() {
  document.getElementById('hub-view').hidden = false;
  document.getElementById('detail-view').hidden = true;
  document.getElementById('nav-back-link').hidden = true;
  document.getElementById('nav-links').hidden = true;
  document.getElementById('nav-cta').hidden = true;
  window.scrollTo(0, 0);
}

function showDetailView(hasHub) {
  document.getElementById('hub-view').hidden = true;
  document.getElementById('detail-view').hidden = false;
  document.getElementById('nav-back-link').hidden = !hasHub;
  document.getElementById('nav-links').hidden = false;
  document.getElementById('nav-cta').hidden = false;
  window.scrollTo(0, 0);
}

// Fetches and overlays a profile's live release/changelog data, guarded by
// a token so a slow response from a profile the visitor has since navigated
// away from can't clobber a newer render.
async function loadRemoteDataForProfile(profile, token) {
  const remote = profile.remote || {};

  if (remote.releaseJsonUrl) {
    try {
      const releaseFeed = await loadJson(remote.releaseJsonUrl);
      if (token !== currentSwitchToken) return;
      const releaseMap = remote.releaseJsonMap || {};
      applyRemoteRelease(profile, extractReleaseEntry(releaseFeed, releaseMap), releaseMap);
    } catch (err) {
      console.error('Failed to load live release data, keeping local fallback:', err);
    }
  }

  if (token !== currentSwitchToken) return;

  if (remote.changelogUrl) {
    try {
      const changelogText = await loadText(remote.changelogUrl);
      if (token !== currentSwitchToken) return;
      applyRemoteChangelog(profile, parseChangelogText(changelogText, remote.changelogMap || {}));
    } catch (err) {
      console.error('Failed to load live changelog, keeping local fallback:', err);
    }
  }

  if (token !== currentSwitchToken) return;

  renderHero(profile);
  renderDevice(profile);
  renderRelease(profile);
  renderChangelog(profile);
  renderInstallIntro(profile);
  renderLinks(profile);
  initScrollReveal(); // newly injected changelog/link cards need their own reveal observers
}

// historyMode controls how the URL reflects the navigation: 'replace'
// (initial load), 'push' (the visitor clicked something, so back/forward
// can step through it), or 'none' (already handled, e.g. a popstate event).
function updateUrlParam(paramValue, historyMode) {
  if (historyMode === 'none') return;
  const url = new URL(window.location.href);
  if (paramValue) {
    url.searchParams.set('rom', paramValue);
  } else {
    url.searchParams.delete('rom');
  }
  if (historyMode === 'push') {
    window.history.pushState({ rom: paramValue || null }, '', url);
  } else {
    window.history.replaceState({ rom: paramValue || null }, '', url);
  }
}

function goToHub(profiles, historyMode) {
  if (profiles.length <= 1) return; // nothing to go back to in single-profile mode
  currentSwitchToken++; // invalidate any in-flight fetch for the profile being left
  closeLightbox();
  updateUrlParam(null, historyMode);
  resetTheme();
  showHubView();
}

async function goToProfile(profiles, id, historyMode) {
  const profile = getProfileById(profiles, id);
  if (!profile) return;

  const token = ++currentSwitchToken;
  const hasHub = profiles.length > 1;

  closeLightbox();
  updateUrlParam(profile.id, historyMode);

  resetTheme();
  applyTheme(profile.theme);
  renderAll(profile);
  showDetailView(hasHub);
  initScrollReveal();

  await loadRemoteDataForProfile(profile, token);
}

// Reflects whatever the URL currently says (used for popstate — never
// pushes/replaces history itself, since the browser already navigated it).
function restoreFromUrl(profiles) {
  const fromUrl = new URLSearchParams(window.location.search).get('rom');
  if (fromUrl && getProfileById(profiles, fromUrl)) {
    goToProfile(profiles, fromUrl, 'none');
  } else if (profiles.length > 1) {
    currentSwitchToken++;
    closeLightbox();
    resetTheme();
    showHubView();
  } else {
    goToProfile(profiles, profiles[0].id, 'none');
  }
}

function initHubNavigation(profiles) {
  document.getElementById('nav-brand-link').addEventListener('click', (event) => {
    event.preventDefault();
    goToHub(profiles, 'push');
  });

  document.getElementById('nav-back-link').addEventListener('click', (event) => {
    event.preventDefault();
    goToHub(profiles, 'push');
  });

  const grid = document.getElementById('hub-grid');
  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.hub-card');
    if (card) goToProfile(profiles, card.dataset.profileId, 'push');
  });
  grid.addEventListener('keydown', (event) => {
    const card = event.target.closest('.hub-card');
    if (!card) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToProfile(profiles, card.dataset.profileId, 'push');
    }
  });

  window.addEventListener('popstate', () => restoreFromUrl(profiles));
}

async function init() {
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  let rawData;
  try {
    rawData = await loadJson('data.json');
  } catch (err) {
    console.error('Failed to load data.json:', err);
    return;
  }

  const { profiles: rawProfiles, defaultProfileId, hub } = normalizeProfiles(rawData);

  // defaultProfileId just orders the hub grid (shown first) — it no longer
  // controls routing; the hub is always the landing page unless ?rom= is set.
  const profiles = defaultProfileId
    ? [...rawProfiles].sort((a, b) => (a.id === defaultProfileId ? -1 : b.id === defaultProfileId ? 1 : 0))
    : rawProfiles;

  renderHub(profiles, hub);
  initHubNavigation(profiles);
  initHeaderScrollState();
  initCodeCopyButtons();
  initLightbox();

  if (profiles.length <= 1) {
    // Single-profile site: skip the hub entirely, go straight to the page.
    await goToProfile(profiles, profiles[0].id, 'none');
    return;
  }

  const fromUrl = new URLSearchParams(window.location.search).get('rom');
  if (fromUrl && getProfileById(profiles, fromUrl)) {
    await goToProfile(profiles, fromUrl, 'replace');
  } else {
    showHubView();
  }
}

document.addEventListener('DOMContentLoaded', init);
