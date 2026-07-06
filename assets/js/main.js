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
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 6"/></svg>'
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
// Remote release JSON — matches the crDroid OTA "response": [...] format.
// -----------------------------------------------------------------------
function pickRepoUrlsFromDownloadLink(downloadUrl) {
  // Expected shape: https://github.com/<owner>/<repo>/releases/download/<tag>/<file>
  const match = downloadUrl && downloadUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\//);
  if (!match) return null;
  const [, owner, repo] = match;
  return {
    repoUrl: `https://github.com/${owner}/${repo}`,
    releasesUrl: `https://github.com/${owner}/${repo}/releases`
  };
}

function pickCodenameFromFilename(filename) {
  // Expected shape: crDroidAndroid-16.0-20260705-plato-v12.11.zip
  const match = filename && filename.match(/^crDroidAndroid-([\d.]+)-\d{8}-([^-]+)-v/);
  return match ? { androidBase: `Android ${match[1].split('.')[0]}`, codename: match[2] } : null;
}

// Applies one release entry (from plato.json's "response" array) onto the page data.
function applyRemoteRelease(pageData, release) {
  if (!release) return;

  const parsedFilename = pickCodenameFromFilename(release.filename);
  const repoUrls = pickRepoUrlsFromDownloadLink(release.download);
  const dateIso = release.timestamp
    ? new Date(release.timestamp * 1000).toISOString().split('T')[0]
    : pageData.latestRelease.date;

  if (release.device) pageData.device.name = release.device;
  if (parsedFilename) {
    pageData.device.codename = parsedFilename.codename;
    pageData.latestRelease.androidBase = parsedFilename.androidBase;
  }

  pageData.latestRelease.version = release.version || pageData.latestRelease.version;
  pageData.latestRelease.codename = release.buildtype || pageData.latestRelease.codename;
  pageData.latestRelease.date = dateIso;
  pageData.latestRelease.maintainer = release.maintainer;
  pageData.latestRelease.size = formatSize(release.size);

  // NOTE: links.downloads is intentionally NOT overwritten here — it stays
  // fully controlled by data.json (e.g. a stable ".../releases/latest" page)
  // rather than being replaced by this build's direct .zip URL.
  if (release.telegram) pageData.links.telegram = release.telegram;
  if (release.gapps) pageData.links.gapps = release.gapps;
  if (release.firmware) pageData.links.firmware = release.firmware;
  if (repoUrls) {
    pageData.links.github = repoUrls.repoUrl;
    pageData.links.releases = repoUrls.releasesUrl;
  }
}

// -----------------------------------------------------------------------
// Remote changelog text — dated blocks separated by "====" rule lines,
// each containing "- " bullet lines. See plato_changelog.txt for the format.
// -----------------------------------------------------------------------
function parseChangelogText(text) {
  const lines = text.split('\n');
  const dateLineIndexes = [];

  lines.forEach((line, index) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(line.trim())) {
      dateLineIndexes.push(index);
    }
  });

  return dateLineIndexes.map((startIndex, i) => {
    const endIndex = dateLineIndexes[i + 1] ?? lines.length;
    const block = lines.slice(startIndex, endIndex);
    const changes = block
      .map(line => line.trim())
      .filter(line => line.startsWith('-') && !/^-+$/.test(line)) // drop bullets AND dashed underlines
      .map(line => line.replace(/^-+\s*/, ''));

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
function renderHero(data) {
  const { rom, latestRelease } = data;

  document.title = `${rom.name} — Custom Android Firmware`;
  document.getElementById('nav-rom-name').textContent = rom.name;
  document.getElementById('hero-title').textContent = rom.name;
  document.getElementById('hero-tagline').textContent = rom.tagline;
  document.getElementById('footer-rom-name').textContent = rom.name;

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

function renderDevice(data) {
  const { device } = data;

  document.getElementById('device-name').textContent = device.name;
  document.getElementById('device-codename').textContent = `Codename: ${device.codename}`;
  document.getElementById('device-screenshot').src = device.screenshotImage;
  document.getElementById('device-screenshot').alt = `${device.name} running ${data.rom.name}`;

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
  const icon = type === 'warning' ? 'warning' : 'info';
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

function renderAll(data) {
  renderHero(data);
  renderDevice(data);
  renderRelease(data);
  renderChangelog(data);
  renderInstallIntro(data);
  renderInstallSteps(data);
  renderLinks(data);
}

async function init() {
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  let data;
  try {
    data = await loadJson('data.json');
  } catch (err) {
    console.error('Failed to load data.json:', err);
    return;
  }

  // Render immediately with the local/editorial data so the page is never empty,
  // then overlay live data from the remote sources as soon as it arrives.
  renderAll(data);
  initScrollReveal();
  initHeaderScrollState();
  initCodeCopyButtons();

  const remote = data.remote || {};

  if (remote.releaseJsonUrl) {
    try {
      const releaseFeed = await loadJson(remote.releaseJsonUrl);
      applyRemoteRelease(data, releaseFeed.response && releaseFeed.response[0]);
    } catch (err) {
      console.error('Failed to load live release data, keeping local fallback:', err);
    }
  }

  if (remote.changelogUrl) {
    try {
      const changelogText = await loadText(remote.changelogUrl);
      applyRemoteChangelog(data, parseChangelogText(changelogText));
    } catch (err) {
      console.error('Failed to load live changelog, keeping local fallback:', err);
    }
  }

  // Re-render with whatever live data made it through; reveal state on
  // already-visible elements is preserved since matching IDs are reused.
  renderHero(data);
  renderDevice(data);
  renderRelease(data);
  renderChangelog(data);
  renderInstallIntro(data);
  renderLinks(data);

  // Newly injected changelog/link cards need their own reveal observers.
  initScrollReveal();
}

document.addEventListener('DOMContentLoaded', init);
