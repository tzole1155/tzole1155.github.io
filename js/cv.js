// ============================================
// CV PAGE
// ============================================
//
// The whole CV is authored in /cv/cv.md. This file turns that markdown into
// the laid-out sheet: front matter becomes the masthead, `## Section {layout}`
// picks how each section renders, and `<div id="cv-publications">` is filled
// from /data/publications.json so the CV never drifts from the homepage.
//
// Depends on helpers already defined in main.js (trackEvent, escapeHtml).

const CV_LAYOUTS = ['timeline', 'cards', 'chips', 'stats', 'plain'];

async function initCV() {
  const sheet = document.getElementById('cv-sheet');
  const mastheadEl = document.getElementById('cv-masthead');
  const bodyEl = document.getElementById('cv-body');
  if (!bodyEl) return;

  let raw;
  try {
    const res = await fetch('./cv.md', { cache: 'no-cache' });
    if (!res.ok) throw new Error('CV markdown not found');
    raw = await res.text();
  } catch {
    bodyEl.innerHTML = '<p style="color: var(--text-muted);">Could not load the CV right now.</p>';
    return;
  }

  const { meta, content } = parseCVFrontMatter(raw);

  renderCVMasthead(mastheadEl, meta);
  if (meta.name) document.title = `CV — ${meta.name}`;

  bodyEl.innerHTML = typeof marked !== 'undefined'
    ? marked.parse(content)
    : content.replace(/\n/g, '<br>');

  groupCVSections(bodyEl).forEach(applyCVSectionLayout);
  await injectCVPublications(bodyEl);

  initCVViewToggle();
  initCVDownload();

  sheet?.setAttribute('aria-busy', 'false');
  trackEvent('cv_view', {});
}

// --------------------------------------------
// FRONT MATTER
// --------------------------------------------

// Deliberately not a full YAML parser: flat `key: value` lines, plus a
// `links:` block of `- Label | https://url` items.
function parseCVFrontMatter(raw) {
  const meta = { links: [] };
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { meta, content: raw };

  let inLinks = false;
  match[1].split(/\r?\n/).forEach(line => {
    if (!line.trim()) return;

    if (inLinks && /^\s*-\s+/.test(line)) {
      const [label, url] = line.replace(/^\s*-\s+/, '').split('|').map(s => s.trim());
      if (label) meta.links.push({ label, url: url || '' });
      return;
    }

    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) return;

    const key = kv[1].toLowerCase();
    if (key === 'links') {
      inLinks = true;
      return;
    }
    inLinks = false;
    meta[key] = kv[2].trim();
  });

  return { meta, content: raw.slice(match[0].length).trim() };
}

function renderCVMasthead(container, meta) {
  if (!container) return;

  const facts = [meta.location, meta.updated ? `Updated ${meta.updated}` : '']
    .filter(Boolean)
    .map(f => `<span>${escapeHtml(f)}</span>`)
    .join('');

  const links = (meta.links || []).map(link => {
    const href = link.url || '#';
    return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" class="cv-link" data-cv-link="${escapeHtml(link.label)}">
        <i class="${cvLinkIcon(link.label, href)}" aria-hidden="true"></i>
        <span>${escapeHtml(link.label)}</span>
        <span class="cv-link-url">${escapeHtml(cvPrettyUrl(href))}</span>
      </a>`;
  }).join('');

  const email = meta.email
    ? `<a href="mailto:${escapeHtml(meta.email)}" class="cv-link" data-cv-link="Email">
         <i class="fas fa-envelope" aria-hidden="true"></i>
         <span>${escapeHtml(meta.email)}</span>
       </a>`
    : '';

  container.innerHTML = `
    <div class="cv-identity">
      <h1 class="cv-name">${escapeHtml(meta.name || '')}</h1>
      ${meta.headline ? `<p class="cv-headline">${escapeHtml(meta.headline)}</p>` : ''}
      ${meta.tagline ? `<p class="cv-tagline">${escapeHtml(meta.tagline)}</p>` : ''}
      ${facts ? `<div class="cv-facts">${facts}</div>` : ''}
    </div>
    ${links || email ? `<div class="cv-links">${email}${links}</div>` : ''}
  `;

  container.addEventListener('click', e => {
    const a = e.target.closest('a[data-cv-link]');
    if (a) trackEvent('cv_link_click', { link_label: a.dataset.cvLink });
  });
}

// The label wins over the URL, so "Website | https://…github.io" stays a globe.
function cvLinkIcon(label, href) {
  const match = key => {
    if (key.includes('scholar')) return 'fas fa-graduation-cap';
    if (key.includes('website') || key.includes('homepage')) return 'fas fa-globe';
    if (key.includes('github')) return 'fab fa-github';
    if (key.includes('linkedin')) return 'fab fa-linkedin-in';
    if (key.includes('twitter') || key.includes('x.com')) return 'fab fa-x-twitter';
    if (key.includes('orcid')) return 'fab fa-orcid';
    if (key.includes('calendar') || key.includes('call') || key.includes('meeting')) return 'fas fa-calendar-alt';
    if (key.includes('mailto') || key.includes('email')) return 'fas fa-envelope';
    return '';
  };
  return match(String(label).toLowerCase()) || match(String(href).toLowerCase()) || 'fas fa-link';
}

// Shown only in print, where a bare link label carries no information.
function cvPrettyUrl(href) {
  return String(href).replace(/^https?:\/\//, '').replace(/\/$/, '');
}

// --------------------------------------------
// SECTION GROUPING & LAYOUTS
// --------------------------------------------

// `## Title {chips} {full-only}` -> title plus a list of modifiers.
function parseCVModifiers(text) {
  const mods = [];
  const title = String(text)
    .replace(/\{([a-z-]+)\}/gi, (_, mod) => {
      mods.push(mod.toLowerCase());
      return '';
    })
    .trim();
  return { title, mods };
}

// Flat markdown output -> one <section> per h2, so each can be laid out
// independently and kept together across page breaks when printing.
function groupCVSections(root) {
  const nodes = Array.from(root.childNodes);
  const frag = document.createDocumentFragment();
  const sections = [];
  let current = null;

  nodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H2') {
      const { title, mods } = parseCVModifiers(node.textContent || '');

      current = document.createElement('section');
      current.className = 'cv-section';
      current.dataset.layout = mods.find(m => CV_LAYOUTS.includes(m)) || 'timeline';
      mods.filter(m => !CV_LAYOUTS.includes(m))
        .forEach(m => current.classList.add(`cv-section--${m}`));

      const heading = document.createElement('h2');
      heading.className = 'cv-section-title';
      heading.textContent = title;
      current.appendChild(heading);

      sections.push(current);
      frag.appendChild(current);
      return;
    }

    if (!current) {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
      frag.appendChild(node);
      return;
    }

    current.appendChild(node);
  });

  root.innerHTML = '';
  root.appendChild(frag);
  return sections;
}

function applyCVSectionLayout(section) {
  switch (section.dataset.layout) {
    case 'stats':
      renderCVStats(section);
      break;
    case 'chips':
      renderCVChips(section);
      break;
    case 'cards':
      buildCVEntries(section, 'cv-entry cv-entry--card');
      break;
    case 'plain':
      break;
    default:
      buildCVEntries(section, 'cv-entry');
  }
}

// `- 20 | Peer-reviewed publications` -> a row of value/caption tiles.
function renderCVStats(section) {
  const list = section.querySelector('ul');
  if (!list) return;

  const items = Array.from(list.querySelectorAll(':scope > li')).map(li => {
    const [value, ...rest] = (li.textContent || '').split('|');
    return `
      <div class="cv-stat">
        <div class="cv-stat-value">${escapeHtml(value.trim())}</div>
        <div class="cv-stat-caption">${escapeHtml(rest.join('|').trim())}</div>
      </div>
    `;
  });

  const row = document.createElement('div');
  row.className = 'cv-stats';
  row.innerHTML = items.join('');
  list.replaceWith(row);
}

// `- **Label** — a, b, c` -> a label plus one chip per comma-separated item.
function renderCVChips(section) {
  const list = section.querySelector('ul');
  if (!list) return;

  const rows = Array.from(list.querySelectorAll(':scope > li')).map(li => {
    const strong = li.querySelector('strong');
    const label = strong ? strong.textContent.trim() : '';
    if (strong) strong.remove();

    const items = (li.textContent || '')
      .replace(/^\s*[—–-]\s*/, '')
      .split(/,|·/)
      .map(s => s.trim())
      .filter(Boolean);

    return `
      <div class="cv-skill-row">
        ${label ? `<div class="cv-skill-label">${escapeHtml(label)}</div>` : ''}
        <div class="cv-skill-tags">
          ${items.map(i => `<span class="interest-tag">${escapeHtml(i)}</span>`).join('')}
        </div>
      </div>
    `;
  });

  const wrap = document.createElement('div');
  wrap.className = 'cv-skills';
  wrap.innerHTML = rows.join('');
  list.replaceWith(wrap);
}

// Each h3 (plus everything up to the next h3) becomes a dated entry.
function buildCVEntries(section, entryClass) {
  const children = Array.from(section.children);
  const parts = [];
  const entries = [];
  let content = null;

  children.forEach(child => {
    if (child.tagName === 'H3') {
      const entry = document.createElement('div');
      entry.className = entryClass;

      const rail = document.createElement('div');
      rail.className = 'cv-entry-rail';

      content = document.createElement('div');
      content.className = 'cv-entry-content';

      const { role, org } = splitCVHeading(child.textContent || '');
      const title = document.createElement('h3');
      title.className = 'cv-entry-title';
      title.innerHTML = `${escapeHtml(role)}${org ? ` <span class="cv-entry-org">${escapeHtml(org)}</span>` : ''}`;
      content.appendChild(title);

      entry.append(rail, content);
      parts.push(entry);
      entries.push(entry);
      return;
    }

    if (!content) {
      parts.push(child);
      return;
    }
    content.appendChild(child);
  });

  section.innerHTML = '';
  parts.forEach(part => section.appendChild(part));
  entries.forEach(hoistCVEntryMeta);
}

function splitCVHeading(text) {
  const [role, ...rest] = String(text).split(/\s+[—–|]\s+/);
  return { role: (role || '').trim(), org: rest.join(' — ').trim() };
}

// The `*2021 – Present · Athens, Greece*` line under a heading: the part that
// looks like a date moves to the rail, whatever is left stays as meta.
function hoistCVEntryMeta(entry) {
  const content = entry.querySelector('.cv-entry-content');
  const candidate = content?.children[1];
  if (!candidate || candidate.tagName !== 'P') return;

  const em = candidate.querySelector('em');
  if (!em || em.textContent.trim() !== candidate.textContent.trim()) return;

  const parts = em.textContent.split('·').map(s => s.trim()).filter(Boolean);
  const dateIndex = parts.findIndex(p => /\d{4}|present|ongoing|current/i.test(p));

  const date = dateIndex >= 0 ? parts[dateIndex] : '';
  const rest = parts.filter((_, i) => i !== dateIndex).join(' · ');

  if (date) {
    const rail = entry.querySelector('.cv-entry-rail');
    if (rail) rail.innerHTML = `<span class="cv-entry-date">${escapeHtml(date)}</span>`;
  }

  if (rest) {
    const meta = document.createElement('div');
    meta.className = 'cv-entry-meta';
    meta.textContent = rest;
    candidate.replaceWith(meta);
  } else {
    candidate.remove();
  }
}

// --------------------------------------------
// PUBLICATIONS
// --------------------------------------------

async function injectCVPublications(root) {
  const holder = root.querySelector('#cv-publications');
  if (!holder) return;

  let pubs;
  try {
    const res = await fetch('../data/publications.json');
    pubs = await res.json();
  } catch {
    holder.innerHTML = '<p class="cv-empty">Publication list unavailable — see Google Scholar.</p>';
    return;
  }

  const ids = (holder.dataset.ids || '').split(',').map(s => s.trim()).filter(Boolean);
  if (ids.length) {
    const byId = new Map(pubs.map(p => [p.id, p]));
    pubs = ids.map(id => byId.get(id)).filter(Boolean);
  } else {
    pubs = pubs.slice().sort((a, b) => b.year - a.year);
  }

  const limit = parseInt(holder.dataset.limit || '', 10);
  if (!Number.isNaN(limit)) pubs = pubs.slice(0, limit);

  const counts = pubs.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});
  const nouns = { conference: ['conference paper', 'conference papers'], journal: ['journal article', 'journal articles'], preprint: ['preprint', 'preprints'] };
  const summary = Object.keys(nouns)
    .filter(t => counts[t])
    .map(t => `${counts[t]} ${nouns[t][counts[t] > 1 ? 1 : 0]}`)
    .join(' · ');

  const years = [...new Set(pubs.map(p => p.year))].sort((a, b) => b - a);

  const groups = years.map(year => `
    <div class="cv-pub-group">
      <div class="cv-pub-year">${year}</div>
      <div class="cv-pub-list">
        ${pubs.filter(p => p.year === year).map(cvPublicationHTML).join('')}
      </div>
    </div>
  `).join('');

  holder.innerHTML = `
    <p class="cv-pub-summary">
      <strong>${pubs.length} peer-reviewed publications</strong>${summary ? ` — ${summary}` : ''}.
      Full and current list on
      <a href="https://scholar.google.gr/citations?user=2o1nthIAAAAJ&hl" target="_blank" rel="noopener">Google Scholar</a>.
    </p>
    ${groups}
  `;
}

function cvPublicationHTML(pub) {
  const authors = (pub.authors || [])
    .map(a => (a === 'Georgios Albanis' ? `<span class="me">${escapeHtml(a)}</span>` : escapeHtml(a)))
    .join(', ');

  const links = [];
  if (pub.links?.pdf) links.push(`<a href="${escapeHtml(pub.links.pdf)}" target="_blank" rel="noopener">PDF</a>`);
  if (pub.links?.project) links.push(`<a href="${escapeHtml(pub.links.project)}" target="_blank" rel="noopener">Project</a>`);
  if (pub.links?.doi) links.push(`<a href="https://doi.org/${escapeHtml(pub.links.doi)}" target="_blank" rel="noopener">DOI</a>`);

  return `
    <div class="cv-pub">
      <div class="cv-pub-title">${escapeHtml(pub.title)}</div>
      <div class="cv-pub-authors">${authors}</div>
      <div class="cv-pub-venue">
        ${pub.venue ? escapeHtml(pub.venue) : escapeHtml(pub.type)}
        ${links.length ? `<span class="cv-pub-links">${links.join('')}</span>` : ''}
      </div>
    </div>
  `;
}

// --------------------------------------------
// VIEW TOGGLE & DOWNLOAD
// --------------------------------------------

const CV_VIEW_KEY = 'cv-view';

function initCVViewToggle() {
  const buttons = Array.from(document.querySelectorAll('[data-cv-view]'));
  if (!buttons.length) return;

  const apply = (view, track) => {
    document.body.classList.toggle('cv-condensed', view === 'condensed');
    buttons.forEach(b => b.classList.toggle('active', b.dataset.cvView === view));
    try {
      window.localStorage.setItem(CV_VIEW_KEY, view);
    } catch {
      // Ignore storage failures (private mode/quota).
    }
    if (track) trackEvent('cv_view_toggle', { cv_view: view });
  };

  let stored = 'full';
  try {
    stored = window.localStorage.getItem(CV_VIEW_KEY) || 'full';
  } catch {
    // Ignore storage failures.
  }
  apply(stored === 'condensed' ? 'condensed' : 'full', false);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => apply(btn.dataset.cvView, true));
  });
}

function initCVDownload() {
  const btn = document.getElementById('cv-download');
  if (!btn) return;
  btn.addEventListener('click', () => {
    trackEvent('cv_download', {
      cv_view: document.body.classList.contains('cv-condensed') ? 'condensed' : 'full',
    });
    window.print();
  });
}
