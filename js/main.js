function trackEvent(name, params) {
  if (typeof gtag === 'function') {
    gtag('event', name, params || {});
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initOutboundTracking();
  initPublications();
  initBlogTeaser();
});

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

    trackEvent('blog_post_view', {
      post_slug: slug,
      post_title: meta?.title || slug,
    });
  } catch {
    bodyEl.innerHTML = '<p style="color: var(--text-muted);">Could not load this post.</p>';
  }
}
