function trackEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params || {});
  }
}

initSiteLoader();

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initOutboundTracking();
  initPublications();
  initBlogTeaser();
});

function initSiteLoader() {
  const loader = document.getElementById('site-loader');
  const viewer = document.getElementById('hero-viewer');
  if (!loader || !viewer) return;

  document.body.classList.add('site-loading');

  let finished = false;

  function hideLoader() {
    if (finished) return;
    finished = true;
    loader.classList.add('hidden');
    document.body.classList.remove('site-loading');
  }

  window.addEventListener('gvrm-ready', hideLoader, { once: true });
  window.addEventListener('gvrm-failed', hideLoader, { once: true });
  window.setTimeout(hideLoader, 15000);
}

// ============================================
// ANALYTICS (GA4)
// ============================================

function initOutboundTracking() {
  document.body.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="http"]');
    if (!a) return;
    try {
      if (a.hostname === location.hostname) return;
    } catch {
      return;
    }
    trackEvent('outbound_click', {
      link_url: a.href,
      link_domain: a.hostname,
    });
  });
}

// ============================================
// NAVIGATION
// ============================================

function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (toggle) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const icon = toggle.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-xmark');
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      links.classList.remove('open');
      const icon = toggle?.querySelector('i');
      if (icon) {
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-xmark');
      }
    });
  });

  const sectionOrder = ['hero', 'about', 'publications', 'blog', 'contact'];

  function updateActiveNav() {
    const scrollY = window.scrollY;
    const innerHeight = window.innerHeight;
    const doc = document.documentElement;

    const hasScroll = doc.scrollHeight > innerHeight + 2;
    if (hasScroll && scrollY + innerHeight >= doc.scrollHeight - 2) {
      navItems.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#contact');
      });
      return;
    }

    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
      10,
    ) || 64;
    const readingLine = scrollY + Math.max(navHeight + 40, innerHeight * 0.35);

    let currentId = 'hero';
    for (const id of sectionOrder) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.getBoundingClientRect().top + scrollY;
      if (top <= readingLine) {
        currentId = id;
      }
    }

    const navId = currentId === 'hero' ? 'about' : currentId;

    navItems.forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === `#${navId}`);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('resize', updateActiveNav, { passive: true });
  window.addEventListener('hashchange', updateActiveNav);
  window.addEventListener('load', updateActiveNav);
  updateActiveNav();
}

// ============================================
// SCROLL REVEAL
// ============================================

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

// ============================================
// PUBLICATIONS
// ============================================

let publicationsData = [];

async function initPublications() {
  const container = document.getElementById('publications-list');
  const filterContainer = document.getElementById('publications-filter');
  if (!container) return;

  try {
    const basePath = document.querySelector('meta[name="base-path"]')?.content || '.';
    const res = await fetch(`${basePath}/data/publications.json`);
    publicationsData = await res.json();
    publicationsData.sort((a, b) => b.year - a.year);

    const years = [...new Set(publicationsData.map(p => p.year))].sort((a, b) => b - a);
    renderFilters(filterContainer, years);
    renderPublications(container, publicationsData);
    bindPublicationsAnalytics();
  } catch (e) {
    container.innerHTML = '<p style="color: var(--text-muted);">Failed to load publications.</p>';
  }
}

function renderFilters(container, years) {
  if (!container) return;
  container.innerHTML = `
    <button class="filter-btn active" data-filter="all">All</button>
    ${years.map(y => `<button class="filter-btn" data-filter="${y}">${y}</button>`).join('')}
  `;

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      const filtered = filter === 'all'
        ? publicationsData
        : publicationsData.filter(p => p.year === parseInt(filter));
      renderPublications(document.getElementById('publications-list'), filtered);
      trackEvent('publications_filter', { filter_value: String(filter) });
    });
  });
}

function renderPublications(container, pubs) {
  container.innerHTML = pubs.map((pub, i) => {
    const authors = pub.authors.map(a =>
      a === 'Georgios Albanis'
        ? `<span class="me">${a}</span>`
        : a
    ).join(', ');

    const links = [];
    if (pub.links?.pdf) links.push(`<a href="${pub.links.pdf}" target="_blank" rel="noopener" class="pub-link" data-link-type="pdf"><i class="fas fa-file-pdf"></i> PDF</a>`);
    if (pub.links?.project) links.push(`<a href="${pub.links.project}" target="_blank" rel="noopener" class="pub-link" data-link-type="project"><i class="fas fa-globe"></i> Project</a>`);
    if (pub.links?.doi) links.push(`<a href="https://doi.org/${pub.links.doi}" target="_blank" rel="noopener" class="pub-link" data-link-type="doi"><i class="fas fa-link"></i> DOI</a>`);
    if (pub.bibtex) links.push(`<button type="button" class="pub-link" onclick="showBibtex('${pub.id}')"><i class="fas fa-quote-right"></i> BibTeX</button>`);

    return `
      <div class="pub-card${pub.featured ? ' pub-featured' : ''}" data-pub-id="${pub.id}" style="animation-delay: ${i * 0.05}s">
        <div class="pub-card-header">
          <span class="pub-type ${pub.type}">${pub.type}</span>
          <span class="pub-title">${pub.title}</span>
        </div>
        <div class="pub-authors">${authors}</div>
        ${pub.venue ? `<div class="pub-venue">${pub.venue} · ${pub.year}</div>` : `<div class="pub-year">${pub.year}</div>`}
        ${links.length ? `<div class="pub-links">${links.join('')}</div>` : ''}
      </div>
    `;
  }).join('');
}

function bindPublicationsAnalytics() {
  const list = document.getElementById('publications-list');
  if (!list || list.dataset.analyticsBound === '1') return;
  list.dataset.analyticsBound = '1';
  list.addEventListener('click', (e) => {
    const a = e.target.closest('a.pub-link[data-link-type]');
    if (!a) return;
    const card = a.closest('.pub-card');
    trackEvent('publication_link_click', {
      publication_id: card?.dataset.pubId || '',
      link_type: a.dataset.linkType || '',
    });
  });
}

function showBibtex(id) {
  const pub = publicationsData.find(p => p.id === id);
  if (!pub?.bibtex) return;

  trackEvent('bibtex_open', { publication_id: id });

  const modal = document.getElementById('bibtex-modal');
  document.getElementById('bibtex-text').textContent = pub.bibtex;
  modal.classList.add('active');

  document.getElementById('bibtex-copy-btn').onclick = () => {
    navigator.clipboard.writeText(pub.bibtex).then(() => {
      trackEvent('bibtex_copy', { publication_id: id });
      const btn = document.getElementById('bibtex-copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy to clipboard', 2000);
    });
  };
}

function closeBibtex() {
  document.getElementById('bibtex-modal').classList.remove('active');
}

// ============================================
// BLOG TEASER (HOME PAGE)
// ============================================

async function initBlogTeaser() {
  const container = document.getElementById('blog-teaser');
  if (!container) return;

  try {
    const basePath = document.querySelector('meta[name="base-path"]')?.content || '.';
    const res = await fetch(`${basePath}/blog/posts/posts.json`);
    const posts = await res.json();

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="blog-empty">
          <i class="fas fa-pen-nib"></i>
          <p>Blog posts coming soon. Stay tuned.</p>
        </div>
      `;
      return;
    }

    const latest = posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    container.innerHTML = `<div class="blog-grid">${latest.map(post => blogCardHTML(post)).join('')}</div>`;
  } catch {
    container.innerHTML = `
      <div class="blog-empty">
        <i class="fas fa-pen-nib"></i>
        <p>Blog posts coming soon. Stay tuned.</p>
      </div>
    `;
  }
}

function blogCardHTML(post) {
  const slug = encodeURIComponent(post.slug);
  const href = post.type === 'html'
    ? `/blog/posts/${post.slug}/index.html`
    : `/blog/viewer.html?post=${slug}`;

  const date = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const tags = (post.tags || []).map(t => `<span class="blog-tag">${t}</span>`).join('');

  return `
    <a href="${href}" class="blog-card">
      <div class="blog-card-date">${date}</div>
      <div class="blog-card-title">${post.title}</div>
      <div class="blog-card-excerpt">${post.excerpt || ''}</div>
      <div class="blog-card-tags">${tags}</div>
    </a>
  `;
}

// ============================================
// BLOG LISTING PAGE
// ============================================

async function initBlogListing() {
  const container = document.getElementById('blog-listing-grid');
  if (!container) return;

  try {
    const res = await fetch('./posts/posts.json');
    const posts = await res.json();

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="blog-empty" style="grid-column: 1 / -1;">
          <i class="fas fa-pen-nib"></i>
          <p>No posts yet. Check back soon.</p>
        </div>
      `;
      return;
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    container.innerHTML = posts.map(post => blogCardHTML(post)).join('');
    trackEvent('blog_list_view', { post_count: posts.length });
  } catch {
    container.innerHTML = '<p style="color: var(--text-muted);">Failed to load posts.</p>';
  }
}

// ============================================
// BLOG VIEWER (MARKDOWN RENDERER)
// ============================================

async function initBlogViewer() {
  const titleEl = document.getElementById('post-title');
  const dateEl = document.getElementById('post-date');
  const tagsEl = document.getElementById('post-tags');
  const excerptEl = document.getElementById('post-excerpt');
  const bodyEl = document.getElementById('post-body');

  if (!bodyEl) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('post');

  if (!slug) {
    bodyEl.innerHTML = '<p>Post not found.</p>';
    return;
  }

  try {
    const metaRes = await fetch(`./posts/posts.json`);
    const posts = await metaRes.json();
    const meta = posts.find(p => p.slug === slug);

    if (meta) {
      if (titleEl) titleEl.textContent = meta.title;
      if (dateEl) dateEl.textContent = new Date(meta.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      if (excerptEl) excerptEl.textContent = meta.excerpt || '';
      if (tagsEl && meta.tags) {
        tagsEl.innerHTML = meta.tags.map(t => `<span class="blog-tag">${t}</span>`).join('');
      }
      document.title = `${meta.title} — Georgios Albanis`;
    }

    const mdRes = await fetch(`./posts/${slug}/index.md`);
    if (!mdRes.ok) throw new Error('Post not found');
    let md = await mdRes.text();

    const frontMatterMatch = md.match(/^---\n([\s\S]*?)\n---/);
    if (frontMatterMatch) {
      md = md.slice(frontMatterMatch[0].length).trim();
    }

      if (typeof marked !== 'undefined') {
        bodyEl.innerHTML = marked.parse(md);
      } else {
        bodyEl.innerHTML = md.replace(/\n/g, '<br>');
      }

      await hydrateRerunEmbeds(bodyEl);
      await initPostPaperExplorer(slug);

      trackEvent('blog_post_view', {
        post_slug: slug,
        post_title: meta?.title || slug,
      });
  } catch {
    bodyEl.innerHTML = '<p style="color: var(--text-muted);">Could not load this post.</p>';
  }
}

async function hydrateRerunEmbeds(root) {
  const embeds = root.querySelectorAll('[data-rerun-viewer-url]');
  if (!embeds.length) return;

  let WebViewer;
  try {
    ({ WebViewer } = await import('https://esm.sh/@rerun-io/web-viewer@0.24.0'));
  } catch (error) {
    console.error('Failed to load Rerun web viewer module:', error);
    embeds.forEach(embed => {
      const frame = embed.querySelector('.post-embed-frame');
      if (!frame) return;
      frame.innerHTML = `
        <div class="post-embed-empty">
          The Rerun viewer could not be loaded right now.
        </div>
      `;
    });
    return;
  }

  await Promise.all(Array.from(embeds, async embed => {
    const url = embed.dataset.rerunViewerUrl;
    const blueprintUrl = embed.dataset.rerunBlueprintUrl || '';
    const height = Number(embed.dataset.rerunViewerHeight || '640');
    const caption = embed.dataset.rerunCaption || '';
    const reference = embed.dataset.rerunReference || '';
    const referenceLabel = embed.dataset.rerunReferenceLabel || 'Reference';
    const frame = embed.querySelector('.post-embed-frame');

    if (!url || !frame) return;

    frame.style.minHeight = `${height}px`;

    const embedConfig = {
      url,
      blueprintUrl,
      width: '100%',
      height: `${height}px`,
    };

    try {
      const viewer = new WebViewer();
      // Keep blueprint metadata available here so we can route it through the
      // viewer once we settle on the exact Rerun app/API integration.
      await viewer.start([embedConfig.url, embedConfig.blueprintUrl], frame, {
        width: embedConfig.width,
        height: embedConfig.height,
      });

      if (caption || reference) {
        const captionEl = document.createElement('div');
        captionEl.className = 'post-embed-caption';
        captionEl.innerHTML = `
          <span>${caption}</span>
          ${reference ? `<a href="${reference}" target="_blank" rel="noopener">${referenceLabel}</a>` : ''}
        `;
        embed.appendChild(captionEl);
      }
    } catch (error) {
      console.error('Failed to initialize Rerun viewer:', error);
      frame.innerHTML = `
        <div class="post-embed-empty">
          The Rerun viewer could not be initialized for this post.
        </div>
      `;
    }
  }));
}

// ============================================
// POST PAPER EXPLORER (FILTER + IMPORT JSON)
// ============================================
//
// If a blog post markdown contains:
//   <div id="paper-explorer"></div>
// we render an interactive, filterable paper list inside it by fetching:
//   ./posts/<post-slug>/papers.json
async function initPostPaperExplorer(slug) {
  const explorer = document.getElementById('paper-explorer');
  if (!explorer) return;

  const listEl = explorer.querySelector('#paper-list') || null;
  const resultsCountEl = explorer.querySelector('#paper-results-count') || null;

  const papersJsonPath = explorer.dataset.papersJson || `./posts/${slug}/papers.json`;

  let papers = [];
  try {
    const res = await fetch(papersJsonPath);
    papers = await res.json();
  } catch (e) {
    explorer.innerHTML = `
      <div class="blog-empty" style="padding: 30px 20px;">
        <i class="fas fa-book"></i>
        <p style="margin-top: 10px;">Failed to load papers from <code>${escapeHtml(papersJsonPath)}</code>.</p>
      </div>
    `;
    return;
  }

  if (!Array.isArray(papers)) {
    explorer.innerHTML = `
      <div class="blog-empty" style="padding: 30px 20px;">
        <i class="fas fa-book"></i>
        <p style="margin-top: 10px;">Papers JSON must be an array.</p>
      </div>
    `;
    return;
  }

  papers = papers
    .filter(p => p && (p.title || p.id))
    .map(normalizePaper);

  const customPapers = loadCustomPapersForPost(slug).map(normalizePaper);
  const byId = new Map();
  [...papers, ...customPapers].forEach(p => byId.set(p.id, p));
  papers = Array.from(byId.values()).sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
  postPapersData = papers.slice();

  // Shared state for filtering.
  const state = {
    year: 'all',
    tags: new Set(),
    q: ''
  };

  explorer.innerHTML = `
    <div class="paper-explorer">
      <div class="paper-explorer-controls">
        <div id="paper-year-filter" class="publications-filter paper-year-filter"></div>
        <div id="paper-tag-filter" class="publications-filter paper-tag-filter"></div>
        <div class="paper-search-row">
          <input id="paper-search-input" class="paper-search-input" type="search" placeholder="Search title, authors, venue, tags..." autocomplete="off" />
          <button type="button" id="paper-search-clear" class="filter-btn">Clear</button>
        </div>
        <div id="paper-results-count" class="paper-results-count"></div>
      </div>
      <div id="paper-list" class="publications-list"></div>
    </div>
    <div id="paper-entry-modal" class="bibtex-modal" onclick="if(event.target===this)closePaperEntryModal()">
      <div class="bibtex-content paper-entry-modal-content">
        <button class="bibtex-close" onclick="closePaperEntryModal()">&times;</button>
        <h3>Add New Entry</h3>
        <form id="paper-entry-form" class="paper-entry-form">
          <input name="title" class="paper-search-input" type="text" placeholder="Title *" required />
          <input name="authors" class="paper-search-input" type="text" placeholder="Authors (comma separated)" />
          <div class="paper-entry-grid">
            <input name="year" class="paper-search-input" type="number" placeholder="Year" />
            <input name="venue" class="paper-search-input" type="text" placeholder="Venue" />
          </div>
          <div class="paper-entry-grid">
            <input name="type" class="paper-search-input" type="text" placeholder="Type (preprint/conference/journal)" />
            <input name="tags" class="paper-search-input" type="text" placeholder="Tags (comma separated)" />
          </div>
          <input name="pdf" class="paper-search-input" type="url" placeholder="PDF URL" />
          <input name="project" class="paper-search-input" type="url" placeholder="Project URL" />
          <input name="doi" class="paper-search-input" type="text" placeholder="DOI (e.g. 10.48550/arXiv.1234.5678)" />
          <textarea name="abstract" class="paper-search-input paper-entry-textarea" placeholder="Abstract"></textarea>
          <textarea name="bibtex" class="paper-search-input paper-entry-textarea" placeholder="BibTeX"></textarea>
          <div class="paper-entry-actions">
            <button type="button" class="filter-btn" onclick="closePaperEntryModal()">Cancel</button>
            <button type="submit" class="filter-btn active">Save entry</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const yearFilterEl = explorer.querySelector('#paper-year-filter');
  const tagFilterEl = explorer.querySelector('#paper-tag-filter');
  const searchInputEl = explorer.querySelector('#paper-search-input');
  const searchClearEl = explorer.querySelector('#paper-search-clear');
  const paperListEl = explorer.querySelector('#paper-list');
  const countEl = explorer.querySelector('#paper-results-count');
  const formEl = explorer.querySelector('#paper-entry-form');

  if (!yearFilterEl || !tagFilterEl || !searchInputEl || !searchClearEl || !paperListEl || !countEl || !formEl) return;

  function openEntryModal() {
    document.getElementById('paper-entry-modal')?.classList.add('active');
  }

  function rebuildFilterButtons() {
    const years = [...new Set(papers.map(p => p.year).filter(y => typeof y === 'number' && !Number.isNaN(y)))].sort((a, b) => b - a);
    const tags = [...new Set(papers.flatMap(p => p.tags || []).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    renderPaperFilterButtons(yearFilterEl, years, state);
    renderTagFilterButtons(tagFilterEl, tags, state);
    const addBtn = explorer.querySelector('#paper-add-entry-btn');
    if (addBtn) addBtn.addEventListener('click', openEntryModal);
  }
  rebuildFilterButtons();

  function applyFiltersAndRender() {
    const q = state.q.trim().toLowerCase();

    const filtered = papers.filter(p => {
      if (state.year !== 'all') {
        if (p.year !== Number(state.year)) return false;
      }

      if (state.tags.size > 0) {
        // OR semantics: show items matching at least one selected tag.
        const hasTag = p.tags?.some(t => state.tags.has(t));
        if (!hasTag) return false;
      }

      if (q) {
        const haystack = [
          p.title,
          (p.authors || []).join(' '),
          p.venue || '',
          (p.tags || []).join(' '),
          p.abstract || '',
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    countEl.textContent = `${filtered.length} paper${filtered.length === 1 ? '' : 's'}`;
    renderPaperList(paperListEl, filtered);
  }

  // Re-render whenever a filter button toggles.
  explorer.addEventListener('paper-filters-changed', applyFiltersAndRender);

  // Search
  searchInputEl.addEventListener('input', () => {
    state.q = searchInputEl.value || '';
    applyFiltersAndRender();
  });
  searchClearEl.addEventListener('click', () => {
    state.q = '';
    searchInputEl.value = '';
    applyFiltersAndRender();
  });

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(formEl);

    const title = String(formData.get('title') || '').trim();
    if (!title) return;

    const typeInput = String(formData.get('type') || '').trim().toLowerCase();
    const normalizedType = (typeInput === 'conference' || typeInput === 'journal' || typeInput === 'preprint') ? typeInput : 'preprint';

    const paper = normalizePaper({
      id: `${slugify(title)}-${Date.now()}`,
      title,
      authors: splitCommaValues(formData.get('authors')),
      year: Number(String(formData.get('year') || '').trim()) || null,
      venue: String(formData.get('venue') || '').trim(),
      type: normalizedType,
      tags: splitCommaValues(formData.get('tags')),
      abstract: String(formData.get('abstract') || '').trim(),
      links: {
        pdf: String(formData.get('pdf') || '').trim(),
        project: String(formData.get('project') || '').trim(),
        doi: String(formData.get('doi') || '').trim(),
      },
      bibtex: String(formData.get('bibtex') || '').trim(),
      custom: true,
    });

    papers.push(paper);
    papers.sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
    postPapersData = papers.slice();

    saveCustomPapersForPost(slug, papers.filter(p => p.custom));
    formEl.reset();
    closePaperEntryModal();
    rebuildFilterButtons();
    applyFiltersAndRender();
  });

  // Initial render
  applyFiltersAndRender();
}

function renderPaperFilterButtons(container, years, state) {
  container.innerHTML = `
    <button class="filter-btn ${state.year === 'all' ? 'active' : ''}" data-filter-year="all">All</button>
    ${years.map(y => `<button class="filter-btn ${String(state.year) === String(y) ? 'active' : ''}" data-filter-year="${y}">${y}</button>`).join('')}
    <button type="button" id="paper-add-entry-btn" class="filter-btn paper-add-entry-btn">
      <i class="fas fa-plus"></i> Add New Entry
    </button>
  `;

  container.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.id === 'paper-add-entry-btn') return;
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.year = btn.dataset.filterYear || 'all';
      // Note: re-render is driven by the search listener + filter buttons in initPostPaperExplorer.
      // We dispatch a custom event so the initializer can re-render without having to close over state.
      container.dispatchEvent(new CustomEvent('paper-filters-changed', { bubbles: true }));
    });
  });
}

function renderTagFilterButtons(container, tags, state) {
  if (!tags.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = tags.map(t => {
    return `<button type="button" class="filter-btn" data-filter-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`;
  }).join('');

  container.querySelectorAll('.filter-btn').forEach(btn => {
    const tag = btn.dataset.filterTag || '';
    if (state.tags.has(tag)) btn.classList.add('active');
    btn.addEventListener('click', () => {
      const tag = btn.dataset.filterTag || '';
      if (!tag) return;

      if (state.tags.has(tag)) {
        state.tags.delete(tag);
        btn.classList.remove('active');
      } else {
        state.tags.add(tag);
        btn.classList.add('active');
      }
      container.dispatchEvent(new CustomEvent('paper-filters-changed', { bubbles: true }));
    });
  });
}

function renderPaperList(container, papers) {
  container.innerHTML = papers.map((p, i) => {
    const authors = (p.authors || []).join(', ');

    const type = p.type || 'preprint';
    // The site CSS only defines specific colors for conference/journal/preprint.
    const typeClass = (type === 'conference' || type === 'journal' || type === 'preprint') ? type : 'preprint';

    const links = [];
    if (p.links?.pdf) links.push(`<a href="${escapeAttr(p.links.pdf)}" target="_blank" rel="noopener" class="pub-link" data-link-type="pdf"><i class="fas fa-file-pdf"></i> PDF</a>`);
    if (p.links?.project) links.push(`<a href="${escapeAttr(p.links.project)}" target="_blank" rel="noopener" class="pub-link" data-link-type="project"><i class="fas fa-globe"></i> Project</a>`);
    if (p.links?.doi) links.push(`<a href="https://doi.org/${escapeAttr(p.links.doi)}" target="_blank" rel="noopener" class="pub-link" data-link-type="doi"><i class="fas fa-link"></i> DOI</a>`);
    if (p.bibtex) links.push(`<button type="button" class="pub-link" onclick="showPostBibtex('${escapeAttr(p.id)}')"><i class="fas fa-quote-right"></i> BibTeX</button>`);
    const tagChips = (p.tags || []).map(t => `<span class="blog-tag">${escapeHtml(t)}</span>`).join('');

    return `
      <div class="pub-card" data-paper-id="${escapeAttr(p.id)}" style="animation-delay: ${i * 0.03}s">
        <div class="pub-card-header">
          <span class="pub-type ${typeClass}">${escapeHtml(typeClass)}</span>
          <span class="pub-title">${escapeHtml(p.title)}</span>
        </div>
        <div class="pub-authors">${escapeHtml(authors)}</div>
        ${p.venue ? `<div class="pub-venue">${escapeHtml(p.venue)}${p.year ? ` · ${p.year}` : ''}</div>` : (p.year ? `<div class="pub-year">${p.year}</div>` : '')}
        ${p.abstract ? `<div class="paper-abstract">${escapeHtml(p.abstract)}</div>` : ''}
        ${tagChips ? `<div class="blog-card-tags paper-card-tags">${tagChips}</div>` : ''}
        ${links.length ? `<div class="pub-links">${links.join('')}</div>` : ''}
      </div>
    `;
  }).join('');
}

let postPapersData = [];

async function showPostBibtex(paperId) {
  // Lazily load bibtex data from the currently rendered explorer (best-effort).
  if (!postPapersData.length) {
    const explorer = document.getElementById('paper-explorer');
    const slug = new URLSearchParams(window.location.search).get('post');
    if (!explorer || !slug) return;
    const papersJsonPath = explorer.dataset.papersJson || `./posts/${slug}/papers.json`;
    try {
      const res = await fetch(papersJsonPath);
      postPapersData = await res.json();
    } catch {
      return;
    }
  }

  const paper = postPapersData.find(p => String(p.id) === String(paperId)) || postPapersData.find(p => String(p.id || p.title) === String(paperId));
  const bibtex = paper?.bibtex ? String(paper.bibtex) : '';
  if (!bibtex) return;

  const modal = document.getElementById('post-bibtex-modal');
  const textEl = document.getElementById('post-bibtex-text');
  if (!modal || !textEl) return;

  textEl.textContent = bibtex;
  modal.classList.add('active');

  const copyBtn = document.getElementById('post-bibtex-copy-btn');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(bibtex).then(() => {
        const btn = document.getElementById('post-bibtex-copy-btn');
        if (btn) {
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy to clipboard', 2000);
        }
      });
    };
  }
}

function closePostBibtex() {
  document.getElementById('post-bibtex-modal')?.classList.remove('active');
}

function closePaperEntryModal() {
  document.getElementById('paper-entry-modal')?.classList.remove('active');
}

function normalizePaper(p) {
  return {
    id: p.id || String(Math.random()).slice(2),
    title: String(p.title || ''),
    authors: Array.isArray(p.authors) ? p.authors.map(String) : [],
    year: p.year != null ? Number(p.year) : null,
    venue: p.venue ? String(p.venue) : '',
    type: p.type ? String(p.type) : 'preprint',
    tags: Array.isArray(p.tags) ? p.tags.map(String).filter(Boolean) : [],
    abstract: p.abstract ? String(p.abstract) : '',
    links: p.links && typeof p.links === 'object' ? p.links : {},
    bibtex: p.bibtex ? String(p.bibtex) : '',
    custom: Boolean(p.custom),
  };
}

function splitCommaValues(value) {
  return String(value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function slugify(text) {
  const clean = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || 'paper';
}

function getPaperStorageKey(slug) {
  return `paper-explorer-custom:${slug}`;
}

function loadCustomPapersForPost(slug) {
  try {
    const raw = window.localStorage.getItem(getPaperStorageKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomPapersForPost(slug, papers) {
  try {
    window.localStorage.setItem(getPaperStorageKey(slug), JSON.stringify(papers));
  } catch {
    // Ignore storage failures (private mode/quota).
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(str) {
  // For our usage this is good enough since we always inject into attribute contexts.
  return escapeHtml(str);
}
